import redisClient from "../config/redis";

export default class TaskLock {

    public constructor(private LOCK_KEY: string, private expires: number) { }

    private async toggleLock(value: number) {
        try {
            await redisClient.set(this.LOCK_KEY, value, 'EX', this.expires);
            return true;
        } catch (error) {
            console.error('Failed to lock outbox process key: ', error);
            return false;
        }
    }

    public async isLocked() {
        try {
            const value = await redisClient.get(this.LOCK_KEY);
            return value == '1';
        } catch (error) {
            console.error('Failed to lock outbox process key: ', error);
            return true;
        }
    }


    public async lock() {
        return await this.toggleLock(1);
    }

    public async unlock() {
        return await this.toggleLock(0);
    }
}