import {v2 as cloudinary} from 'cloudinary';
import {env} from ".";
import {EnvKey} from "./env";

cloudinary.config({
    cloud_name: env(EnvKey.CLOUDINARY_CLOUD_NAME)!,
    api_key: env(EnvKey.CLOUDINARY_API_KEY)!,
    api_secret: env(EnvKey.CLOUDINARY_API_SECRET)!
});


export default cloudinary;