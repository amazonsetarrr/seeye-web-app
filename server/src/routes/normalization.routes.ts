import { Router } from 'express';
import {
    listRules,
    createRule,
    getRule,
    updateRule,
    deleteRule
} from '../controllers/normalization.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', listRules);
router.post('/',
    auditMiddleware('NormalizationRule', (req) => req.body.id || 'new'),
    createRule
);
router.get('/:id', getRule);
router.put('/:id',
    auditMiddleware('NormalizationRule', (req) => req.params.id),
    updateRule
);
router.delete('/:id',
    auditMiddleware('NormalizationRule', (req) => req.params.id),
    deleteRule
);

export default router;
