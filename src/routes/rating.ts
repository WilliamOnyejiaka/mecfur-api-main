import {Router} from 'express';
import Rating from "../controllers/Rating";
import asyncHandler from "express-async-handler";
import {rateMechanic, rateUser} from "../middlewares/routes/rating";
import {UserType} from "../types/constants";
import verifyJWT from "../middlewares/verifyJWT";


const rating = Router();

rating.post('/mechanic',rateMechanic, asyncHandler(Rating.rateMechanic));
rating.post('/user',rateUser, asyncHandler(Rating.rateUser));
rating.get('/mechanic', verifyJWT([UserType.MECHANIC]),asyncHandler(Rating.mechanicRatings));
rating.get('/user', verifyJWT([UserType.USER]),asyncHandler(Rating.userRatings));


export default rating;