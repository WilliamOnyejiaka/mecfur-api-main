import multer, { FileFilterCallback } from "multer";
import * as path from "path"
import { Request, Express } from "express";
import { ResourceType } from "../types/constants";

const allowedMimeTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];
const fileSize: number = 3.0 * 1024 * 1024;

const storage = multer.memoryStorage(); // TODO: Using memory storage , also add disk storage for videos
const typeError = "LIMIT_INVALID_FILE_TYPE";

const imageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error(typeError));
    }
    return cb(null, true);
};

const pdfFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype === "application/pdf") {
        return cb(null, true);
    } else {
        return cb(new Error(typeError), false);
    }
};

const videoFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith("video/")) {
        return cb(null, true);
    } else {
        return cb(new Error(typeError), false);
    }
};

const audioFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/aac"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true); // Accept file
    } else {
        return cb(new Error(typeError)); // Reject file
    }
};

const uploads = (resourceType: ResourceType, maxFiles: number = 100) => {
    let fileFilter = imageFilter;
    const fileSize = resourceType === ResourceType.IMAGE ? 3.0 * 1024 * 1024 : 50 * 1024 * 1024;
    if (resourceType == ResourceType.PDF) fileFilter = pdfFilter;
    if (resourceType === ResourceType.VIDEO) fileFilter = videoFilter;
    // if (resourceType === ResourceType.AUDIO) fileFilter = audioFilter;

    return multer({
        storage: storage,
        limits: { fileSize: fileSize, files: maxFiles },
        fileFilter: fileFilter
    });
}

export default uploads;
