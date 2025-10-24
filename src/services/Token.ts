import jsonwebtoken from 'jsonwebtoken';
import { HttpStatus,HttpStatusMessage } from '../types/constants';

export default class Token {

    public static validateToken(token: string, types: string[], tokenSecret: string) {
        let result: any = {};
        try {
            result = jsonwebtoken.verify(token, tokenSecret);

        } catch (err: any) {
            console.error("\nError: ", err.message, "\n");

            const message = err.message[0].toUpperCase() + err.message.slice(1);
            return {
                error: true,
                message: message,
                data: {}
            };
        }

        let validTypes = true;
        if (types.includes("any")) {
            return {
                error: false,
                message: null,
                data: result
            };
        } else {
            for (const type of result.types) {
                if (!types.includes(type)) {
                    validTypes = false;
                    break;
                }
            }
        }


        return validTypes ? {
            error: false,
            message: null,
            data: result
        } : {
            error: true,
            message: HttpStatusMessage[HttpStatus.UNAUTHORIZED],
            data: {}
        }
    }

    public static createToken(secretKey: string, data: any, types: string[] = ["access"], expiresIn: string = "100y") {
        return jsonwebtoken.sign(
            { data: data, types: types },
            secretKey,
            { expiresIn: expiresIn as any }
        );
    }

    public static decodeToken(token: string): { expiresAt: number, data: any, types: string[], issuedAt: number } {
        const decoded: any = jsonwebtoken.decode(token);
        const expiresAt = decoded.exp - Math.floor(Date.now() / 1000); // Token's remaining time-to-live

        return {
            expiresAt: expiresAt,
            data: decoded.data,
            types: decoded.types,
            issuedAt: decoded.iat
        };
    }
}