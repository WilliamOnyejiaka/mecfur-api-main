import BaseService from "./bases/BaseService";
import MechanicRatingModel from "../models/MechanicRating";
import mongoose, {Types} from "mongoose";
import {HttpStatus} from "../types/constants";
import UserRatingModel from "../models/UserRating";
import MechanicModel from "../models/MechanicModel";
import UserModel from "../models/UserModel";

export default class Rating extends BaseService {

    public async rateMechanic(userId: string, mechanicId: string, comment: string, rating: number) {
        try {
            const mechanic = await MechanicModel.findById(new mongoose.Types.ObjectId(mechanicId)).lean();
            if (!mechanic) return this.responseData(HttpStatus.NOT_FOUND, true, "Mechanic not found");

            const result = await MechanicRatingModel.create({
                mechanicId: mechanicId,
                userId,
                comment,
                rating
            });

            return this.responseData(HttpStatus.OK, false, "Mechanic rating successful", result);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async rateUser(userId: string, mechanicId: string, comment: string, rating: number) {
        try {
            const user = await UserModel.findById(new mongoose.Types.ObjectId(userId)).lean();
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, "User not found");

            const result = await UserRatingModel.create({
                mechanicId,
                userId,
                comment,
                rating
            });

            return this.responseData(HttpStatus.OK, false, "User rating successful", result);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async mechanicRatings(mechanicId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const result = await MechanicRatingModel.find({mechanicId: new Types.ObjectId(mechanicId)})
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .lean();

            const [results, total] = await Promise.all([result, MechanicRatingModel.countDocuments({mechanicId: mechanicId})]);
            const data = {
                records: results,
                pagination: this.createPagination(page, limit, total),
            };
            return this.responseData(HttpStatus.OK, true, `Ratings were retrieved successfully.`, data);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async userRatings(userId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const result = await UserRatingModel.find({userId: new Types.ObjectId(userId)})
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .lean();

            const [results, total] = await Promise.all([result, UserRatingModel.countDocuments({userId: userId})]);
            const data = {
                records: results,
                pagination: this.createPagination(page, limit, total),
            };

            return this.responseData(HttpStatus.OK, true, `Ratings were retrieved successfully.`, data);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async calculateMechanicAverageRating(mechanicId: string) {
        try {
            // Use aggregation to compute average and count
            const result = await MechanicRatingModel.aggregate([
                {$match: {mechanicId: new mongoose.Types.ObjectId(mechanicId)}},
                {
                    $group: {
                        _id: "$mechanicId",
                        averageRating: {$avg: "$rating"},
                        totalRatings: {$sum: 1},
                    },
                },
            ]);

            // Handle case where no ratings exist
            if (result.length === 0) {
                return {averageRating: 0, totalRatings: 0};
            }

            // Round to two decimal places
            const averageRating = Math.round(result[0].averageRating * 100) / 100;

            const data = {
                averageRating,
                totalRatings: result[0].totalRatings,
            };
            return this.responseData(HttpStatus.OK, false, "Mechanic Average Rating", data);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }


    public async getMechanicAverageRating(mechanicId: string) {
        try {
            // Use aggregation to compute average and count
            const result = await MechanicRatingModel.aggregate([
                {$match: {mechanicId: new mongoose.Types.ObjectId(mechanicId)}},
                {
                    $group: {
                        _id: "$mechanicId",
                        averageRating: {$avg: "$rating"},
                        totalRatings: {$sum: 1},
                    },
                },
            ]);

            // Handle case where no ratings exist
            if (result.length === 0) {
                return {averageRating: 0, totalRatings: 0};
            }

            // Round to two decimal places
            const averageRating = Math.round(result[0].averageRating * 100) / 100;

            const data = {
                averageRating,
                totalRatings: result[0].totalRatings,
            };
            return this.responseData(HttpStatus.OK, false, "Mechanic Average Rating", data);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async getUserAverageRating(userId: string) {
        try {
            // Use aggregation to compute average and count
            const result = await UserRatingModel.aggregate([
                {$match: {userId: new mongoose.Types.ObjectId(userId)}},
                {
                    $group: {
                        _id: "userId",
                        averageRating: {$avg: "$rating"},
                        totalRatings: {$sum: 1},
                    },
                },
            ]);

            // Handle case where no ratings exist
            if (result.length === 0) {
                return {averageRating: 0, totalRatings: 0};
            }

            // Round to two decimal places
            const averageRating = Math.round(result[0].averageRating * 100) / 100;

            const data = {
                averageRating,
                totalRatings: result[0].totalRatings,
            };
            return this.responseData(HttpStatus.OK, false, "User Average Rating", data);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }
}