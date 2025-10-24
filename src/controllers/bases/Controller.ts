import { Request, Response } from "express";
import { validationResult, ValidationError, Result } from "express-validator";

export default class Controller {

    public static handleValidationErrors(res: Response, validationErrors: Result<ValidationError>): void {
        const msg = validationErrors.array()[0].msg;
        try {
            const error = JSON.parse(msg);
            res.status(error.statusCode).json({ error: true, message: error.message });
        } catch (error) {
            res.status(400).json({ error: true, message: msg });

        }
    }

    public static handleValidationError(req: Request, res: Response): void {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const error = JSON.parse(validationErrors.array()[0].msg);
            res.status(error.statusCode).json({ error: true, message: error.message });
            return;
        }
    }

    public static response(res: Response, responseData: {
        statusCode: number, json: {
            error: boolean;
            message: string | null;
            data: any;
        }
    }) {
        res.status(responseData.statusCode).json(responseData.json);
    }
}