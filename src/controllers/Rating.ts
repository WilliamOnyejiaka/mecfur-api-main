import {Request, Response} from "express";
import Controller from "./bases/Controller";
import  Service from "../services/Rating";


export default class Rating {

    private static service = new Service();

    public static async rateMechanic(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {mechanicId, comment, rating} = req.body;

        const serviceResult = await Rating.service.rateMechanic(userId, mechanicId, comment, rating);
        Controller.response(res, serviceResult);
    }

    public static async rateUser(req: Request, res: Response) {
        const {id: mechanicId} = res.locals.data;
        const {userId, comment, rating} = req.body;

        const serviceResult = await Rating.service.rateUser(userId, mechanicId, comment, rating);
        Controller.response(res, serviceResult);
    }

    public static async mechanicRatings(req: Request, res: Response) {
        const {id: mechanicId} = res.locals.data;
        const {page, limit} = req.query;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;
        const serviceResult = await Rating.service.mechanicRatings(mechanicId, parsedPage, parsedLimit);
        Controller.response(res, serviceResult);
    }

    public static async userRatings(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {page, limit} = req.query;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;
        const serviceResult = await Rating.service.userRatings(userId, parsedPage, parsedLimit);
        Controller.response(res, serviceResult);
    }
}