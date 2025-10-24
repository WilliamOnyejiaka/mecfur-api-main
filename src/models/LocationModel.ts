import mongoose, {Document, Model, Schema} from "mongoose";

// Mechanics Schema
const mechanicLocationSchema = new Schema({
        mechanicId: {type: Schema.Types.ObjectId, ref: 'Mechanic', required: true},
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
        s2CellId: {type: String, default: ""},
    },
    {
        timestamps: true,
    });

mechanicLocationSchema.index({location: "2dsphere"});
mechanicLocationSchema.index({s2CellId: 1});


// Update timestamp on save
mechanicLocationSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const MechanicLocationModel = mongoose.model("MechanicLocation", mechanicLocationSchema);

export default MechanicLocationModel;
