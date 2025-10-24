import winston from "winston";
import path from 'path';

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        http: 3,
        info: 4,
        debug: 5,
        trace: 6,
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        http: 'cyan',
        info: 'green',
        debug: 'blue',
        trace: 'magenta',
    },
};

const generalFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
        ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`
    )
);

const logger = winston.createLogger({
    levels: customLevels.levels,
    format: generalFormat,
    transports: [
        // Console transport with colorized output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(
                    ({ timestamp, level, message }) =>
                        `${timestamp} [${level}]: ${message}`
                )
            ),
        }),
        // File transport without colors
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/http.log'),
            level: 'http'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/warn.log'),
            level: 'warn'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/info.log'),
            level: 'info'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/fatal.log'),
            level: 'fatal'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/debug.log'),
            level: 'debug'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/trace.log'),
            level: 'trace'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/app.log') // Combined errors
        }),
    ],
});

// Add custom colors
winston.addColors(customLevels.colors);

export default logger;