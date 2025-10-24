import { Request, Response } from "express";
import Controller from "./bases/Controller";
import { Notification as NotificationService } from "../services";
import { validationResult } from "express-validator";

export default class Notification {

    private static readonly service = new NotificationService();

    public static async notification(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const { id: userId } = res.locals.data;
        const id = req.params.id;

        const serviceResult = await Notification.service.notification(id, userId);
        Controller.response(res, serviceResult);
    }

    public static async markAsRead(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const { id: userId } = res.locals.data;
        const id = req.params.id;
        const serviceResult = await Notification.service.markAsRead(id, userId);
        Controller.response(res, serviceResult);
    }

    public static async notifications(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const serviceResult = await Notification.service.notifications(page, limit, userId);
        Controller.response(res, serviceResult);
    }
}