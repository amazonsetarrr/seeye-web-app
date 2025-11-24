import { Router } from 'express';
import {
    listMappings,
    createMapping,
    getMapping,
    updateMapping,
    deleteMapping
} from '../controllers/mappings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

// All mapping routes require authentication
router.use(authenticate);

router.get('/', listMappings);
router.post('/',
    auditMiddleware('FieldMapping', (req) => req.body.id || 'new'),
    createMapping
);
router.get('/:id', getMapping);
router.put('/:id',
    auditMiddleware('FieldMapping', (req) => req.params.id),
    updateMapping
);
router.delete('/:id',
    auditMiddleware('FieldMapping', (req) => req.params.id),
    deleteMapping
);

export default router;
