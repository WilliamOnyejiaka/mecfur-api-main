import mongoose, { Document, Model, Schema } from "mongoose";
import {PhotoFieldSchema} from "./index";

const notificationTypeEnum = ['system', 'request', 'job_accepted', 'job_cancelled', 'job_completed'];
const notificationStatusEnum = ['pending', 'sent', 'failed'];
const notificationPriorityEnum = ['low', 'normal', 'high'];

// Users Schema
const userSchema = new Schema({
    email: { type: String, required: true,maxlength: 255 },
    phone: { type: String, required: true,maxlength: 20 },
    password: { type: String, required: true },
    firstName: { type: String, required: true, maxlength: 100 },
    lastName: { type: String, required: true, maxlength: 100 },
    profilePicture: { type: PhotoFieldSchema },
    isActive: { type: Boolean, required: true, default: true },
    isVerified: { type: Boolean, required: true, default: false },
    lastActive: { type: Date, required: true, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Helper validator for array limits
function arrayLimit(limit: number) {
    return (val: string[]) => val.length <= limit;
}

// Update timestamp on save
userSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
