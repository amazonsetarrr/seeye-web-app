import { Router } from 'express';
import {
    listJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob
} from '../controllers/jobs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

// All job routes require authentication
router.use(authenticate);

router.get('/', listJobs);
router.post('/',
    auditMiddleware('ReconciliationJob', (req) => req.body.id || 'new'),
    createJob
);
router.get('/:id', getJob);
router.put('/:id',
    auditMiddleware('ReconciliationJob', (req) => req.params.id),
    updateJob
);
router.delete('/:id',
    auditMiddleware('ReconciliationJob', (req) => req.params.id),
    deleteJob
);

export default router;
