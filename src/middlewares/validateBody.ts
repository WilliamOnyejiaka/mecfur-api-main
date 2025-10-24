import { Request, Response, NextFunction } from "express";
import { bodyValidator } from "../validators";

const validateBody = (neededAttributes: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const validationResponse = bodyValidator(
        req.body,
        neededAttributes
    );

    validationResponse["error"]
        ? (() => res.status(400).json(validationResponse))()
        : next();
};

export default validateBody;