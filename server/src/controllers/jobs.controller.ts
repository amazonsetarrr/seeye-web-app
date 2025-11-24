import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../middleware/error.middleware.js';

export const listJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { projectId, status } = req.query;

        const where: any = {
            createdBy: userId
        };

        if (projectId) {
            where.project = { ownerId: userId };
            where.projectId = projectId as string;
        }

        if (status) {
            where.status = status as string;
        }

        const jobs = await prisma.reconciliationJob.findMany({
            where,
            include: {
                project: {
                    select: { id: true, name: true }
                },
                sourceFile: {
                    select: { id: true, filename: true }
                },
                targetFile: {
                    select: { id: true, filename: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: jobs
        });
    } catch (error) {
        next(error);
    }
};

export const createJob = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const {
            projectId,
            name,
            description,
            sourceFileId,
            targetFileId,
            matchStrategy,
            fuzzyThreshold
        } = req.body;

        if (!projectId || !name) {
            throw new BadRequestError('Project ID and job name are required');
        }

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.ownerId !== userId) {
            throw new ForbiddenError('Invalid project');
        }

        const job = await prisma.reconciliationJob.create({
            data: {
                projectId,
                name,
                description,
                sourceFileId,
                targetFileId,
                createdBy: userId,
                matchStrategy: matchStrategy || 'FUZZY',
                fuzzyThreshold: fuzzyThreshold || 0.8
            },
            include: {
                project: true,
                sourceFile: true,
                targetFile: true
            }
        });

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

export const getJob = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const job = await prisma.reconciliationJob.findUnique({
            where: { id },
            include: {
                project: true,
                sourceFile: true,
                targetFile: true,
                fieldMapping: true,
                _count: {
                    select: { results: true }
                }
            }
        });

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        if (job.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this job');
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

export const updateJob = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;
        const { status, summaryStats, completedAt } = req.body;

        const job = await prisma.reconciliationJob.findUnique({
            where: { id }
        });

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        if (job.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this job');
        }

        const updatedJob = await prisma.reconciliationJob.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(summaryStats && { summaryStats }),
                ...(completedAt && { completedAt: new Date(completedAt) })
            }
        });

        res.json({
            success: true,
            data: updatedJob
        });
    } catch (error) {
        next(error);
    }
};

export const deleteJob = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const job = await prisma.reconciliationJob.findUnique({
            where: { id }
        });

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        if (job.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this job');
        }

        await prisma.reconciliationJob.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
