import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/error.middleware.js';

export const listMappings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { projectId, jobId, isTemplate } = req.query;

        const where: any = {
            createdBy: userId
        };

        if (projectId) {
            where.projectId = projectId as string;
        }

        if (jobId) {
            where.jobId = jobId as string;
        }

        if (isTemplate !== undefined) {
            where.isTemplate = isTemplate === 'true';
        }

        const mappings = await prisma.fieldMapping.findMany({
            where,
            include: {
                project: {
                    select: { id: true, name: true }
                },
                job: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: mappings
        });
    } catch (error) {
        next(error);
    }
};

export const createMapping = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { jobId, projectId, name, mappings, isTemplate } = req.body;

        if (!name || !mappings) {
            throw new BadRequestError('Name and mappings are required');
        }

        if (!Array.isArray(mappings)) {
            throw new BadRequestError('Mappings must be an array');
        }

        const mapping = await prisma.fieldMapping.create({
            data: {
                jobId: jobId || null,
                projectId: projectId || null,
                name,
                mappings,
                isTemplate: isTemplate || false,
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            data: mapping
        });
    } catch (error) {
        next(error);
    }
};

export const getMapping = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const mapping = await prisma.fieldMapping.findUnique({
            where: { id },
            include: {
                project: true,
                job: true
            }
        });

        if (!mapping) {
            throw new NotFoundError('Mapping not found');
        }

        res.json({
            success: true,
            data: mapping
        });
    } catch (error) {
        next(error);
    }
};

export const updateMapping = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;
        const { name, mappings, isTemplate } = req.body;

        const mapping = await prisma.fieldMapping.findUnique({
            where: { id }
        });

        if (!mapping) {
            throw new NotFoundError('Mapping not found');
        }

        if (mapping.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this mapping');
        }

        const updatedMapping = await prisma.fieldMapping.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(mappings && { mappings }),
                ...(isTemplate !== undefined && { isTemplate })
            }
        });

        res.json({
            success: true,
            data: updatedMapping
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMapping = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const mapping = await prisma.fieldMapping.findUnique({
            where: { id }
        });

        if (!mapping) {
            throw new NotFoundError('Mapping not found');
        }

        if (mapping.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this mapping');
        }

        await prisma.fieldMapping.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Mapping deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
