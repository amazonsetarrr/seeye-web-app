import { Router } from 'express';
import {
    uploadFile,
    getFile,
    downloadFile,
    deleteFile,
    upload
} from '../controllers/files.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

// All file routes require authentication
router.use(authenticate);

router.post('/upload',
    upload.single('file'),
    auditMiddleware('File', (req) => (req as any).file?.filename || 'new'),
    uploadFile
);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.delete('/:id',
    auditMiddleware('File', (req) => req.params.id),
    deleteFile
);

export default router;
