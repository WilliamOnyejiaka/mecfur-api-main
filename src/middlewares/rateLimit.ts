import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisReply } from 'rate-limit-redis';
import { Response, Request } from "express";
import Redis from 'ioredis';
import { env } from './../config';
import { createStore } from '../config/redis';

// const redisRateLimitClient = new Redis(env('redisURL')!, {
//     maxRetriesPerRequest: 10,
//     retryStrategy: (times) => Math.min(times * 50, 2000),
// });

// redisRateLimitClient.on("connecting", () => {
//     console.log("RedisRateLimitClient Connecting...");
// })

// redisRateLimitClient.on("connect", () => {
//     console.log('RedisRateLimitClient running on port - ', redisRateLimitClient.options.port);
// });

// redisRateLimitClient.on('error', (err) => {
//     console.error('RedisRateLimitClient connection error:', err);
// });

// export function createStore() {
//     const store = new RedisStore({
//         sendCommand: async (...args: string[]): Promise<RedisReply> => {
//             // Use redisClient.call with explicit command and arguments
//             const [command, ...rest] = args; // Destructure command and arguments
//             return redisRateLimitClient.call(command, ...rest) as Promise<RedisReply>;
//         },
//         prefix: 'rate-limit:', // Optional: prefix for Redis keys
//     });
//     return store;
// }

export function rateLimitHandler(message: string = "Too many requests, please try again later") {
    return (req: Request, res: Response) => {
        return res.status(429).json({
            error: true,
            message: message,
            data: {}
        });
    }
}

// Configure rate limiter with Redis store
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `windowMs`
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    store: createStore(),
    standardHeaders: true,
    legacyHeaders: false,
});

// prefix: 'rate-limit:', // Optional: prefix for Redis keys
