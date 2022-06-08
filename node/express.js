import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import boolParser from 'express-query-boolean';
import config from './config';
import { convert } from './mapper/index';
import { expresslogger, logger } from './util/logger';
import router from './router';
import { getIPAddress, setMaxListners, startAllSession } from './util/functions';
import * as exception from 'express-exception-handler';

exception.handle();
setMaxListners(config);
const app = express();
const http = new createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(boolParser());
app.use(expresslogger());
app.use((req, res, next) => {
  req.config = config;
  req.logger = logger;
  var old = res.send;
  res.send = async data => {
    const content = req.headers['content-type'];
    if (content === 'application/json') {
      data = JSON.parse(data);
      if (!data.session) {
        data.session = req.client ? req.client.session : '';
      }
      if (data.mapper && req.config.mapperEnable) {
        data.response = await convert(req.config.mapperPrefix, data.response, data.mapper);
        delete data.mapper;
      }
    }
    res.send = old;
    return res.send(data);
  };
  next();
});
app.use('/', router);
app.use('/static', express.static(config.sessionDirectory));
export const server = http.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
  logger.info(`Visit http://localhost:${config.port}/api/ping, http://${getIPAddress()}:${config.port}/api/ping`);
  logger.debug(config);
  if (config.startAllSession) {
    startAllSession(config, logger);
  }
});
