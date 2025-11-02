import mongoose from "mongoose";
import env, {EnvKey} from "./env";

export default async function connectDB() {
    mongoose.set("strictQuery", false);
    try {
        await mongoose.connect(env(EnvKey.DATABASE_URL)!);
    } catch (err) {
        console.log(err);
    }
}