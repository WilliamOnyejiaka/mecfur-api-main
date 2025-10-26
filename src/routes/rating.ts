import {Router} from 'express';
import {Rating} from "../controllers";
import asyncHandler from "express-async-handler";
import {rateMechanic, rateUser} from "../middlewares/routes/rating";
import {verifyJWT} from "../middlewares";
import {UserType} from "../types/constants";


const rating = Router();

rating.post('/mechanic',rateMechanic, asyncHandler(Rating.rateMechanic));
rating.post('/user',rateUser, asyncHandler(Rating.rateUser));
rating.get('/mechanic', verifyJWT([UserType.MECHANIC]),asyncHandler(Rating.mechanicRatings));
rating.get('/user', verifyJWT([UserType.USER]),asyncHandler(Rating.userRatings));


export default rating;