import { Router } from 'express';
import {
    listProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject
} from '../controllers/projects.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', listProjects);
router.post('/',
    auditMiddleware('Project', (req) => req.body.id || 'new'),
    createProject
);
router.get('/:id', getProject);
router.put('/:id',
    auditMiddleware('Project', (req) => req.params.id),
    updateProject
);
router.delete('/:id',
    auditMiddleware('Project', (req) => req.params.id),
    deleteProject
);

export default router;
