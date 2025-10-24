import { QueueConfig, EventHandler } from "../types";

export default class RabbitMQRouter {

    public constructor(public config: QueueConfig) {
        this.config.handlers = this.config.handlers ?? {};
    }

    public route<T>(name: string, handler: EventHandler<T>): void {
        if (!name) {
            throw new Error("Event name cannot be empty");
        }
        if (!handler || typeof handler !== "function") {
            throw new Error("Handler must be a valid function");
        }
        if (this.config.handlers[name]) {
            console.warn(`Overwriting handler for ${name}`);
        }
        this.config.handlers = {
            ...this.config.handlers,
            [name]: handler
        };
    }

    public removeRoute(name: string): void {
        if (this.config.handlers[name]) {
            const { [name]: _, ...rest } = this.config.handlers;
            this.config.handlers = rest;
        }
    }

    public getHandler(name: string): EventHandler<any> | undefined {
        return this.config.handlers[name];
    }
}