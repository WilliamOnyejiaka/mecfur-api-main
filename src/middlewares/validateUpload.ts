import { Request, Response, NextFunction } from "express";
import { logger } from "../config";

const validateUpload = (fileLength: number) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        logger.warn(`⚠️  No file has been uploaded`)
        res.status(400).json({
            error: true,
            message: "No file uploaded",
            data: {}
        });
        return;
    }

    if (req.files.length > fileLength) {
        logger.warn(`⚠️ File limit exceeded! Received ${req.files.length} files.`)
        res.status(400).json({
            error: true,
            message: `⚠️ File limit exceeded! Received ${req.files.length} files.`,
            data: {}
        });
        return;
    }

    next();
};

export default validateUpload;