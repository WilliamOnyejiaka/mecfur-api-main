// @ts-ignore
import {body, param, query} from "express-validator";
import {handleValidationErrors, objectIdIsValid} from "../validators";
import {UserType} from "../../types/constants";
import verifyJWT from "../verifyJWT";

export const makeRequest = [
    verifyJWT([UserType.USER]),
    objectIdIsValid("mechanicId"),
    objectIdIsValid("jobId"),
    handleValidationErrors
];

export const acceptJob = [
    verifyJWT([UserType.MECHANIC]),
    // objectIdIsValid("requestId"),
    handleValidationErrors
];

export const rateMechanic = [
    verifyJWT([UserType.USER]),
    objectIdIsValid("mechanicId"),

    body('comment')
        .isString()
        .optional()
        .withMessage('comment must be a string'),

    body('rating')
        .isFloat({min: 1, max: 10})
        .withMessage('Rating must be at least 1 and not exceed 10')
        .toInt(),
    handleValidationErrors
];

export const rateUser = [
    verifyJWT([UserType.MECHANIC]),
    objectIdIsValid("userId"),

    body('comment')
        .isString()
        .optional()
        .withMessage('comment must be a string'),

    body('rating')
        .isFloat({min: 1, max: 10})
        .withMessage('Rating must be at least 1 and not exceed 10')
        .toInt(),
    handleValidationErrors
];
