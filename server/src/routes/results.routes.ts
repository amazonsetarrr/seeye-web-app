import { Router } from 'express';
import {
    listResults,
    createResults,
    exportResults
} from '../controllers/results.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/jobs/:jobId/results', listResults);
router.post('/jobs/:jobId/results', createResults);
router.get('/jobs/:jobId/results/export', exportResults);

export default router;
