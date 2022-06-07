import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server as Socket } from 'socket.io';
import boolParser from 'express-query-boolean';
import config from './config';
import { convert } from './mapper/index';
import { expresslogger, logger } from './util/logger';
import router from './router';
import { startAllSession } from './util/functions';

const app = express();
const http = new createServer(app);
const io = new Socket(http, {
  cors: true,
  origins: ['*'],
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(boolParser());
app.use(expresslogger());
app.use((req, res, next) => {
  req.config = config;
  req.logger = logger;
  req.io = io;
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
io.on('connection', sock => {
  logger.info(`IO ${sock.id} connect`);
  sock.on('disconnect', () => {
    logger.info(`IO ${sock.id} disconnect`);
  });
});
export const server = http.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Visit ${config.host}:${config.port}`);
  if (config.startAllSession) {
    startAllSession(config, logger);
  }
});
