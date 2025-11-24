import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from './auth.middleware.js';
import { logger } from '../utils/logger.js';

export interface AuditData {
    action: string;
    entityType: string;
    entityId: string;
    changes?: any;
}

export const auditLog = async (
    req: Request,
    auditData: AuditData
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            logger.warn('Attempted to create audit log without authenticated user');
            return;
        }

        await prisma.auditLog.create({
            data: {
                userId,
                action: auditData.action,
                entityType: auditData.entityType,
                entityId: auditData.entityId,
                changes: auditData.changes || null,
                ipAddress: req.ip || req.socket.remoteAddress || null,
                userAgent: req.headers['user-agent'] || null
            }
        });

        logger.info(`Audit log created: ${auditData.action} on ${auditData.entityType}:${auditData.entityId}`);
    } catch (error) {
        logger.error('Failed to create audit log:', error);
        // Don't throw error - audit logging failure shouldn't break the request
    }
};

// Middleware that automatically logs mutations
export const auditMiddleware = (
    entityType: string,
    getEntityId: (req: Request) => string
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json.bind(res);

        res.json = function (body: any) {
            // Only log on successful mutations (201, 200)
            if (res.statusCode === 200 || res.statusCode === 201) {
                const action = req.method === 'POST' ? 'CREATE' :
                    req.method === 'PUT' ? 'UPDATE' :
                        req.method === 'PATCH' ? 'UPDATE' :
                            req.method === 'DELETE' ? 'DELETE' : 'UNKNOWN';

                if (action !== 'UNKNOWN') {
                    auditLog(req, {
                        action,
                        entityType,
                        entityId: getEntityId(req),
                        changes: req.method !== 'DELETE' ? body : undefined
                    }).catch(err => logger.error('Audit logging failed:', err));
                }
            }

            return originalJson(body);
        };

        next();
    };
};
