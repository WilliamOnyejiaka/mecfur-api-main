import { Request, Response, NextFunction } from 'express';
import {HttpStatus, HttpStatusMessage} from "../types/constants";
import env, {EnvKey} from "../config/env";
import TokenBlackList from "../cache/TokenBlacklist";
import Token from "../services/Token";

const verifyJWT = (types: string[], neededData: string[] = ['data']) => async (req: Request, res: Response, next: NextFunction) => {
    const tokenSecret: string = env(EnvKey.TOKEN_SECRET)!;

    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        res.status(401).json({ error: true, message: 'Missing Bearer Authorization Header' });
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Token missing"
        });
        return;
    }
    const cache = new TokenBlackList();
    const isBlacklistedResult = await cache.get(token);

    if (isBlacklistedResult.error) {
        res.status(500).json({
            error: true,
            message: HttpStatusMessage[HttpStatus.INTERNAL_SERVER_ERROR]
        });
        return;
    }

    if (isBlacklistedResult.data) {
        res.status(401).json({
            error: true,
            message: "Token is invalid"
        });
        return;
    }

    const tokenValidationResult: any = Token.validateToken(token, types, tokenSecret);

    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == HttpStatusMessage[HttpStatus.UNAUTHORIZED] ? 401 : 400;
        res.status(statusCode).json({
            error: true,
            message: tokenValidationResult.message
        });
        return;
    }

    for (let item of neededData) {
        res.locals[item] = tokenValidationResult.data[item];
    }

    res.locals['userType'] = tokenValidationResult.data['types'][0];
    next();
}

export default verifyJWT;