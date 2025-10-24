import { Router, Request, Response } from "express";
import { User } from "./../controllers";
import asyncHandler from "express-async-handler";
import { editImages, editProfile, updateLocation } from "../middlewares/routes/user";

const user: Router = Router();

// user.put("/images", editImages, asyncHandler(User.editImages));
// user.delete("/photo", asyncHandler(User.deletePhoto));
// user.patch("/location", updateLocation, editProfile, asyncHandler(User.updateLocation));
// user.get("/completion", asyncHandler(User.profileCompletion));
user.get("/", asyncHandler(User.profile));
// user.put("/", editProfile, asyncHandler(User.editProfile));

export default user;