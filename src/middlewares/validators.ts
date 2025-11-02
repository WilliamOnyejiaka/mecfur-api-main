import {body, header, param, query, validationResult} from "express-validator";
import {HttpStatus} from "../types/constants";
import mongoose from "mongoose";
import {NextFunction, Response, Request} from "express";
import emailValidator from "../validators/emailValidator";
import zipCodeValidator from "../validators/zipCodeValidator";
import numberValidator from "../validators/numberValidator";

export const errorDetails = (message: string, statusCode: number) => {
    return JSON.stringify({
        message: message,
        statusCode: statusCode
    });
}

const isValidPassword = (value: string, {req, location, path}: { req: any, location: string, path: string }) => {
    if (value.length < 5) {
        throw new Error(errorDetails("Password must be greater than 5", HttpStatus.BAD_REQUEST));
    }
    return true;
}

// const isValidPhoneNumber = (value: string) => {
//     const phoneNumberIsValid = phoneNumberValidator(value);

//     if (phoneNumberIsValid !== null) {
//         throw new Error(errorDetails(phoneNumberIsValid!, HttpStatus.BAD_REQUEST));
//     }
//     return true;
// }

const isValidEmail = (value: string) => {
    if (!emailValidator(value)) {
        throw new Error(errorDetails("Invalid email", HttpStatus.BAD_REQUEST));
    }
    return true;
}

// const emailExists = <T extends UserRepo>(repo: T) => async (value: string) => {
//     const repoResult = await repo.getUserProfileWithEmail(value);

//     if (repoResult.error) {
//         throw new Error(JSON.stringify({
//             message: repoResult.message,
//             statusCode: repoResult.type
//         }));
//     } else if (repoResult.data) {
//         throw new Error(errorDetails("Email already exists", HttpStatus.BAD_REQUEST));
//     }
//     return true;
// }

// const phoneNumberExists = <T extends UserRepo>(repo: T) => async (value: string) => {
//     const repoResult = await repo.getUserWithPhoneNumber(value);

//     if (repoResult.error) {
//         throw new Error(JSON.stringify({
//             message: repoResult.message,
//             statusCode: repoResult.type
//         }));
//     } else if (repoResult.data) {
//         throw new Error(errorDetails("Phone number already exists", HttpStatus.BAD_REQUEST));
//     }
//     return true;
// }


// const itemWithIdExists = <T extends Repo>(repo: T) => async (id: string) => {
//     const repoResult = await repo.getItemWithId(Number(id));

//     if (repoResult.error) {
//         throw new Error(JSON.stringify({
//             message: repoResult.message,
//             statusCode: repoResult.type
//         }));
//     } else if (!repoResult.data) {
//         throw new Error(errorDetails("Item does exists", HttpStatus.BAD_REQUEST));
//     }
//     return true;
// }


// const idExists = <T extends Repo>(repo: T) => async (value: number) => {
//     const repoResult = await repo.getItemWithId(Number(value));

//     if (repoResult.error) {
//         throw new Error(JSON.stringify({
//             message: repoResult.message,
//             statusCode: repoResult.type
//         }));
//     } else if (!repoResult.data) {
//         throw new Error(errorDetails(`Item with id - ${value} does not exists`, HttpStatus.BAD_REQUEST));
//     }
//     return true;
// }

const isValidZipCode = (value: string) => {
    const isValid = zipCodeValidator(value);
    if (isValid.error) {
        throw new Error(errorDetails(isValid.message!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isTokenPresent = (value: string, {req, location, path}: { req: any, location: string, path: string }) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        throw new Error(errorDetails("Missing Bearer Authorization Header", HttpStatus.UNAUTHORIZED));
    }
    if (!req.headers.authorization.split(' ')[1]) {
        throw new Error(errorDetails("Token missing", HttpStatus.UNAUTHORIZED));
    }
    return true;
}

const isValidNumber = (message: string = "Param must be an integer") => (value: string) => {
    const idResult = numberValidator(value);

    if (idResult.error) {
        throw new Error(errorDetails(message, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidBoolean = (message: string) => (value: string) => {
    if (typeof value !== "boolean") {
        throw new Error(errorDetails(message, HttpStatus.BAD_REQUEST));
    }
    return true;
}


const validateQueryNumber = (name: string) => (value: string) => {
    const numberResult = numberValidator(value);

    if (numberResult.error) {
        throw new Error(errorDetails(`${name} query param must be an integer`, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const validateObjectId = (name: string) => (value: string) => {

    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(errorDetails(`${name} be an object id`, HttpStatus.BAD_REQUEST));
    }
    return true;
}


export const passwordIsValid = body('password').custom(isValidPassword); // Custom password validation
export const objectIdIsValid = (bodyName: string) => body(bodyName).custom(validateObjectId(bodyName)); // Custom object id validation
// export const phoneNumberIsValid = body('phoneNumber').custom(isValidPhoneNumber);
export const emailIsValid = body('email').custom(isValidEmail);
// export const userEmailExists = <T extends User>(repo: T) => body('email').custom(emailExists<T>(repo));
// export const userPhoneNumberExists = <T extends UserRepo>(repo: T) => body('phoneNumber').custom(phoneNumberExists<T>(repo));
export const zipCodeIsValid = body('zip').custom(isValidZipCode);
export const tokenIsPresent = header('Authorization').custom(isTokenPresent);
export const paramNumberIsValid = (paramName: string) => param(paramName).custom(isValidNumber(`${paramName} must be an integer`));
export const bodyNumberIsValid = (bodyName: string) => body(bodyName).custom(isValidNumber(`${bodyName} must be an integer`));
// export const paramItemIsPresent = <T extends Repo>(repo: T, paramName: string) => param(paramName).custom(itemWithIdExists<T>(repo));
// export const itemIdExists = <T extends Repo>(repo: T, bodyName: string) => body(bodyName).custom(idExists<T>(repo));
export const pageQueryIsValid = query('page').custom(validateQueryNumber('page'));
export const pageSizeQueryIsValid = query('pageSize').custom(validateQueryNumber('pageSize'));
export const queryIsValidNumber = (queryName: string) => query(queryName).custom(validateQueryNumber(queryName));
export const bodyBooleanIsValid = (bodyName: string) => body(bodyName).custom(isValidBoolean(`${bodyName} must be a boolean`));
export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const msg = validationErrors.array()[0].msg;
        try {
            const error = JSON.parse(msg);
            res.status(error.statusCode).json({error: true, message: error.message});
            return;
        } catch (error) {
            res.status(400).json({error: true, message: msg});
            return;
        }
    }
    next();
}