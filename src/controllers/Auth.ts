import {Request, Response} from "express";

import {Authentication as Service} from "../services";


export default class Authentication {

    private static service = new Service();

    public static async create(req: Request, res: Response) {
        let signUpData = req.body;
        signUpData.file = req.file;

        const serviceResult = await Authentication.service.signUp(signUpData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createMechanic(req: Request, res: Response) {
        let signUpData = req.body;
        signUpData.file = req.file;

        const serviceResult = await Authentication.service.mechanicSignUp(signUpData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async login(req: Request, res: Response) {
        const {email, password} = req.body;
        const serviceResult = await Authentication.service.login(email, password);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async mechanicLogin(req: Request, res: Response) {
        const {email, password} = req.body;
        const serviceResult = await Authentication.service.mechanicLogin(email, password);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}