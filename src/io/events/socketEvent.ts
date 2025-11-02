import SocketNamespace from "../namespaces/SocketNamespace";
import SocketHandler from "../handlers/SocketHandler";

const socketEvent = new SocketNamespace();

socketEvent.onConnection(SocketHandler.onConnection.bind(SocketHandler));
socketEvent.register("updateMechanicLocation", SocketHandler.updateMechanicLocation.bind(SocketHandler));
socketEvent.register("nearByMechanics", SocketHandler.nearByMechanics.bind(SocketHandler));
socketEvent.register("disconnect", SocketHandler.disconnect.bind(SocketHandler));

export default socketEvent;