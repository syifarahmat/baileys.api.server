"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.expresslogger = expresslogger;exports.logger = void 0;var _pino = require("pino");
var _pinoHttp = require("pino-http");
var _pinoPretty = _interopRequireDefault(require("pino-pretty"));
var _config = _interopRequireDefault(require("../config"));

const stream = (0, _pinoPretty.default)({
  colorize: _config.default.logColorize,
  messageFormat: _config.default.logMessageFormat,
  translateTime: _config.default.logTranslateTime });

const logger = (0, _pino.pino)(
{
  timestamp: () => {
    const date = new Date();
    return `,"time":"${new Date(date.getTime() - date.getTimezoneOffset() * 60000).toJSON()}"`;
  },
  name: _config.default.applicationName,
  level: _config.default.logLevel },

_config.default.logPretty ? stream : undefined);exports.logger = logger;


function expresslogger() {
  return (0, _pinoHttp.pinoHttp)({
    logger: logger,
    serializers: {
      req(req) {
        req.body = req.raw.body;
        return req;
      } } });


}
//# sourceMappingURL=logger.js.map