import mongoose from "mongoose";
import BaseService from "./bases/BaseService";
import UserModel from "./../models/UserModel";
import {calculateProfileCompletion} from "../utils";
import {EditData, FailedFiles, UploadArrResult, UploadedFiles} from "../types";
import {CdnFolders, ResourceType, UserType} from "../types/constants";
import {Cloudinary, ImageService} from ".";
import {emailValidator} from "../validators";
import {UserCache, UserSocket} from "../cache";

export default class User extends BaseService {

    private readonly socketCache = new UserSocket();
    private readonly userCache: UserCache = new UserCache(UserType.USER);

    public async setOnline(userId: string) {
        return await this.socketCache.set(UserType.USER, userId);
    }

    public async userIsOnline() {

    }

    public async profile(userId: mongoose.Types.ObjectId) {
        try {
            let user;
            user = await this.userCache.get(userId.toString());
            if (user) return this.responseData(200, false, "User has been retrieved successfully", (user));

            user = await UserModel.findById(userId).select("-password");

            if (user) {
                await this.userCache.set(user._id.toString(), user);
                return this.responseData(200, false, "User has been retrieved successfully", user);
            }
            return this.responseData(404, true, "User was not found");
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    // public async editProfile(userId: string, editData: EditData) {
    //     try {
    //         const user = await UserModel.findById(userId);
    //         if (!user) return this.responseData(404, true, "User was not found");
    //
    //         if (editData.email) {
    //             if (!emailValidator(editData.email)) return this.responseData(400, true, "Invalid email");
    //             const emailExists = await UserModel.findOne({ email: editData.email }).select("email");
    //             if (emailExists) return this.responseData(400, true, "New email already exists");
    //         }
    //
    //         if (editData.phone) {
    //             const phoneExists = await UserModel.findOne({ phone: editData.phone }).select("phone");
    //             if (phoneExists) return this.responseData(400, true, "New phone number already exists");
    //         }
    //
    //         let photo = user.photo;
    //         // * Checking if user profile picture exists
    //         if (editData.file) {
    //             const cloudinary = new Cloudinary();
    //
    //             let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];
    //             ({ uploadedFiles, failedFiles, publicIds } = await cloudinary.upload([editData.file], ResourceType.IMAGE, CdnFolders.PROFILEPICTURE));
    //             if (failedFiles?.length > 0) return this.responseData(500, true, "File upload failed", failedFiles);
    //             photo = {
    //                 url: uploadedFiles[0]?.url,
    //                 publicId: uploadedFiles[0]?.publicId,
    //             };
    //
    //             const publicId = user.photo?.publicId;
    //             user.photo?.publicId ?? await cloudinary.delete(publicId!);
    //         }
    //
    //         let userData = {
    //             firstName: editData.firstName?.trim() || user.firstName,
    //             lastName: editData.lastName?.trim() || user.lastName,
    //             email: editData.email || user.email,
    //             phone: editData.phone?.trim() || user.phone,
    //             bio: editData.bio?.trim() || "",
    //             location: {
    //                 type: "Point",
    //                 coordinates: [Number(editData.longitude ?? user.location?.coordinates[0]), Number(editData.latitude ?? user.location?.coordinates[1])]
    //             },
    //             lastLocationUpdate: editData.longitude || editData.latitude ? new Date().toISOString() : user.lastLocationUpdate,
    //             photo: photo,
    //             dateOfBirth: editData.dateOfBirth || user.dateOfBirth,
    //             gender: editData.gender?.trim().toLowerCase() || user.gender,
    //             minAge: editData.minAge || user.minAge,
    //             maxAge: editData.maxAge || user.maxAge,
    //             whatBringsYouHere: editData.whatBringsYouHere?.trim() || user.whatBringsYouHere,
    //             education: editData.education?.trim() || user.education,
    //             religion: editData.religion?.trim() || user.religion,
    //             genderInterest: editData.genderInterest?.trim().toLowerCase() || user.genderInterest,
    //             lookingFor: Array.isArray(editData.lookingFor) ? editData.lookingFor.slice(0, 10) : user.lookingFor, // Respect schema limit
    //             hobbies: Array.isArray(editData.hobbies) ? editData.hobbies.slice(0, 20) : user.hobbies, // Respect schema limit
    //             interests: Array.isArray(editData.interests) ? editData.interests.slice(0, 20) : user.interests, // Respect schema limit
    //             pets: Array.isArray(editData.pets) ? editData.pets.slice(0, 5) : user.pets, // Respect schema limit
    //             favoriteColors: Array.isArray(editData.favoriteColors) ? editData.favoriteColors.slice(0, 10) : user.favoriteColors, // Respect schema limit
    //             spokenLanguages: Array.isArray(editData.spokenLanguages) ? editData.spokenLanguages.slice(0, 10) : user.spokenLanguages, // Respect schema limit
    //             nativeLanguage: editData.nativeLanguage || user.nativeLanguage,
    //             height: editData.height || user.height,
    //             completionPercentage: user.completionPercentage
    //         };
    //
    //         userData.completionPercentage = calculateProfileCompletion(userData);
    //
    //         // Mongoose update query
    //         const updatedUser = await UserModel.findByIdAndUpdate(
    //             userId,
    //             { $set: userData },
    //             { new: true, runValidators: true }
    //         ).select("-password");
    //
    //         if (!updatedUser) return this.responseData(404, true, "User was not found");
    //
    //         await this.userCache.set(userId,updatedUser);
    //         return this.responseData(200, false, "User was updated successfully", updatedUser);
    //     } catch (error) {
    //         const { statusCode, message } = this.handleMongoError(error);
    //         return this.responseData(statusCode, true, message);
    //     }
    // }
    //
    // public async updateLocation(userId: string, longitude: number, latitude: number) {
    //     try {
    //         const updatedUser = await UserModel.findByIdAndUpdate(
    //             userId,
    //             {
    //                 $set: {
    //                     location: {
    //                         type: "Point",
    //                         coordinates: [longitude, latitude],
    //                     },
    //                 }
    //             },
    //             { new: true, runValidators: true }
    //         ).select("location");
    //
    //         if (!updatedUser) return this.responseData(404, true, "User was not found");
    //         return this.responseData(200, false, "User's location was updated successfully");
    //     } catch (error) {
    //         const { statusCode, message } = this.handleMongoError(error);
    //         return this.responseData(statusCode, true, message);
    //     }
    // }
    //
    // public async editImages(userId: string, files: Express.Multer.File[]) {
    //     try {
    //         const imageService = new ImageService();
    //
    //         const user = await UserModel.findById(userId);
    //         if (!user) return this.responseData(404, true, "User was not found");
    //
    //         const maxImages = Array.isArray(user.images) ? (6 - user.images.length) : 6;
    //
    //         if (files.length > maxImages) return this.responseData(400, true, "Images has exceeded its max slot, only 6 images allowed");
    //         const uploadResult: UploadArrResult = await imageService.uploadImagesArr(files, CdnFolders.USERPICTURES);
    //         if (Array.isArray(uploadResult.data) && uploadResult.data?.length > 0) {
    //             const images = uploadResult.data.map((image) => {
    //                 return { url: image.imageUrl, publicId: image.publicId }
    //             });
    //             const imageData = Array.isArray(user.images) ? [...user.images, ...images] : images
    //             const updatedUser = await UserModel.findByIdAndUpdate(
    //                 userId,
    //                 {
    //                     $set: {
    //                         images: imageData
    //                     }
    //                 },
    //                 { new: true, runValidators: true }
    //             ).select("images");
    //             if (!updatedUser) return this.responseData(404, true, "User was not found");
    //             return this.responseData(200, false, "User's images were updated successfully", imageData);
    //         }
    //         return this.responseData(500, true, "Files failed to upload", uploadResult.error);
    //     } catch (error) {
    //         const { statusCode, message } = this.handleMongoError(error);
    //         return this.responseData(statusCode, true, message);
    //     }
    // }
    //
    // public async deletePhoto(userId: string, publicId: string) {
    //     try {
    //         const user = await UserModel.findById(userId);
    //         if (!user) return this.responseData(404, true, "User was not found");
    //         if (!user.photo || (user.photo?.publicId != publicId)) return this.responseData(404, true, "No image was found");
    //
    //         const cloudinary = new Cloudinary();
    //         const result = await cloudinary.delete(publicId);
    //         if (result.json.error) return this.responseData(500, true, "Failed to delete image");
    //
    //         const updatedUser = await UserModel.findByIdAndUpdate(
    //             userId,
    //             {
    //                 $set: {
    //                     photo: null
    //                 }
    //             },
    //             { new: true, runValidators: true }
    //         )
    //         if (!updatedUser) return this.responseData(404, true, "User was not found");
    //         return this.responseData(200, false, "User's image deleted successfully");
    //     } catch (error) {
    //         const { statusCode, message } = this.handleMongoError(error);
    //         return this.responseData(statusCode, true, message);
    //     }
    // }
    //
    // private async massImageDelete(publicIds: string[]) {
    //     const results: { publicId: string, success: boolean }[] = [];
    //
    //     await Promise.all(
    //         publicIds.map(async (publicId: string) => {
    //             const cloudinary = new Cloudinary();
    //             const result = await cloudinary.delete(publicId);
    //             if (result.json.error) {
    //                 results.push({
    //                     success: false,
    //                     publicId,
    //                 });
    //             }
    //
    //             results.push({
    //                 success: true,
    //                 publicId,
    //             });
    //         })
    //     );
    //
    //     const success: string[] = results
    //         .filter((result) => result.success)
    //         .map((result) => result.publicId);
    //     const failed: string[] = results
    //         .filter((result) => !result.success)
    //         .map((result) => result.publicId);
    //
    //     return { success, failed };
    // }
    //
    // public async deleteImages(userId: string, publicIds: string[]) {
    //     try {
    //         // const user = await UserModel.findById(userId);
    //         // if (!user) return this.responseData(404, true, "User was not found");
    //
    //         // if (user.images && user.images.length > 0) {
    //         //     const validPublicIds = user.images.filter(image => {
    //         //         return publicIds.includes(image.publicId!);
    //         //     }).map(image => image.publicId!);
    //
    //         //     if (validPublicIds.length == 0) return this.responseData(404, true, "No image was found");
    //         //     const { success, failed } = await this.massImageDelete(validPublicIds);
    //         //     if (success.length == 0) return this.responseData(500, true, "Failed to delete images");
    //
    //         //     const updatesImages = user.images!
    //         //         .filter((image) => !success.includes(image.publicId!))
    //         //         .map((image) => ({ url: image.url!, publicId: image.publicId! }));
    //
    //         //     const updatedUser = await UserModel.findByIdAndUpdate(
    //         //         userId,
    //         //         {
    //         //             $set: {
    //         //                 images: updatesImages
    //         //             }
    //         //         },
    //         //         { new: true, runValidators: true }
    //         //     );
    //         //     if (!updatedUser) return this.responseData(404, true, "User was not found");
    //         //     return failed.length > 0 ?
    //         //         this.responseData(500, true, "Failed to delete some images", failed) :
    //         //         this.responseData(200, false, "User's images were deleted successfully", updatesImages);
    //         // }
    //         return this.responseData(404, true, "No image was found");
    //     } catch (error) {
    //         const { statusCode, message } = this.handleMongoError(error);
    //         return this.responseData(statusCode, true, message);
    //     }
    // }
}