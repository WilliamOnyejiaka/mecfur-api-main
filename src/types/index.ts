import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
// import { Gender } from "../models/ProfileModel";

export interface Match {
    _id: mongoose.Types.ObjectId;
    firstName?: string;
    lastName?: string;
    gender: string;
    dateOfBirth: string;
    age?: number | null;
    height?: number | null;
    photo?: { url: string; publicId: string };
    location: any;
    distance: number;
    score: number;
    sharedHobbies?: string[];
    sharedInterests?: string[];
    sharedPets?: string[];
    sharedFavoriteColors?: string[];
    sharedSpokenLanguages?: string[];
}


export interface SignUpData {
    firstName?: string;
    lastName?: string;
    bio?: string;
    email: string;
    password: string;
    phone?: string;
    longitude: string;
    latitude: string;
    dateOfBirth?: string;
    gender?: string;
    minAge?: string;
    maxAge?: string;
    whatBringsYouHere?: string;
    education?: string;
    religion?: string;
    genderInterest?: string;
    lookingFor?: string[];
    hobbies?: string[];
    interests?: string[];
    pets?: string[];
    favoriteColors?: string[];
    spokenLanguages?: string[];
    nativeLanguage?: string,
    height?: number,
    file?: any; // Adjust type based on actual file upload mechanism (e.g., Buffer, File, etc.)
}

export interface EditData {
    firstName?: string;
    lastName?: string;
    bio?: string;
    email?: string;
    phone?: string;
    longitude?: string;
    latitude?: string;
    dateOfBirth?: string;
    gender?: string;
    minAge?: string;
    maxAge?: string;
    whatBringsYouHere?: string;
    education?: string;
    religion?: string;
    genderInterest?: string;
    lookingFor?: string[];
    hobbies?: string[];
    interests?: string[];
    pets?: string[];
    favoriteColors?: string[];
    spokenLanguages?: string[];
    nativeLanguage?: string,
    height?: number,
    file?: any; // Adjust type based on actual file upload mechanism (e.g., Buffer, File, etc.)
}

// export type SignUpData = {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
//     phone?: string;
//     ip?: string;
//     file?: Express.Multer.File;
//     longitude: string;
//     latitude: string;
//     dateOfBirth: string;
//     gender: string;
//     minAge?: string;
//     maxAge?: string;
//     whatBringsYouHere?: string;
//     education?: string;
//     religion?: string;
//     genderInterest: string;
//     lookingFor: string;
// };



export interface Cache { // TODO: use this only for users
    get: (key: string) => Promise<{ error: boolean; data?: any }>;
    set: (email: string, data: any) => Promise<boolean>;
}


export interface MatchFilters {
    religion?: string;
    education?: string;
    whatBringsYouHere?: string;
    lookingFor?: string[];
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    maxDistance?: number;
    genderInterest?: string;
    hobbies?: string[];
    interests?: string[];
    pets?: string[];
    favoriteColors?: string[];
    spokenLanguages?: string[];
}

export interface UploadedImageData {
    mimeType: string;
    imageUrl: string;
    publicId: string;
    size: number;
}

export interface UploadResult {
    success: boolean;
    data?: Record<string, UploadedImageData>;
    error?: { fieldName: string; message: string }[];
    publicIds?: string[]
}

export interface UploadArrResult {
    success: boolean;
    data?: UploadedImageData[];
    error?: { fieldName: string; message: string }[];
    publicIds?: string[]
}


export type UploadedFiles = {
    publicId: string,
    size: string,
    url: string,
    mimeType: string,
    thumbnail: string | null,
    duration: string | null
};

export type FailedFiles = {
    filename: string,
    error: string
};


export type EventHandler<T> = (message: T, io: Server) => Promise<void> | void;
export const exchange = 'main_exchange';

export interface QueueConfig {
    name: string;
    durable: boolean;
    routingKeyPattern: string;
    exchange: string; // Dynamic exchange name for the queue
    handlers: Record<string, EventHandler<any>>;
}

export interface ISocket extends Socket {
    locals?: any
}