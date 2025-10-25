import { SocketNamespace } from "../namespaces";
import { SocketHandler } from "../handlers";

const socketEvent = new SocketNamespace();

socketEvent.onConnection(SocketHandler.onConnection.bind(SocketHandler));
socketEvent.register("updateMechanicLocation", SocketHandler.updateMechanicLocation.bind(SocketHandler));
socketEvent.register("nearByMechanics", SocketHandler.nearByMechanics.bind(SocketHandler));
socketEvent.register("disconnect", SocketHandler.disconnect.bind(SocketHandler));

export default socketEvent;