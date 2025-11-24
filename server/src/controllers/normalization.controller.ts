import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/error.middleware.js';

export const listRules = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { projectId } = req.query;

        const where: any = {
            createdBy: userId
        };

        if (projectId) {
            where.projectId = projectId as string;
        }

        const rules = await prisma.normalizationRule.findMany({
            where,
            include: {
                project: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        next(error);
    }
};

export const createRule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { projectId, name, rules } = req.body;

        if (!projectId || !name || !rules) {
            throw new BadRequestError('Project ID, name, and rules are required');
        }

        // Verify project access
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.ownerId !== userId) {
            throw new ForbiddenError('Invalid project');
        }

        const rule = await prisma.normalizationRule.create({
            data: {
                projectId,
                name,
                rules,
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            data: rule
        });
    } catch (error) {
        next(error);
    }
};

export const getRule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const rule = await prisma.normalizationRule.findUnique({
            where: { id },
            include: {
                project: true
            }
        });

        if (!rule) {
            throw new NotFoundError('Normalization rule not found');
        }

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        next(error);
    }
};

export const updateRule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;
        const { name, rules } = req.body;

        const rule = await prisma.normalizationRule.findUnique({
            where: { id }
        });

        if (!rule) {
            throw new NotFoundError('Normalization rule not found');
        }

        if (rule.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this rule');
        }

        const updatedRule = await prisma.normalizationRule.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(rules && { rules })
            }
        });

        res.json({
            success: true,
            data: updatedRule
        });
    } catch (error) {
        next(error);
    }
};

export const deleteRule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const rule = await prisma.normalizationRule.findUnique({
            where: { id }
        });

        if (!rule) {
            throw new NotFoundError('Normalization rule not found');
        }

        if (rule.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this rule');
        }

        await prisma.normalizationRule.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Normalization rule deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
