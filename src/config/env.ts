import { config } from "dotenv";

config();

export enum EnvKey {
    PORT = 'port',
    SECRET_KEY = 'secretKey',
    ENV_TYPE = 'envType',
    DATABASE_URL = 'databaseURL',
    TOKEN_SECRET = 'tokenSecret',
    REDIS_URL = 'redisURL',
    OAUTH_CLIENT_ID = 'oAuthClientID',
    OAUTH_CLIENT_SECRET = 'oAuthClientSecret',
    OAUTH_CALLBACK_URL = 'oAuthCallbackUrl',
    FRONTEND_REDIRECT = 'frontendRedirect',
    STORED_SALT = 'storedSalt',
    SMTP_PASSWORD = 'smtpPassword',
    API_KEY = 'apiKey',
    DEFAULT_ADMIN_PASSWORD = 'defaultAdminPassword',
    DEFAULT_ADMIN_EMAIL = 'defaultAdminEmail',
    CLOUDINARY_CLOUD_NAME = 'cloudinaryCloudName',
    CLOUDINARY_API_KEY = 'cloudinaryApiKey',
    CLOUDINARY_API_SECRET = 'cloudinaryApiSecret',
    MAIN_API = 'mainApi',
    BATCH_SIZE = 'batchSize',
    RABBITMQ_URL='rabbitmqURL',
}

export default function env(key: EnvKey): string | undefined {
    const envValues: Record<EnvKey, string | undefined> = {
        [EnvKey.PORT]: process.env.PORT,
        [EnvKey.SECRET_KEY]: process.env.SECRET_KEY,
        [EnvKey.ENV_TYPE]: process.env.ENV_TYPE ?? 'prod',
        [EnvKey.DATABASE_URL]: process.env.DATABASE_URL,
        [EnvKey.TOKEN_SECRET]: process.env.TOKEN_SECRET,
        [EnvKey.REDIS_URL]: process.env.REDIS_URL,
        [EnvKey.OAUTH_CLIENT_ID]: process.env.OAUTH_CLIENT_ID,
        [EnvKey.OAUTH_CLIENT_SECRET]: process.env.OAUTH_CLIENT_SECRET,
        [EnvKey.OAUTH_CALLBACK_URL]: process.env.OAUTH_CALLBACK_URL,
        [EnvKey.FRONTEND_REDIRECT]: process.env.FRONTEND_REDIRECT,
        [EnvKey.STORED_SALT]: process.env.STORED_SALT,
        [EnvKey.SMTP_PASSWORD]: process.env.SMTP_PASSWORD,
        [EnvKey.API_KEY]: process.env.API_KEY,
        [EnvKey.DEFAULT_ADMIN_PASSWORD]: process.env.DEFAULT_ADMIN_PASSWORD,
        [EnvKey.DEFAULT_ADMIN_EMAIL]: process.env.DEFAULT_ADMIN_EMAIL,
        [EnvKey.CLOUDINARY_CLOUD_NAME]: process.env.CLOUDINARY_CLOUD_NAME,
        [EnvKey.CLOUDINARY_API_KEY]: process.env.CLOUDINARY_API_KEY,
        [EnvKey.CLOUDINARY_API_SECRET]: process.env.CLOUDINARY_API_SECRET,
        [EnvKey.MAIN_API]: process.env.MAIN_API,
        [EnvKey.BATCH_SIZE]: process.env.BATCH_SIZE,
        [EnvKey.RABBITMQ_URL]: process.env.RABBITMQ_URL,
    };
    return envValues[key];
}