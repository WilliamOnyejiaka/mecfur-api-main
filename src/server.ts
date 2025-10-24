import { connectDB, createApp, redisClient } from "./config";
import { env } from "./config";
import cron from "node-cron";
import mongoose from "mongoose";
import { RabbitMQ } from "./services/RabbitMQ";
import { QUEUES, QueueName } from "./config/queues";
import { ping, processOutbox } from "./handlers/cron-jobs";
import { createClient, RedisClientType } from "redis";
import { EnvKey } from "./config/env";


const PORT = env(EnvKey.PORT)!;

async function connectRedisClients() {
    const pubClient: RedisClientType = createClient({url: env(EnvKey.REDIS_URL)!});
    const subClient: RedisClientType = pubClient.duplicate();

    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        console.log('Successfully connected to Redis for both pub and sub clients');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        return { pubClient, subClient };
    }

    return { pubClient, subClient };
}

(async () => {

    redisClient.on("connecting", () => {
        console.log("Redis Connecting...");
    })

    redisClient.on("connect", () => {
        console.log('Redis running on port - ', redisClient.options.port);
    });

    redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    // const pubClient: RedisClientType = createClient({url: env(EnvKey.REDIS_URL)!});
    // const subClient: RedisClientType = pubClient.duplicate();
    // await Promise.all([pubClient.connect(), subClient.connect()]);

    const { pubClient, subClient } = await connectRedisClients();

    const { server: app, io } = await createApp(pubClient, subClient);

    try{
        await RabbitMQ.connect();
        for (const queueName of Object.keys(QUEUES) as QueueName[]) await RabbitMQ.startConsumer(queueName, io);
    }catch (error) {
        console.error("Failed to connect to rabbitmq:", error);
    }

    await connectDB();
    mongoose.connection.once('open', () => console.log("✅ Connected to database"));

    app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));

})();

cron.schedule('*/10 * * * *', ping);
// cron.schedule('*/30 * * * * *', processOutbox);