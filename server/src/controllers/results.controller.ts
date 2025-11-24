import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/error.middleware.js';

export const listResults = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { jobId } = req.params;
        const { type, page = '1', limit = '50' } = req.query;

        // Verify job access
        const job = await prisma.reconciliationJob.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        if (job.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this job');
        }

        const where: any = { jobId };

        if (type) {
            where.resultType = type as string;
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [results, total] = await Promise.all([
            prisma.reconciliationResult.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { compositeKey: 'asc' }
            }),
            prisma.reconciliationResult.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                results,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createResults = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { jobId } = req.params;
        const { results } = req.body;

        if (!Array.isArray(results)) {
            throw new BadRequestError('Results must be an array');
        }

        // Verify job access
        const job = await prisma.reconciliationJob.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        if (job.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this job');
        }

        // Bulk insert results
        const created = await prisma.reconciliationResult.createMany({
            data: results.map((result: any) => ({
                jobId,
                resultType: result.resultType,
                sourceData: result.sourceData || null,
                targetData: result.targetData || null,
                differences: result.differences || null,
                compositeKey: result.compositeKey,
                confidenceScore: result.confidenceScore || null
            }))
        });

        res.status(201).json({
            success: true,
            data: { count: created.count }
        });
    } catch (error) {
        next(error);
    }
};

export const exportResults = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { jobId } = req.params;

        // Verify job access
        const job = await prisma.reconciliationJob.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            throw new NotFoundError('Job not found');
        }

        if (job.createdBy !== userId) {
            throw new ForbiddenError('You do not have access to this job');
        }

        // Get all results - frontend will handle Excel generation
        const results = await prisma.reconciliationResult.findMany({
            where: { jobId }
        });

        res.json({
            success: true,
            data: {
                job,
                results
            }
        });
    } catch (error) {
        next(error);
    }
};
