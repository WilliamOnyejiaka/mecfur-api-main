import {Router, Request, Response} from "express";
import RequestController from "./../controllers/Request";
import asyncHandler from "express-async-handler";
import {acceptJob, createJob, makeRequest} from "../middlewares/routes/request";
import {UserType} from "../types/constants";
import verifyJWT from "../middlewares/verifyJWT";

const requestRoute: Router = Router();

requestRoute.get("/history/mechanic", verifyJWT([UserType.MECHANIC]), asyncHandler(RequestController.requests));
requestRoute.get("/history/mechanic/:jobId", verifyJWT([UserType.MECHANIC]), asyncHandler(RequestController.request));

requestRoute.get("/job/accept/:requestId", acceptJob, asyncHandler(RequestController.acceptJob));
requestRoute.get("/job/decline/:requestId", acceptJob, asyncHandler(RequestController.declineJob));

requestRoute.get("/mechanics/near-by-mechanics/:lon/:lat/:radius", verifyJWT([UserType.USER]),asyncHandler(RequestController.nearByMechanics));
requestRoute.post("/job", createJob, asyncHandler(RequestController.createJob));
requestRoute.post("/make", makeRequest, asyncHandler(RequestController.makeRequest));
requestRoute.get("/mechanics", verifyJWT([UserType.USER]), asyncHandler(RequestController.mechanics));


export default requestRoute;