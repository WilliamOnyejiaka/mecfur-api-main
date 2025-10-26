import mongoose, {Schema} from "mongoose";


const userRatingSchema = new Schema({
    mechanicId: {type: Schema.Types.ObjectId, ref: 'Mechanic', required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    comment: {type: String, default: ''},
    rating: {
        type: Number,
        required: true,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating must not exceed 10"],
    },
}, {
    timestamps: true,
});

// Indexes
userRatingSchema.index({userId: 1, mechanicId: 1}, {unique: true});
userRatingSchema.index({rating: 1});


// Update timestamp on save
userRatingSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const UserRatingModel
    = mongoose.model("UserRating", userRatingSchema);

export default UserRatingModel;
