import {Server} from "socket.io";
import {ISocket} from "../../types";
import {logger} from "../../config";

export default class SocketHandler {


    public static async onConnection(io: Server, socket: ISocket) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType;

        socket.join(userId);


        logger.info(`🤝 ${userType}:${userId} with the socket id - ${socketId} has connected to notification namespace`);

    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = socket.locals.data.id;
            const userType = socket.locals.data.userType;

            logger.info(`👋 ${userType}:${userId} with the socket id - ${socket.id} has disconnected from notification namespace`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
        }
    }
}