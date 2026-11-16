import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty', // Para que los logs se vean bonitos en consola
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        }
    } : undefined
});