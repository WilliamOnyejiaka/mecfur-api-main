import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisReply } from 'rate-limit-redis';
import { Response, Request } from "express";
import Redis from 'ioredis';
import { createStore } from '../config/redis';

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
