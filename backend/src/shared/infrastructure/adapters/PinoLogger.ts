import pino from 'pino';
import pinoHttp from 'pino-http';
import { Logger } from '../../application/ports/Logger';

export const pinoInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});

export function createPinoLogger(): Logger {
  return {
    info(message: string): void {
      pinoInstance.info(message);
    },
    error(error: unknown, message: string): void {
      pinoInstance.error(error, message);
    },
  };
}

export function createHttpLogger() {
  return pinoHttp({
    logger: pinoInstance,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      remove: true,
    },
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode >= 500 || err) return 'error';
      return 'info';
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  });
}
