import os = require("os");
import winston = require('winston');
require('winston-loggly');
import settings = require('./config/Settings');

let logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            handleExceptions: true,
            json: false,
            padLevels: true,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.add(require('winston-graylog2'), settings.Graylog2);

winston.handleExceptions(new winston.transports.Console({ colorize: true, json: true }));
winston.exitOnError = false;

logger.info("initialized winston");

export = logger;