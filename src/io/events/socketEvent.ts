import { SocketNamespace } from "../namespaces";
import { SocketHandler } from "../handlers";

const socketEvent = new SocketNamespace();

socketEvent.onConnection(SocketHandler.onConnection.bind(SocketHandler));
socketEvent.register("disconnect", SocketHandler.disconnect.bind(SocketHandler));

export default socketEvent;