import { pino } from 'pino';
import { pinoHttp } from 'pino-http';
import PinoPretty from 'pino-pretty';
import config from '../config';

const stream = PinoPretty({
  colorize: config.logColorize,
  messageFormat: config.logMessageFormat,
  translateTime: config.logTranslateTime,
});
export const logger = pino(
  {
    timestamp: () => {
      const date = new Date();
      return `,"time":"${new Date(date.getTime() - date.getTimezoneOffset() * 60000).toJSON()}"`;
    },
    name: config.applicationName,
    level: config.logLevel,
  },
  config.logPretty ? stream : {},
);

export function expresslogger() {
  return pinoHttp({
    logger: logger,
    serializers: {
      req(req) {
        req.body = req.raw.body;
        return req;
      },
    },
  });
}
