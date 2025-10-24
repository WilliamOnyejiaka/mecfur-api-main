import { NotificationModel } from "../models/Notification";
import { pagination } from "../utils";
import BaseService from "./bases/BaseService";

export default class Notification extends BaseService {

    public async notifications(page: number, limit: number, userId: string) {
        try {
            const skip = (page - 1) * limit;

            const result = await NotificationModel.find({ userId: userId }).skip(skip).limit(limit).lean();

            const total = await NotificationModel.countDocuments({ userId });
            const data = {
                records: result,
                pagination: { ...pagination(page, limit, total) }
            };
            return this.responseData(200, false, "Notifications have been retrieved successfully", data);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async notification(id: string, userId: string) {
        try {
            const result = await NotificationModel.findOne({ _id: id, userId });
            return this.responseData(200, false, "Notification have been retrieved successfully", result);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async markAsRead(id: string,userId: string){
        try {
            const result = await NotificationModel.updateOne({
                _id: id,
                userId: userId
            },{isRead: true,readAt: Date.now()});
            return this.responseData(200, false, "Notification have been retrieved successfully", result);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async delete() {

    }
}