import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import {NotificationModel} from "../models/Notification";
import {Namespaces, exchange, QueueEvents, QueueNames, UserType, Events} from "../types/constants";
import BaseService from "../services/bases/BaseService";
import MechanicLocationModel from "../models/LocationModel";
import JobRequestModel from "../models/JobRequestModel";
import {Types} from "mongoose";
import LocationModel from "../models/LocationModel";
import {MechanicLocation} from "../types";
import Location from "../services/Location";
import Handler from "../io/handlers/Handler";
import logger from "../config/logger";

const location = new RabbitMQRouter({
    name: QueueNames.LOCATION,
    durable: true,
    routingKeyPattern: 'location.*',
    exchange: exchange,
    handlers: {}
});

const service = new BaseService();

location.route(QueueEvents.LOCATION_UPDATE, async (message: any, io: Server) => {
    const {payload} = message as { payload: MechanicLocation, eventType: QueueEvents };

    try {

        const mechanicIdObjectId = new Types.ObjectId(payload.mechanicId);

        const result = await MechanicLocationModel.findOneAndUpdate(
            {mechanicId: mechanicIdObjectId},
            {
                $set: {
                    location: {
                        type: 'Point',
                        coordinates: [payload.longitude, payload.latitude]
                    },
                    timestamp: payload.timestamp,
                }
            },
            {returnDocument: 'after'}
        );

        logger.info(`🌐 Updated mechanic:${payload.mechanicId} location`)
    } catch (error) {
        service.handleMongoError(error);
        console.log("Something went wrong in 'LOCATION_UPDATE' queue ");
    }
});

location.route(QueueEvents.LOCATION_NEAR_BY, async (message: any, io: Server) => {
    const {payload} = message;

    console.log(payload)

    try {
        const locationService = new Location();
        const mechanics = await locationService.findNearbyMechanics(payload.latitude, payload.longitude,payload.radius,payload.limit);

        const namespace = io.of(Namespaces.BASE);
        namespace.to(payload.userId).emit(Events.NEARBY_MECHANICS, Handler.responseData(false, "Nearby mechanics", mechanics));

        logger.info(`🌐 Updated nearby mechanics location for user:${payload.userId}`)
    } catch (error) {
        console.log("Something went wrong in 'LOCATION_NEAR_BY' queue: ",error);
    }
});

location.route(QueueEvents.TRACK_MECHANIC, async (message: any, io: Server) => {
    const {payload} = message;

    try {
        const locationService = new Location();

        const mechanic = await locationService.trackMechanic(payload.mechanicId);

        const namespace = io.of(Namespaces.BASE);
        namespace.to(payload.userId).emit(Events.TRACK_MECHANIC, Handler.responseData(false, "Tracking mechanic", mechanic));

        logger.info(`🌐 Tracking mechanic for user:${payload.userId}`)
    } catch (error) {
        console.log("Something went wrong in 'TRACK_MECHANIC' queue: ",error);
    }
});


export default location;