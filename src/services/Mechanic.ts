import {HttpStatus, UserType} from "../types/constants";
import BaseService from "./bases/BaseService";
import mongoose from "mongoose";
import {UserCache} from "../cache";
import MechanicModel from "../models/MechanicModel";

export default class Mechanic extends BaseService {

    private readonly userCache: UserCache = new UserCache(UserType.MECHANIC);


    public async profile(userId: mongoose.Types.ObjectId) {
        try {
            let user;
            user = await this.userCache.get(userId.toString());
            if (user) return this.responseData(200, false, "User has been retrieved successfully", (user));

            user = await MechanicModel.findById(userId).select("-password");

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
}