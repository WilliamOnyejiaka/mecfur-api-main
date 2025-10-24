// @ts-ignore
import {body} from 'express-validator';
import {handleValidationErrors} from "../validators";
import {uploads} from "../index";
import {ResourceType} from "../../types/constants";
import rateLimit, {ipKeyGenerator} from "express-rate-limit";
import {createStore} from "../../config/redis";

const signUpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 successful signup attempts per hour
    skipFailedRequests: true, // Ignore failed signup attempts (e.g., 400, 409)
    statusCode: 429,
    message: {error: true, message: 'Too many successful signup attempts, please try again after 1 hour.'},
    store: createStore("signUp"),
    standardHeaders: true,
    legacyHeaders: false,
});


export const signUp = [
    uploads(ResourceType.IMAGE).single("image"),
    // Required fields
    body('email')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .isLength({max: 255})
        .withMessage('Email must be at most 255 characters')
        .normalizeEmail(), // Sanitizes email (e.g., converts to lowercase)

    body('phone')
        .isString()
        .withMessage('Phone must be a string')
        .isLength({max: 20})
        .withMessage('Phone number must be at most 20 characters')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required'),

    body('password')
        .isString()
        .withMessage('Password must be a string')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters long')
        .notEmpty()
        .withMessage('Password is required'),

    body('firstName')
        .isString()
        .withMessage('First name must be a string')
        .isLength({max: 100})
        .withMessage('First name must be at most 100 characters')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),

    body('lastName')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({max: 100})
        .withMessage('Last name must be at most 100 characters')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),
    handleValidationErrors
];

export const login = [
    body('email')
        .notEmpty()
        .withMessage('Email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

export const mechanicsValidator = [
    uploads(ResourceType.IMAGE).single("image"),
    // Personal Info
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must provide a valid email address')
        .notEmpty()
        .withMessage('Email is required'),
    body('phone')
        .isMobilePhone('any')
        .withMessage('Must provide a valid phone number')
        .notEmpty()
        .withMessage('Phone number is required'),
    body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters long'),
    body('firstName')
        .isString()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({max: 100})
        .withMessage('First name must be 100 characters or less'),
    body('lastName')
        .isString()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({max: 100})
        .withMessage('Last name must be 100 characters or less'),
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Date of birth must be a valid date'),

    // Skills & Specialization
    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array of strings')
        .custom((value: any) => value.every((skill: any) => typeof skill === 'string'))
        .withMessage('Each skill must be a string'),
    body('yearsExperience')
        .isInt({min: 0})
        .withMessage('Years of experience must be a non-negative integer')
        .toInt(),
    body('bio')
        .optional()
        .isString()
        .withMessage('Bio must be a string'),

    // Location & Availability
    body('baseCity')
        .isString()
        .notEmpty()
        .withMessage('Base city is required')
        .isLength({max: 100})
        .withMessage('Base city must be 100 characters or less'),
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be a number between -180 and 180')
        .toFloat(),
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be a number between -90 and 90')
        .toFloat(),
    body('currentAddress')
        .optional()
        .isString()
        .withMessage('Current address must be a string'),
    handleValidationErrors

];
