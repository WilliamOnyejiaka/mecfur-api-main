import {Request, Response} from "express";
import Controller from "./bases/Controller";
import {Mechanic as Service} from "../services";


export default class Mechanic {

    private static service = new Service();

    public static async profile(req: Request, res: Response) {
        const {id: userId} = res.locals.data;

        const serviceResult = await Mechanic.service.profile(userId);
        Controller.response(res, serviceResult);
    }
}