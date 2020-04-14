import events = require('events');
import logger = require('./logger');
import settings = require('./config/Settings');

class ChatBus extends events.EventEmitter {

    emit(event: string, arg1?: any, arg2?: any): boolean {
        if (settings.eventBusMessagesToNotLog.indexOf(event) < 0) {
            console.log(event + ": " + arg1);
            //logger.info("ChatBus sending message", {codepath: "ChatBus.emit", room: event, message: arg1});
        }
        return super.emit(event, arg1, arg2);
    }
    //on(event: string, listener: Function): events.EventEmitter {
    //    debugger;
    //    return super.on(event, listener);
    //}
}
let chatBus: events.EventEmitter = new ChatBus();
export = chatBus;