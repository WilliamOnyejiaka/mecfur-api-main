import mongoose from "mongoose";
import {OutboxModel} from "../models/Outbox";
import BaseService from "./bases/BaseService";
import {RabbitMQ} from "./RabbitMQ";
import env, {EnvKey} from "../config/env";
import TaskLock from "../cache/TaskLock";
import logger from "../config/logger";

export default class Outbox {

    private static service = new BaseService();
    private static BATCH_SIZE = parseInt(env(EnvKey.BATCH_SIZE)!) || 500;
    private static LOCK_KEY = "processingOutbox";
    private static LOCK_EXPIRES = 60;
    private static taskLock = new TaskLock(this.LOCK_KEY, this.LOCK_EXPIRES);

    public static async add(queueName: string, eventType: string, payload: Object) {
        try {
            await OutboxModel.create({ queueName, eventType, payload });
            logger.warn(`Added ${eventType} to Outbox`);
            return true;
        } catch (error) {
            Outbox.service.handleMongoError(error);
            logger.error('Failed to add to Outbox');
            return false;
        }
    }

    public static async process(batchSize: number = Outbox.BATCH_SIZE) {
        if (await Outbox.taskLock.isLocked()) {
            logger.info('Outbox is locked, skipping processing');
            return;
        }

        const locked = await Outbox.taskLock.lock();
        if (!locked) {
            logger.warn('Failed to acquire outbox lock');
            return;
        }

        let cursor;

        try {
            cursor = OutboxModel.find({ status: "failed" })
                .lean()
                .batchSize(batchSize)
                .cursor();

            const batch: mongoose.Types.ObjectId[] = [];

            for await (const doc of cursor) {
                const published = await RabbitMQ.publishToExchange(
                    doc.queueName,
                    doc.eventType,
                    doc.payload
                );

                if (published) {
                    batch.push(doc._id);
                } else {
                    logger.warn(`❌ Failed to publish event ${doc._id}`);
                }

                // Process and update every `batchSize` items
                if (batch.length >= batchSize) {
                    await Outbox.markPublished(batch);
                    batch.length = 0; //? Clearing the batch array same as `batch.splice(0)`
                }
            }

            // Update any remaining uncommitted events
            if (batch.length > 0) await Outbox.markPublished(batch);
            logger.info("✅ Finished processing all failed outbox events");
        } catch (error) {
            Outbox.service.handleMongoError(error);
            logger.error("❌ Outbox processing failed ");
        } finally {
            if (cursor) await cursor.close();
            await Outbox.taskLock.unlock();
        }
    }

    private static async markPublished(ids: mongoose.Types.ObjectId[]) {
        try {
            await OutboxModel.bulkWrite(
                ids.map((id) => ({
                    updateOne: {
                        filter: { _id: id },
                        update: {
                            $set: { status: "published", publishedAt: new Date() },
                        },
                    },
                }))
            );

            logger.info(`✅ Marked ${ids.length} outbox events as processed`);
        } catch (error) {
            Outbox.service.handleMongoError(error);
            logger.error("❌ Failed to mark outbox events as processed ");
        }
    }
}