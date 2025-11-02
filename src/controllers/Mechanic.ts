import {Request, Response} from "express";
import Controller from "./bases/Controller";
import Service from "../services/Mechanic";


export default class Mechanic {

    private static service = new Service();

    public static async profile(req: Request, res: Response) {
        const {id: userId} = res.locals.data;

        const serviceResult = await Mechanic.service.profile(userId);
        Controller.response(res, serviceResult);
    }
}