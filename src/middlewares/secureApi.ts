import {NextFunction, Request, Response} from "express";
import {env} from "../config";
import {EnvKey} from "../config/env";

export default function secureApi(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        res.status(401).json({
            error: true,
            message: 'API key is missing',
        });
        return;
    }

    const validApiKey: string = env(EnvKey.API_KEY)!;

    if (apiKey !== validApiKey) {
        res.status(403).json({
            error: true,
            message: 'Invalid API key',
        });
        return;
    }

    next();
}