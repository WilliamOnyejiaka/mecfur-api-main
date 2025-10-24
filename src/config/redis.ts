import Redis from 'ioredis';
import RedisStore, {RedisReply} from 'rate-limit-redis';
import env, {EnvKey} from "./env";

const redisClient = new Redis(env(EnvKey.REDIS_URL)!, {
    maxRetriesPerRequest: 10,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});

export const store = new RedisStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => redisClient.call(...args),
});

export function createStore(prefix: string = "all") {
    return new RedisStore({
        sendCommand: async (...args: string[]): Promise<RedisReply> => {
            // Use redisClient.call with explicit command and arguments
            const [command, ...rest] = args; // Destructure command and arguments
            return redisClient.call(command, ...rest) as Promise<RedisReply>;
        },
        prefix: `rate-limit:${prefix}:`, // Optional: prefix for Redis keys
    });
}

export default redisClient;
