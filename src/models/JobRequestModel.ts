import mongoose, {Schema} from "mongoose";

const statusEnum = ['pending', 'declined', 'accepted'];

const jobRequestSchema = new Schema({
    jobId: {type: Schema.Types.ObjectId, ref: 'Job', required: true },
    mechanicId: { type: Schema.Types.ObjectId, ref: 'Mechanic',required: true },
    status: { type: String, enum: statusEnum, required: true, default: 'pending' },
}, {
    timestamps: true,
});

// Indexes
jobRequestSchema.index({ jobId: 1, mechanicId: 1 }, { unique: true });

// Update timestamp on save
jobRequestSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const JobRequestModel
    = mongoose.model("JobRequest", jobRequestSchema);

export default JobRequestModel;
