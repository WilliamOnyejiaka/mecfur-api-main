import rateLimit from "express-rate-limit";
import { ResourceType } from "../../types/constants";
import { createStore } from "../../config/redis";
import { body } from "express-validator";
import {handleValidationErrors} from "../validators";
import uploads from "../multer";

// Configure rate limiter for GET requests
const getLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 100 successful GET requests per IP
    skipFailedRequests: true, // Ignore failed GET requests (e.g., 404, 400)
    message: { error: true, message: 'Too many successful GET requests, please try again after 10 minutes.' },
    store: createStore(),
    // keyGenerator: (req: Request): string => req.ip, // Use IP for GET requests
    standardHeaders: true,
    legacyHeaders: false,
});


const validateLocation = [
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];
export const updateLocation = [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

export const editImages = [
    uploads(ResourceType.IMAGE, 6).array("images"),
];

export const editProfile = [
    uploads(ResourceType.IMAGE).single("image"),
    handleValidationErrors
];

export const updatePassword = [
    body('newPassword')
        .isString()
        .notEmpty()
        .withMessage('newPassword is required')
        .isLength({min: 8})
        .withMessage('newPassword must be at least 8 characters long'),
    body('password')
        .isString()
        .notEmpty()
        .withMessage('password is required'),
    handleValidationErrors
]