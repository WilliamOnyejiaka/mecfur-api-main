import mongoose, {Schema} from "mongoose";
import {UserType} from "../types/constants";
import {PhotoFieldSchema} from "./index";

const jobStatusEnum = ['pending', 'searching', 'accepted', 'mechanic_enroute', 'in_progress', 'completed', 'cancelled'];
const urgencyEnum = ['low', 'normal', 'high', 'emergency'];
const cancelledByEnum = [UserType.USER, UserType.MECHANIC];

const jobSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mechanicId: { type: Schema.Types.ObjectId, ref: 'Mechanic' },
    issueType: { type: String, required: true, maxlength: 50 },
    issueDescription: { type: String, required: true },
    urgency: { type: String, enum: urgencyEnum, required: true, default: 'normal' },
    pickupLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    pickupAddress: { type: String, required: true },
    destinationLocation: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        },
    },
    destinationAddress: { type: String },
    status: { type: String, enum: jobStatusEnum, required: true, default: 'pending' },
    requestedAt: { type: Date, required: true, default: Date.now },
    acceptedAt: { type: Date },
    arrivedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    estimatedArrival: { type: Date },
    estimatedDuration: { type: Number },
    cancelledBy: { type: String, enum: cancelledByEnum },
    cancellationReason: { type: String },
    vehicleMake: { type: String, maxlength: 50 },
    vehicleModel: { type: String, maxlength: 50 },
    vehicleYear: { type: Number },
    vehiclePlate: { type: String, maxlength: 20 },
    photoUrls: { type: [PhotoFieldSchema], default: [] },
}, {
    timestamps: true
});

jobSchema.index({ userId: 1});
jobSchema.index({ mechanicId: 1});
jobSchema.index({ status: 1});
jobSchema.index({ pickupLocation: "2dsphere" });
jobSchema.index({ destinationLocation: "2dsphere" });

jobSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const JobModel = mongoose.model("Job", jobSchema);

export default JobModel;
