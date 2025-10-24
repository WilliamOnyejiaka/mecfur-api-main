import mongoose, { Schema } from "mongoose";
import {notificationType} from "../types/constants";

const NotificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "Mechanic",
            index: true,
        },
        type: {
            type: String,
            enum: notificationType,
            default: "system",
            index: true,
        },
        data: {
            type: Object,
            default: {},
        },
        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending",
            index: true,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal",
        }
    },
    {
        timestamps: true,
    }
);

// ✅ Optional: TTL index for auto-expiring temporary notifications
// NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const NotificationModel = mongoose.model(
    "Notification",
    NotificationSchema
);
