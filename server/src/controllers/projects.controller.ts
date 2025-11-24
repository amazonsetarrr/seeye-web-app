import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../middleware/error.middleware.js';

export const listProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;

        const projects = await prisma.project.findMany({
            where: { ownerId: userId },
            include: {
                _count: {
                    select: { jobs: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

export const createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { name, description } = req.body;

        if (!name) {
            throw new BadRequestError('Project name is required');
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: userId
            }
        });

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const getProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                jobs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        jobs: true,
                        fieldMappings: true,
                        normalizationRules: true
                    }
                }
            }
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        if (project.ownerId !== userId) {
            throw new ForbiddenError('You do not have access to this project');
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;
        const { name, description } = req.body;

        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        if (project.ownerId !== userId) {
            throw new ForbiddenError('You do not have access to this project');
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description })
            }
        });

        res.json({
            success: true,
            data: updatedProject
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        if (project.ownerId !== userId) {
            throw new ForbiddenError('You do not have access to this project');
        }

        await prisma.project.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
