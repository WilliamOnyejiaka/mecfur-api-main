import { Router, Request, Response } from "express";
import User from "./../controllers/User";
import asyncHandler from "express-async-handler";
import {editImages, editProfile, updateLocation, updatePassword} from "../middlewares/routes/user";

const user: Router = Router();

// user.put("/images", editImages, asyncHandler(User.editImages));
user.put("/update/password", updatePassword, asyncHandler(User.updatePassword));
user.delete("/photo", asyncHandler(User.deletePhoto));
// user.patch("/location", updateLocation, editProfile, asyncHandler(User.updateLocation));
// user.get("/completion", asyncHandler(User.profileCompletion));
user.get("/", asyncHandler(User.profile));
user.put("/", editProfile, asyncHandler(User.editProfile));


export default user;