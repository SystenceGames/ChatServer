export interface Graylog2 {
    graylogHost: string,
    graylogPort: number,
    graylogFacility: string
}

export interface MessageRequest {
    commandType: string,
    message: string
}

export interface GetUsersRequest {
    commandType: string,
    room: string
}

export interface SwitchRoomRequest {
    commandType: string,
    room: string
}

export interface GetUsersResponse {
    commandType: string;
    users: Array<string>;
}

export interface SendMessageResponse {
    commandType: string;
    message: string;
}

export interface RoomManager {
    sendToRoom(room:string, message: string): any;
    stopListeningOnRoom(room: string, listener: Function, name: string): any;
    listenOnRoom(room: string, listener: Function, name: string): any;
    getUsersIn(room: string): Array<string>;
}
