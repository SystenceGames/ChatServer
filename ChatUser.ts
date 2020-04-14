import assert = require('assert');
import CommandTypes = require('./CommandTypes');
import I = require('./Interfaces');
import logger = require('./logger');

class ChatUser {
    public name: string;
    public userStream: NodeJS.WritableStream;
    public room: string;
    public connected = false;
    public listener: Function;
    private roomManager: I.RoomManager;

    constructor(stream: NodeJS.WritableStream, roomManager: I.RoomManager) {
        this.userStream = stream;
        this.roomManager = roomManager;
    }
    public connect(name: string, room: string) {
        this.connected = true;
        this.name = name;
        this.room = room;
        this.listener = this.recieveMessage.bind(this);
        this.roomManager.listenOnRoom(room, this.listener, this.name);
        logger.info('User Connected', { codepath: "ChatUser.connect", name: name, room: room });
    }

    public process(request: any) {
        if (!this.connected) {
            if (!request.name || !request.room) {
                logger.warn("User not connected yet and did not specify name or room", { codepath: "ChatUser.processCommand", command: request, name: this.name, room: this.room });
                return this.warn("No room or name specified yet, need to connect before you can send a message");
            }
            return this.connect(request.name, request.room);
        }

        let commandType = request.commandType;
        assert(commandType, 'request missing command type');
        assert(typeof commandType === 'string', 'inappropriate commandType field');

        if (commandType == CommandTypes.SEND_MESSAGE) {
            assert(request.message, 'message missing command type');
            assert(typeof request.message === 'string', 'inappropriate message field');
            let command: I.MessageRequest = {
                commandType: request.commandType,
                message: request.message
            }
            this.messageRoom(command);
        } else if (commandType == CommandTypes.GET_USERS) {
            assert(request.room, 'room missing command type');
            assert(typeof request.room === 'string', 'inappropriate room field');
            let command: I.GetUsersRequest = {
                commandType: request.commandType,
                room: request.room
            }
            this.getUsers(command);
        } else if (commandType == CommandTypes.SWITCH_ROOM) {
            assert(request.room, 'room missing command type');
            assert(typeof request.room === 'string', 'inappropriate room field');
            let command: I.SwitchRoomRequest = {
                commandType: request.commandType,
                room: request.room
            }
            this.switchRoom(command);
        } else {
            logger.warn("User sent a command without any neccesary fields", { codepath: "ChatUser.processCommand", command: request, name: this.name, room: this.room });
            return this.warn("Packet recieved without a specified message");
        }
    }

    public recieveMessage(message: string) {
        let sendMessageResponse: I.SendMessageResponse = {
            commandType: CommandTypes.SEND_MESSAGE,
            message: message
        };
        this.writeObjectToChannel(sendMessageResponse);
    }

    public warn(message: string) {
        this.writeObjectToChannel({
            'message': "Warning: " + message,
        });
        //this.userStream.end();
    }

    private writeObjectToChannel(obj: any) {
        try {
            this.userStream.write(JSON.stringify(obj) + "\n");
        } catch (e) {
            logger.error('Failed to parse object to send to user', { codepath: "Chatuser.writeObjectToChannel", userName: this.name, userRoom: this.room, error: e, obj: obj });
            this.userStream.end();
        }
    }

    public messageRoom(command: I.MessageRequest) {
        this.roomManager.sendToRoom(this.room, this.name + ": " + command.message);
    }

    public disconnected() {
        logger.info('user disconnected', { codepath: "ChatUser.disconnected", userName: this.name, userRoom: this.room });
        this.roomManager.stopListeningOnRoom(this.room, this.listener, this.name);
    }

    public switchRoom(command: I.SwitchRoomRequest) {
        this.roomManager.stopListeningOnRoom(this.room, this.listener, this.name);
        this.room = command.room;
        this.listener = this.recieveMessage.bind(this);
        this.roomManager.listenOnRoom(command.room, this.listener, this.name);
    }

    public getUsers(command: I.GetUsersRequest) {
        let users = this.roomManager.getUsersIn(command.room);
        let getUsersResponse: I.GetUsersResponse = {
            commandType: CommandTypes.GET_USERS,
            users: users
        };
        this.writeObjectToChannel(getUsersResponse);
    }
}

export = ChatUser;