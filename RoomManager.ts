import ChatBus = require('./ChatBus');
import I = require('./Interfaces');

class RoomManager implements I.RoomManager {
    private usersByRoom: { [key: string]: Array<string> } = {};

    public listenOnRoom(room: string, listener: Function, name: string) {
        ChatBus.on(room, listener);
        if (!this.usersByRoom[room]) {
            this.usersByRoom[room] = new Array<string>();
        }
        this.usersByRoom[room].push(name);
    }

    public sendToRoom(room:string, message: string) {
        ChatBus.emit(room, message);
    }

    public stopListeningOnRoom(room: string, listener: Function, name: string) {
        ChatBus.removeListener(room, listener);
        if (!this.usersByRoom[room]) {
            return;
        }
        let INDEX_NOT_FOUND: number = -1;
        let users = this.usersByRoom[room];
        let i = users.indexOf(name);
        if (i > INDEX_NOT_FOUND) {
            users.splice(i, 1);
        }
    }

    public getUsersIn(room: string): Array<string> {
        return this.usersByRoom[room];
    }
}
export = RoomManager;