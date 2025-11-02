import {HttpStatus, HttpStatusMessage} from '../types/constants';
import {ISocket} from '../types';
import env, {EnvKey} from "../config/env";
import TokenBlackList from "../cache/TokenBlacklist";
import Token from "../services/Token";

const validateJWT = (types: string[],neededData: string[] = ['data']) => async (socket: ISocket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token) {
        socket.emit('appError', {
            error: true,
            message: "Token missing",
            statusCode: 401
        });
        return;
    }
    const cache = new TokenBlackList();
    const isBlacklistedResult = await cache.get(token);

    if (isBlacklistedResult.error) return next({
        statusCode: 401,
        message: "User Id is missing",
        type: "MISSING_KEY"
    });


    if (isBlacklistedResult.data) return next({
        error: true,
        message: "Token is invalid",
        statusCode: 401
    });

    const tokenSecret: string = env(EnvKey.TOKEN_SECRET)!;
    const tokenValidationResult: any = Token.validateToken(token, types, tokenSecret);

    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == HttpStatusMessage[HttpStatus.UNAUTHORIZED] ? 401 : 400;
        return next({
            error: true,
            message: tokenValidationResult.message,
            statusCode: statusCode
        });
    }

    socket.locals = {};
    for (let item of neededData) {
        socket.locals[item] = tokenValidationResult.data[item];
    }
    next();
}

export default validateJWT;