import http = require('http');
import net = require('net');
import ChatUser = require('./ChatUser');
import RoomManager = require('./RoomManager');
import logger = require('./logger');

module ChatSocketServer {
    http.globalAgent.maxSockets = 2048;
    let server: net.Server;
    let roomManager: RoomManager;

    export function start(port: number) {
        roomManager = new RoomManager();

        server = net.createServer((socket: any) => {
            socket.setEncoding('utf8');
            socket.setNoDelay(true);
            socket.setKeepAlive(true, 50 * 1000);

            let user = new ChatUser(socket, roomManager);
            let buffer = '';

            socket.on('data', (data: NodeBuffer) => {
                buffer += data.toString();
                while (buffer.indexOf('\n') >= 0) {
                    let request = buffer.substring(0, buffer.indexOf('\n'));
                    buffer = buffer.substring(buffer.indexOf('\n') + 1);
                    try {
                        user.process(JSON.parse(request));
                    } catch (e) {
                        debugger;
                        logger.error('Failed to parse message', { codepath: "ChatServer.on.data", data: data, buffer: buffer, message: request, user: user.name, room: user.room });
                        user.warn("invalid message recieved " + request);
                    }
                }
            });
            socket.on('end', () => {
                user.disconnected();
            });
            socket.on('close', (hadError: any) => {
                if (hadError) {
                    logger.warn("Closing socket due to close event after error", { codepath: "ChatServer.on.close", user: user.name, room: user.room });
                    user.disconnected();
                }
            });

            socket.on('error', (error: any) => {
                logger.error('Socket errored out', { codepath: "ChatServer.on.error", error: error, user: user.name, room: user.room });
                logger.warn('Not disconnecting user on socket error, waiting for close event instead', { codepath: "ChatServer.on.error", error: error, user: user.name, room: user.room });
                //user.disconnected();
            });
        });

        //From the node docs http://nodejs.org/api/net.html
        server.on('error', function (error: any) {
            if (error.code == 'EADDRINUSE') {
                console.log('PlayerCommunicator: Socket Address in use, retrying...');
                setTimeout(function () {
                    server.close();
                    server.listen(port);
                }, 1000);
            }
        });

        server.listen(port);
        console.log("Chat Server listening at port " + port);
        return server;
    }



}

export = ChatSocketServer;