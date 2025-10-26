import {Request, Response} from "express";
import Controller from "./bases/Controller";
import {Request as Service} from "../services";

export default class RequestController {

    private static service = new Service();

    public static async createJob(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {
            issueType,
            issueDescription,
            pickupLon,
            pickupLat,
            vehicleMake,
            vehicleModel,
            vehicleYear,
            pickupAddress,
            vehiclePlate,
            radius
        } = req.body;

        const serviceResult = await RequestController.service.createJob(
            issueType,
            issueDescription,
            pickupLon,
            pickupLat,
            vehicleMake,
            vehicleModel,
            vehicleYear,
            vehiclePlate,
            pickupAddress,
            userId,
            Number(radius)
            );
        Controller.response(res, serviceResult);
    }

    public static async makeRequest(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {jobId, mechanicId} = req.body;

        const serviceResult = await RequestController.service.makeRequest(userId, mechanicId, jobId);
        Controller.response(res, serviceResult);
    }

    public static async acceptJob(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {requestId} = req.params;
        const serviceResult = await RequestController.service.acceptJob(requestId, userId);
        Controller.response(res, serviceResult);
    }

    public static async declineJob(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {requestId} = req.params;
        const serviceResult = await RequestController.service.declineJob(requestId, userId);
        Controller.response(res, serviceResult);
    }

    public static async request(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {jobId} = req.params;

        const serviceResult = await RequestController.service.request(userId, jobId);
        Controller.response(res, serviceResult);
    }


    public static async requests(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {page, limit} = req.query;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;
        const serviceResult = await RequestController.service.requests(userId, parsedPage, parsedLimit);
        Controller.response(res, serviceResult);
    }
}