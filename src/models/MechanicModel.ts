import mongoose, { Document, Model, Schema } from "mongoose";
import {PhotoFieldSchema} from "./index";

// Enums
const verificationStatusEnum = ['pending', 'approved', 'rejected'];

// Mechanics Schema
const mechanicSchema = new Schema({
    email: { type: String, required: true, maxlength: 255 },
    phone: { type: String, required: true, maxlength: 20 },
    password: { type: String, required: true },
    firstName: { type: String, required: true, maxlength: 100 },
    lastName: { type: String, required: true, maxlength: 100 },
    profilePicture: { type: PhotoFieldSchema },
    dateOfBirth: { type: Date },
    skills: { type: [String], required: true, default: [] },
    yearsExperience: { type: Number, required: true, default: 0 },
    bio: { type: String },
    baseCity: { type: String, required: true, maxlength: 100 },
    location: {
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
    currentAddress: { type: String },
    isOnline: { type: Boolean, required: true, default: false },
    isAvailable: { type: Boolean, required: true, default: true },
    isVerified: { type: Boolean, required: true, default: false },
    verificationStatus: { type: String, enum: verificationStatusEnum, required: true, default: 'pending' },
    verificationNotes: { type: String },
    verifiedAt: { type: Date },
    isActive: { type: Boolean, required: true, default: true },
    isSuspended: { type: Boolean, required: true, default: false },
    suspensionReason: { type: String },
    lastActive: { type: Date, required: true, default: Date.now },
}, {
    timestamps: true,
});

// Indexes
mechanicSchema.index({ email: 1 }, { unique: true });
mechanicSchema.index({ phone: 1 }, { unique: true, sparse: true });
mechanicSchema.index({ isAvailable: 1 });
mechanicSchema.index({ isOnline: 1 });
mechanicSchema.index({ location: "2dsphere" });


// Update timestamp on save
mechanicSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const MechanicModel = mongoose.model("Mechanic", mechanicSchema);

export default MechanicModel;
