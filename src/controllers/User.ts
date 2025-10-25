import {Request, Response} from "express";
import Controller from "./bases/Controller";
import {validationResult} from "express-validator";
import {User as UserService} from "../services";
import {EditData} from "../types";

export default class User {

    private static readonly service = new UserService();

    public static async profile(req: Request, res: Response) {
        const {id: userId} = res.locals.data;

        const serviceResult = await User.service.profile(userId);
        Controller.response(res, serviceResult);
    }

    public static async updatePassword(req: Request, res: Response) {
        // let {password} = req.body;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const {id: userId} = res.locals.data;
        const {newPassword, currentPassword} = req.body;

        const serviceResult = await User.service.updatePassword(currentPassword, newPassword, userId);
        Controller.response(res, serviceResult);
    }

    public static async editProfile(req: Request, res: Response) {
        let editData: EditData = req.body;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        editData.file = req.file;
        const {id: userId} = res.locals.data;

        const serviceResult = await User.service.editProfile(userId, editData);
        Controller.response(res, serviceResult);
    }

    //
    // public static async updateLocation(req: Request, res: Response) {
    //     const { longitude, latitude } = req.body;
    //     const validationErrors = validationResult(req);
    //
    //     if (!validationErrors.isEmpty()) {
    //         Controller.handleValidationErrors(res, validationErrors);
    //         return;
    //     }
    //
    //     const { id: userId } = res.locals.data;
    //
    //     const serviceResult = await User.service.updateLocation(userId, longitude, latitude);
    //     Controller.response(res, serviceResult);
    // }
    //
    // public static async editImages(req: Request, res: Response) {
    //     const { id: userId } = res.locals.data;
    //
    //     const serviceResult = await User.service.editImages(userId, req.files as Express.Multer.File[]);
    //     Controller.response(res, serviceResult);
    // }
    //
    public static async deletePhoto(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const publicId = req.query.publicId;

        if (!publicId) {
            res.status(400).json({
                error: true,
                message: "publicId is required"
            });
            return;
        }

        const serviceResult = await User.service.deletePhoto(userId, publicId as string);
        Controller.response(res, serviceResult);
    }
}