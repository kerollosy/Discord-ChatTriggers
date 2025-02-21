import { Message } from "./structures/Message";
import { User } from "./structures/User";

interface EventMap {
    message: Message;
    messageDelete: Message;
    ready: User;
    debug: string;
}

declare class EventEmitter<T extends Record<string, any>> {
    on<K extends keyof T>(event: K, listener: (arg: T[K]) => void): void;
    emit<K extends keyof T>(event: K, arg: T[K]): void;
}

declare class Client extends EventEmitter<EventMap> {}