import express = require('express');
import http = require('http');
import path = require('path');
import settings = require('./config/Settings');
import ChatSocketServer = require("./ChatSocketServer");
import logger = require('./logger');

ChatSocketServer.start(settings.socketServerPort);
let app = express();

app.get('/isRunning', (req: any, res: any) => {
    res.json(200, true);
});

app.listen(settings.port);

process.on('uncaughtException', function (err: any) {
    logger.error(err.stack);
    logger.info("Node NOT Exiting...");
    debugger;
});

logger.info("ChatServer has started");
let printableSettings: any = settings;
logger.info(JSON.stringify(printableSettings.__proto__, null, 2));