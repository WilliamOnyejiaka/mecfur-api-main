import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {editProfile, updatePassword} from "../middlewares/routes/user";
import Mechanic from "../controllers/Mechanic";

const mechanic = Router();

// mechanic.put("/update/password", updatePassword, asyncHandler(Mechanic.updatePassword));
// mechanic.delete("/photo", asyncHandler(Mechanic.deletePhoto));

mechanic.get("/", asyncHandler(Mechanic.profile));
// mechanic.put("/", editProfile, asyncHandler(Mechanic.editProfile));

export default mechanic;