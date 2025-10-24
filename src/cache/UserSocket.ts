import { logger, redisClient } from "../config";
import { UserType } from "../types/constants";

export default class UserSocket {

    protected readonly preKey: string;
    protected readonly expirationTime: number;

    public constructor(expirationTime: number = 2_592_000) {
        this.preKey = `socket`;
        this.expirationTime = expirationTime;
    }

    protected key(userType: UserType, userId: string) {
        return `${userType}-${this.preKey}:${userId}`;
    }

    public async set(userType: UserType, userId: string) {
        try {
            const userKey = this.key(userType, userId);
            await redisClient.set(userKey, userId);
            logger.info(`🤝 ${userKey} was successfully cached`);
            return true;
        } catch (error) {
            logger.error(`🛑 Failed to store ${this.preKey} - ${userId}`);
            console.log(`Failed to cache ${this.preKey}: `, error);
            return false;
        }
    }

    public async get(userType: UserType, userId: string) {
        const userKey = this.key(userType, userId);
        try {
            const data = await redisClient.get(userKey);
            return data;
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return "";
        }
    }

    public async delete(userType: UserType, userId: string) {
        try {
            const userKey = this.key(userType, userId);
            const result = await redisClient.del(userKey);
            return result === 1;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return true;
        }
    }
}