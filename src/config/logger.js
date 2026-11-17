import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
        env.NODE_ENV === 'development'
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:HH:MM:ss', // Format: 16:02:42
                      ignore: 'pid,hostname,req,res,responseTime,reqId', // 👈 Ignore bulky request/response details
                      messageFormat: '{msg} {req.method} {req.url} {res.statusCode}' // 👈 Format the message
                  }
              }
            : undefined
});
