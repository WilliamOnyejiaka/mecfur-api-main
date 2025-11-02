import { Router, Request, Response } from "express";
import Notification from "../controllers/Notification";
import asyncHandler from "express-async-handler";

const notification: Router = Router();

notification.get("/", asyncHandler(Notification.notifications));
notification.get("/:id", asyncHandler(Notification.notification));
notification.patch("/:id", asyncHandler(Notification.markAsRead));

export default notification;