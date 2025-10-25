import {Schema} from "mongoose";

export const PhotoFieldSchema = new Schema({
    url: { type: String, default:'' },
    publicId: { type: String, default:'' },
});

