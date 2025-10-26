// @ts-ignore
import {body, param, query} from "express-validator";
import {handleValidationErrors, objectIdIsValid} from "../validators";
import {verifyJWT} from "../index";
import {UserType} from "../../types/constants";

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

export const nearByMechanics = [
    query('page').optional().isInt({min: 1}).withMessage("page must be an integer"),
    query('limit').optional().isInt({min: 1}).withMessage("limit must be an integer"),
    query('radius').optional().isInt({min: 1}).withMessage("radius must be an integer"),
    param('lon')
        .isFloat({min: -180, max: 180})
        .withMessage('Longitude must be a number between -180 and 180')
        .toFloat(),
    param('lat')
        .isFloat({min: -90, max: 90})
        .withMessage('Latitude must be a number between -90 and 90')
        .toFloat(),
    handleValidationErrors
];

export const createJob = [
    verifyJWT([UserType.USER]),
    // Validate issueType
    body('issueType')
        .isString()
        .notEmpty()
        .withMessage('Issue type is required and must be a string'),

    // Validate issueDescription
    body('issueDescription')
        .isString()
        .notEmpty()
        .withMessage('Issue description is required and must be a string'),

    // Validate pickupLon (longitude)
    body('pickupLon')
        .isFloat({min: -180, max: 180})
        .withMessage('Pickup longitude must be a valid number between -180 and 180'),

    // Validate pickupLat (latitude)
    body('pickupLat')
        .isFloat({min: -90, max: 90})
        .withMessage('Pickup latitude must be a valid number between -90 and 90'),

    // Validate vehicleMake
    body('vehicleMake')
        .isString()
        .notEmpty()
        .withMessage('Vehicle make is required and must be a string'),

    // Validate vehicleModel
    body('vehicleModel')
        .isString()
        .notEmpty()
        .withMessage('Vehicle model is required and must be a string'),

    // Validate vehicleYear
    body('vehicleYear')
        .isInt({min: 1900, max: new Date().getFullYear() + 1})
        .withMessage(`Vehicle year must be a valid year between 1900 and ${new Date().getFullYear() + 1}`),

    // Validate pickupAddress
    body('pickupAddress')
        .isString()
        .notEmpty()
        .withMessage('Pickup address is required and must be a string'),

    // Validate vehiclePlate
    body('vehiclePlate')
        .isString()
        .notEmpty()
        .withMessage('Vehicle plate is required and must be a string'),

    body('radius')
        .isNumeric()
        .withMessage('Radius must be a number'),

    handleValidationErrors
];