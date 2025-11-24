import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import XLSX from 'xlsx';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype) ||
        file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Only CSV and Excel files are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
    }
});

// Parse CSV/Excel file and extract headers
async function parseFile(filePath: string): Promise<{ headers: string[]; rowCount: number }> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
        throw new BadRequestError('File is empty or could not be parsed');
    }

    const headers = Object.keys(data[0] as any);
    const rowCount = data.length;

    return { headers, rowCount };
}

// Calculate file checksum
async function calculateChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;

        if (!req.file) {
            throw new BadRequestError('No file uploaded');
        }

        const { jobId, fileType } = req.body;

        if (!fileType || !['SOURCE', 'TARGET'].includes(fileType)) {
            throw new BadRequestError('File type must be SOURCE or TARGET');
        }

        // Parse file to get headers and row count
        const { headers, rowCount } = await parseFile(req.file.path);

        // Calculate checksum
        const checksum = await calculateChecksum(req.file.path);

        // Store file metadata in database
        const file = await prisma.file.create({
            data: {
                jobId: jobId || null,
                filename: req.file.originalname,
                fileType: fileType as 'SOURCE' | 'TARGET',
                fileSize: req.file.size,
                headers,
                rowCount,
                uploadedBy: userId,
                storagePath: req.file.path,
                checksum
            }
        });

        res.status(201).json({
            success: true,
            data: file
        });
    } catch (error) {
        // Clean up file if upload failed
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};

export const getFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const file = await prisma.file.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!file) {
            throw new NotFoundError('File not found');
        }

        res.json({
            success: true,
            data: file
        });
    } catch (error) {
        next(error);
    }
};

export const downloadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const file = await prisma.file.findUnique({ where: { id } });

        if (!file) {
            throw new NotFoundError('File not found');
        }

        // Check if file exists
        await fs.access(file.storagePath);

        res.download(file.storagePath, file.filename);
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const { id } = req.params;

        const file = await prisma.file.findUnique({ where: { id } });

        if (!file) {
            throw new NotFoundError('File not found');
        }

        if (file.uploadedBy !== userId) {
            throw new BadRequestError('You can only delete your own files');
        }

        // Delete file from disk
        await fs.unlink(file.storagePath).catch(() => { });

        // Delete from database
        await prisma.file.delete({ where: { id } });

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
