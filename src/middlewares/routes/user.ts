import rateLimit from "express-rate-limit";
import { validateBody, uploads } from "../";
import { ResourceType } from "./../../types/enums";
import { createStore } from "../../config/redis";
import { body } from "express-validator";
import { emailValidator } from "../../validators";

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
    body('dateOfBirth')
        .optional()
        .isString()
        .withMessage('Date of birth must be a string'),
    body('gender')
        .optional()
        .trim()
        .isString()
        .toLowerCase()
        .withMessage('Gender must be a string'),
    body('minAge')
        .optional()
        .isString()
        .withMessage('Minimum age must be a string'),
    body('maxAge')
        .optional()
        .isString()
        .withMessage('Maximum age must be a string'),
    body('whatBringsYouHere')
        .optional()
        .trim()
        .isString()
        .withMessage('What brings you here must be a string'),
    body('education')
        .optional()
        .trim()
        .isString()
        .withMessage('Education must be a string'),
    body('religion')
        .optional()
        .trim()
        .isString()
        .withMessage('Religion must be a string'),
    body('genderInterest')
        .optional()
        .trim()
        .isString()
        .toLowerCase()
        .withMessage('Gender interest must be a string'),
    body('lookingFor')
        .optional()
        .isArray()
        .withMessage('Looking for must be an array')
        .custom((value) => {
            if (value && Array.isArray(JSON.parse(value))) {
                return value.length <= 10;
            }
            return true; // Allow empty or undefined
        })
        .withMessage('Looking for cannot exceed 10 items'),
    body('hobbies')
        .optional({ nullable: true })
        .isArray()
        .withMessage('Hobbies must be an array')
        .custom((value) => {
            if (value && Array.isArray(value)) {
                return value.length <= 20;
            }
            return true; // Allow empty or undefined
        })
        .withMessage('Hobbies cannot exceed 20 items'),
    body('interests')
        .optional({ nullable: true })
        .isArray()
        .withMessage('Interests must be an array')
        .custom((value) => {
            if (value && Array.isArray(value)) {
                return value.length <= 20;
            }
            return true; // Allow empty or undefined
        })
        .withMessage('Interests cannot exceed 20 items'),
    body('pets')
        .optional({ nullable: true })
        .isArray()
        .withMessage('Pets must be an array')
        .custom((value) => {
            if (value && Array.isArray(value)) {
                return value.length <= 5;
            }
            return true; // Allow empty or undefined
        })
        .withMessage('Pets cannot exceed 5 items'),
    body('favoriteColors')
        .optional({ nullable: true })
        .isArray()
        .withMessage('Favorite colors must be an array')
        .custom((value) => {
            if (value && Array.isArray(value)) {
                return value.length <= 10;
            }
            return true; // Allow empty or undefined
        })
        .withMessage('Favorite colors cannot exceed 10 items'),
    body('spokenLanguages')
        .optional({ nullable: true })
        .isArray()
        .withMessage('Spoken languages must be an array')
        .custom((value) => {
            if (value && Array.isArray(value)) {
                return value.length <= 10;
            }
            return true; // Allow empty or undefined
        })
        .withMessage('Spoken languages cannot exceed 10 items'),
    body('nativeLanguage')
        .optional()
        .isString()
        .withMessage('Native language must be a string'),
    body('height')
        .optional()
        .isNumeric()
        .withMessage('Height must be a number'),
    ...validateLocation
];
