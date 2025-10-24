import mongoose from "mongoose";
import {pagination} from "../../utils";

export default class BaseService {

    public responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    /**
     * Handles MongoDB/Mongoose errors and returns a user-friendly error message and status code.
     * @param {Error} error - The error object from MongoDB/Mongoose.
     * @returns {Object} - Contains statusCode and message for the error.
     */
    public handleMongoError(error: any) {
        console.log(error);
        
        // Default error response
        let statusCode = 500;
        // let message = `An error occurred during ${operation}.`;
        let message = "Something went wrong.";


        // Handle specific Mongoose/MongoDB errors
        if (error instanceof mongoose.Error.ValidationError) {
            // Validation errors (e.g., missing required fields)
            statusCode = 400;
            message = 'Validation failed: ' + Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
        } else if (error.code === 11000 || error.name === 'MongoServerError' && error.code === 11000) {
            // Duplicate key error (e.g., unique field violation)
            statusCode = 409;
            const field = Object.keys(error.keyValue)[0];
            message = `Duplicate value for ${field}: ${error.keyValue[field]}.`;
        } else if (error instanceof mongoose.Error.CastError) {
            // Invalid ObjectId or type casting error
            statusCode = 400;
            message = `Invalid ${error.path}: ${error.value}.`;
        } else if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
            // Connection issues
            statusCode = 503;
            message = 'Database connection error. Please try again later.';
        } else if (error.name === 'DocumentNotFoundError') {
            // Document not found (specific to findOneAndUpdate, findOneAndDelete, etc.)
            statusCode = 404;
            message = 'Requested resource not found.';
        }

        return { statusCode, message };
    }

    public createPagination(page: number,limit: number,total: number){
        return pagination(page,limit,total)
    }

}