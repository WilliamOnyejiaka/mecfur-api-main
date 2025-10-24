import cors from "cors";
import http from 'http';
import express, {Application, NextFunction, Request, Response} from "express";
import morgan from "morgan";
import {env, initializeIO, logger} from ".";
import {RedisClientType} from "redis";
import {multerErrorHandler, validateJWT, verifyJWT} from "../middlewares";
import {
    auth,
    notification as notificationRoute,
    user,
    requestRoute
} from "./../routes";
import helmet from "helmet";
import {RabbitMQ} from "../services/RabbitMQ";
import { QueueName, QUEUES} from "./queues";
import {socketEvent} from "../io/events";
import {Namespaces, UserType} from "../types/constants";
import {metricsMiddleware, register} from "../utils/prometheus";
import notify from "../services/notify";
import {EnvKey} from "./env";

import {Location} from "./../services"
import {runSampleTests} from "../services/test";
import {mechanic} from "../routes";

export default async function createApp(pubClient: RedisClientType, subClient: RedisClientType) {
    const app: Application = express();
    const stream = { write: (message: string) => logger.http(message.trim()) };
    const server = http.createServer(app);
    const io = await initializeIO(server, pubClient, subClient);

    app.use(helmet());
    app.set('trust proxy', 1); // For a single proxy (e.g., Render)     
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(morgan("combined", { stream }));
    app.use(express.json());
    app.use(metricsMiddleware());


    const socketNamespace = io.of(Namespaces.BASE);
    socketNamespace.use(validateJWT([UserType.USER, UserType.MECHANIC]));
    socketEvent.initialize(socketNamespace, io);

    app.get('/api/v1/metrics', async (req, res) => {
        try {
            res.set('Content-Type', register.contentType);
            const metrics = await register.metrics();
            res.send(metrics);
        } catch (err: any) {
            res.status(500).send(err.message);
        }
    });

    // Health check endpoint
    app.get("/socket/health", async (req: Request, res: Response) => {
        try {
            // Check Redis connectivity
            const redisPing = await pubClient.ping();
            const redisConnected = redisPing === 'PONG';

            // Get Socket.IO connection counts per namespace
            const notificationConnections = (await socketNamespace.fetchSockets()).length;

            // Server health metrics
            const healthStatus = {
                status: 'healthy',
                workerId: process.pid,
                environment: env(EnvKey.ENV_TYPE),
                uptime: process.uptime(), // in seconds
                memoryUsage: process.memoryUsage(), // in bytes
                cpuUsage: process.cpuUsage(), // in microseconds
                connections: {
                    total: io.engine.clientsCount,
                    namespaces: {
                        notification: notificationConnections
                    }
                },
                redis: {
                    connected: redisConnected,
                    stats: redisConnected ? await pubClient.info('stats') : 'disconnected'
                },
                timestamp: new Date().toISOString()
            };

            res.status(200).json({
                error: false,
                message: "Health check successful",
                data: healthStatus
            });
        } catch (error) {
            console.error(`Worker ${process.pid} - Health check error:`, error);
            res.status(503).json({
                error: true,
                message: "Health check failed",
                data: {
                    status: 'unhealthy',
                    workerId: process.pid,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });
        }
    });

    app.use("/api/v1/auth", auth);
    app.use("/api/v1/users", verifyJWT([UserType.USER]), user);
    app.use("/api/v1/mechanics", verifyJWT([UserType.MECHANIC]), mechanic);
    app.use("/api/v1/users/notification", verifyJWT(["any"]), notificationRoute);
    app.use("/api/v1/requests", requestRoute);

    app.post('/api/v1/publish/:queueName/:eventType', async (req: Request, res: Response) => {
        const queueName = req.params.queueName as QueueName;
        const eventType = req.params.eventType;
        if (!QUEUES[queueName] || !QUEUES[queueName].handlers[eventType]) {
            return res.status(400).json({ error: `Invalid queue or eventType: ${queueName}/${eventType}` });
        }

        try {
            const message = { eventType, payload: req.body };
            await RabbitMQ.publishToExchange(queueName, eventType, message);
            res.json({ message: `Message sent to ${queueName} [${eventType}]`, data: message });
        } catch (err) {
            console.error(`Error publishing to ${queueName} [${eventType}]:`, err);
            res.status(500).json({ error: 'Failed to publish message' });
        }
    });

    app.get('/api/v1/test', async (req: Request, res: Response) => {
        const userId = "68cdc013137f27f7eca9cd8f";

        await notify({
            userId: userId,
            type: "like",
            data: {
                likeId: "dskd",
                userId: "user2"
            }
        });
        res.status(200).json({ message: 'Notifying user' });

    });


    app.get("/ping", (req: Request, res: Response) => {
        res.status(200).json({
            error: false,
            message: "pinging api"
        });
        return;
    });

    app.get("/api/v1/test4",async (req: Request, res: Response) => {
        // const location = new Location();
        // location.updateDriverLocation("driverId",  37.7749, -122.4194, new Date())
        const {lat,lon} = req.body;
        await runSampleTests(lat,lon);
        res.status(200).json({
            error: false,
            message: "pinging api"
        });
        return;
    });


    app.use(multerErrorHandler);
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });

    return { server, io };
}