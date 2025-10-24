import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Auth} from "../controllers";
import {signUp, login, mechanicsValidator} from "../middlewares/routes/auth";

const auth = Router();

auth.post("/users/sign-up", signUp, asyncHandler(Auth.create));
auth.post("/mechanics/sign-up", mechanicsValidator, asyncHandler(Auth.createMechanic));

auth.get("/users/login", login, asyncHandler(Auth.login));
auth.get("/mechanics/login", login, asyncHandler(Auth.mechanicLogin));

export default auth;