import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import {UserUpdatedEvent} from "../config/queues";
import UserModel from "../models/UserModel";
import notify from "../services/notify";
import BaseService from "../services/bases/BaseService";
import {logger} from "../config";
import {exchange, QueueEvents, QueueNames, UserType} from "../types/constants";

const service = new BaseService();

const request = new RabbitMQRouter({
    name: QueueNames.REQUEST,
    durable: true,
    routingKeyPattern: 'request.*',
    exchange: exchange,
    handlers: {}
});


request.route(QueueEvents.MAKE_REQUEST, async (message: any, io: Server) => {
    const {payload: {userId, mechanicId, jobDetails}} = message;

    try {

        logger.info(`📧 user:${userId} is making a request to mechanic:${mechanicId}`);
        const user = await UserModel.findById(userId).select("-password");
        await notify({
            userId: mechanicId,
            userType: UserType.MECHANIC,
            type: 'request',
            data: {jobDetails: jobDetails, user},
        });
    } catch (error) {
        service.handleMongoError(error);
    }
});


export default request;