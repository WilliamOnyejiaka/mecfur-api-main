import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import {Mechanic} from "../controllers";

const mechanic = Router();

mechanic.get("/",asyncHandler(Mechanic.profile));

export default mechanic;