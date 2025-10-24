import {Router, Request, Response} from "express";
import {RequestController} from "./../controllers";
import asyncHandler from "express-async-handler";
import {acceptJob, createJob, makeRequest} from "../middlewares/routes/request";
import {verifyJWT} from "../middlewares";
import {UserType} from "../types/constants";

const requestRoute: Router = Router();

requestRoute.get("/history/mechanic", verifyJWT([UserType.MECHANIC]), asyncHandler(RequestController.requests));
requestRoute.get("/history/mechanic/:jobId", verifyJWT([UserType.MECHANIC]), asyncHandler(RequestController.request));

requestRoute.get("/job/accept/:requestId", acceptJob, asyncHandler(RequestController.acceptJob));
requestRoute.get("/job/decline/:requestId", acceptJob, asyncHandler(RequestController.declineJob));

// job.get("/near-by-mechanics/:lon/:lat",nearByMechanics,asyncHandler(Job.nearByMechanics));
requestRoute.post("/job", createJob, asyncHandler(RequestController.createJob));
requestRoute.post("/make/", makeRequest, asyncHandler(RequestController.makeRequest));


export default requestRoute;