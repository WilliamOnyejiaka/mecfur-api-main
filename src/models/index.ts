import {Schema} from "mongoose";

export const PhotoFieldSchema = new Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
});

