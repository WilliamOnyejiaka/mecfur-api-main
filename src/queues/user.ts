import { Server } from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import { UserUpdatedEvent } from "../config/queues";
import UserModel from "../models/UserModel";
import notify from "../services/notify";
import BaseService from "../services/bases/BaseService";
import logger from "../config/logger";
import { exchange, QueueEvents, QueueNames } from "../types/constants";

const service = new BaseService();

const user = new RabbitMQRouter({
    name: QueueNames.USER,
    durable: true,
    routingKeyPattern: 'user.*',
    exchange: exchange,
    handlers: {}
});


user.route(QueueEvents.USER_VISIT, async (message: any, io: Server) => {
    const { payload: { userId, user, visitorId } } = message;

    try {

        logger.info(`👀 User ${visitorId} visited user ${userId}`)
        await notify({
            userId: userId,
            type: "visit",
            data: { visitor: user }
        });
    } catch (error) {
        service.handleMongoError(error);
    }
});


export default user;