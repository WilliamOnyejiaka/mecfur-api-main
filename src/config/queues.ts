import {Server} from 'socket.io';
import notification from '../queues/notification';
import {request, user,location} from "./../queues";
import { QueueConfig} from '../types';


export interface UserUpdatedEvent {
    eventType: 'user.updated';
    payload: { userId: string; name?: string; email?: string };
}

export const QUEUES: Record<string, QueueConfig> = {
    [user.config.name]: user.config,
    [notification.config.name]: notification.config,
    [request.config.name]: request.config,
    [location.config.name]: location.config,
};

export type QueueName = keyof typeof QUEUES;