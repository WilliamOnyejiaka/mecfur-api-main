import { Namespace, Server } from "socket.io";
import { ISocket } from "../../types";

export default class Base {

    public namespace?: Namespace;
    protected eventHandlers: Record<string, Function> = {};
    protected io?: Server;
    private onConnectionCallback?: (io: Server, socket: ISocket) => void;

    public constructor() { }

    public register(event: string, handler: Function) {
        this.eventHandlers[event] = handler;
    }

    private initializeEventHandlers(socket: ISocket) {
        for (const [event, handler] of Object.entries(this.eventHandlers)) {
            socket.on(event, (...args) => handler(this.io!, socket, ...args));
        }
    }

    public onConnection(callback: (io: Server, socket: ISocket) => void) {
        this.onConnectionCallback = callback;
    }

    public initialize(namespace: Namespace, io: Server) {
        this.namespace = namespace;
        this.io = io;

        this.namespace.on("connection", (socket: ISocket) => {
            if (this.onConnectionCallback) {
                this.onConnectionCallback(io, socket);
            }
            this.initializeEventHandlers(socket);
        });
    }
}
