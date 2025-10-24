import {logger, redisClient} from "../config";
import {UserType} from "../types/constants";

export default class UserCache {

    protected readonly preKey: string;
    protected readonly expirationTime: number;

    public constructor(key: UserType, expirationTime: number = 2_592_000) {
        this.preKey = key;
        this.expirationTime = expirationTime;
    }

    protected key(userId: string) {
        return `${this.preKey}:${userId}`;
    }

    public async set(userId: string, data: any) {
        const userKey = this.key(userId);
        try {
            await redisClient.set(userKey, JSON.stringify(data), "EX", this.expirationTime);
            logger.info(`🤝 ${userKey} was successfully cached`);
            return true;
        } catch (error) {
            console.error(`🛑 Failed to cache ${userKey}: `, error);
            return false;
        }
    }

    public async get(userId: string) {
        const userKey = this.key(userId);
        try {
            const user = await redisClient.get(userKey);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return null;
        }
    }

    public async delete(userId: string) {
        try {
            const userKey = this.key(userId);
            const result = await redisClient.del(userKey);
            return result === 1;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return true;
        }
    }
}