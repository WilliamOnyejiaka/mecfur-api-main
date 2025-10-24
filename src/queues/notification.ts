import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import {NotificationModel} from "../models/Notification";
import {Namespaces, exchange, QueueEvents, QueueNames, UserType} from "../types/constants";
import BaseService from "../services/bases/BaseService";
import {logger} from "../config";

const notification = new RabbitMQRouter({
    name: QueueNames.NOTIFICATION,
    durable: true,
    routingKeyPattern: 'notification.*',
    exchange: exchange,
    handlers: {}
});

const service = new BaseService();

notification.route(QueueEvents.NOTIFICATION_NOTIFY, async (message: any, io: Server) => {
    const {payload: {provider, data}} = message;

    try {

        // const notification = await NotificationModel.create({
        //     type: data.type,
        //     data: data.data,
        //     userId: data.userType == UserType.USER ? data.userId : undefined,
        //     mechanicId: data.userType == UserType.MECHANIC ? data.userId : undefined,
        // });

        if (provider == "socket") {
            const notificationNamespace = io.of(Namespaces.BASE);
            notificationNamespace.to(data.userId).emit("notification", {
                data
            });

            logger.info(`🏃 Notifying user:${data.userId}, type:${data.type}`)
        }
    } catch (error) {
        service.handleMongoError(error);
    }
});

export default notification;