import { Schema, model, Document } from "mongoose";

const OutboxSchema = new Schema(
    {
        queueName: {
            type: String,
            required: true,
            index: true,
        },
        eventType: {
            type: String,
            required: true,
            index: true,
        },
        payload: {
            type: Object,
            required: true,
        },
        status: {
            type: String,
            enum: ["published", "failed"],
            default: "failed",
            index: true,
        },
        retries: {
            type: Number,
            default: 0,
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Optional: automatically expire old published events
OutboxSchema.index(
    { processedAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 7 } // 7 days
);

export const OutboxModel = model("Outbox", OutboxSchema);
