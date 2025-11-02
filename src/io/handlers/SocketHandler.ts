import {Server} from "socket.io";
import {ISocket, MechanicLocation} from "../../types";
import logger from "../../config/logger";
import Location from "../../services/Location";
import {Events, QueueEvents, QueueNames, UserType} from "../../types/constants";
import Handler from "./Handler";
import mongoose from "mongoose";
import {RabbitMQ} from "../../services/RabbitMQ";

function isValidTimestamp(timestamp: number, minYear: number = 1970, maxYear: number = 3000): boolean {
    try {
        // Assume milliseconds if timestamp is large, otherwise convert seconds to milliseconds
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return false;
        }

        // Check if the date falls within the acceptable year range
        const year = date.getFullYear();
        return year >= minYear && year <= maxYear;
    } catch {
        return false;
    }
}

export default class SocketHandler {

    private static locationService = new Location();

    public static async onConnection(io: Server, socket: ISocket) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType;

        socket.join(userId);


        logger.info(`🤝 ${userType}:${userId} with the socket id - ${socketId} has connected.`);

    }

    public static async updateMechanicLocation(io: Server, socket: ISocket, data: any) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType as UserType;

        if (userType !== UserType.MECHANIC) {
            socket.emit(Events.APP_ERROR, Handler.responseData(true, "Invalid user type, 'mechanic' user requeried"));
            return;
        }

        let {
            mechanicId,
            latitude,
            longitude,
            timestamp,
        } = data;

        latitude = parseInt(latitude) || 0;
        longitude = parseInt(longitude) || 0;
        timestamp = parseInt(timestamp) || 0;

        const validCoordinates = Location.isValidLatLng(latitude, longitude);

        if (!validCoordinates) {
            const message = "Invalid coordinates provided";
            logger.error("🙅 " + message);
            socket.emit(Events.APP_ERROR, Handler.responseData(true, message));
            return;
        }

        if (!isValidTimestamp(timestamp)) {
            const message = "Invalid timestamp provided";

            logger.error("🙅 " + message);
            socket.emit(Events.APP_ERROR, Handler.responseData(true, message));
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(mechanicId)) {
            const message = "Invalid mechanicId provided";

            logger.error("🙅 " + message);
            socket.emit(Events.APP_ERROR, Handler.responseData(true, message));
            return;
        }

        const location: MechanicLocation = {
            latitude,
            longitude,
            timestamp,
            mechanicId
        }

        const updated = SocketHandler.locationService.updateMechanicLocation(location);
        if (!updated) {
            const message = "Failed to update location"

            logger.error("🙅 " + message);

            socket.emit(Events.APP_ERROR, Handler.responseData(true, message));
            return;
        }
    }

    public static async nearByMechanics(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType as UserType;

        if (userType !== UserType.USER) {
            socket.emit(Events.APP_ERROR, Handler.responseData(true, "Invalid user type, 'user' user requeried"));
            return;
        }

        let {
            latitude,
            longitude,
            radius,
            limit
        } = data;

        latitude = parseFloat(latitude) || 0;
        longitude = parseFloat(longitude) || 0;
        radius = parseFloat(radius) || 20;
        limit = parseInt(limit) || 20;

        const validCoordinates = Location.isValidLatLng(latitude, longitude);

        if (!validCoordinates) {
            socket.emit(Events.APP_ERROR, Handler.responseData(true, "Invalid coordinates provided"));
            return;
        }

        const message = {
            payload: {
                latitude,
                longitude,
                userId,
                radius,
                limit
            },
            eventType: QueueEvents.LOCATION_NEAR_BY,
        };
        await RabbitMQ.publishToExchange(QueueNames.LOCATION, QueueEvents.LOCATION_NEAR_BY, message);
    }

    public static async trackMechanic(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType as UserType;

        if (userType !== UserType.USER) {
            socket.emit(Events.APP_ERROR, Handler.responseData(true, "Invalid user type, 'user' user requeried"));
            return;
        }

        let {
            mechanicId
        } = data;

        if (!mongoose.Types.ObjectId.isValid(mechanicId)) {
            const message = "Invalid mechanicId provided";

            logger.error("🙅 " + message);
            socket.emit(Events.APP_ERROR, Handler.responseData(true, message));
            return;
        }

        const message = {
            payload: {
                mechanicId,
                userId
            },
            eventType: QueueEvents.TRACK_MECHANIC,
        };
        await RabbitMQ.publishToExchange(QueueNames.LOCATION, QueueEvents.TRACK_MECHANIC, message);
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = socket.locals.data.id;
            const userType = socket.locals.data.userType;

            logger.info(`👋 ${userType}:${userId} with the socket id - ${socket.id} has disconnected.`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
        }
    }
}