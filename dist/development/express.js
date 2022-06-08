"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.server = void 0;var _cors = _interopRequireDefault(require("cors"));
var _express = _interopRequireDefault(require("express"));
var _http = require("http");
var _expressQueryBoolean = _interopRequireDefault(require("express-query-boolean"));
var _config = _interopRequireDefault(require("./config"));
var _index = require("./mapper/index");
var _logger = require("./util/logger");
var _router = _interopRequireDefault(require("./router"));
var _functions = require("./util/functions");
var exception = _interopRequireWildcard(require("express-exception-handler"));function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

exception.handle();
(0, _functions.setMaxListners)(_config.default);
const app = (0, _express.default)();
const http = new _http.createServer(app);

app.use((0, _cors.default)());
app.use(_express.default.json({ limit: '50mb' }));
app.use(_express.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, _expressQueryBoolean.default)());
app.use((0, _logger.expresslogger)());
app.use((req, res, next) => {
  req.config = _config.default;
  req.logger = _logger.logger;
  var old = res.send;
  res.send = async (data) => {
    const content = req.headers['content-type'];
    if (content === 'application/json') {
      data = JSON.parse(data);
      if (!data.session) {
        data.session = req.client ? req.client.session : '';
      }
      if (data.mapper && req.config.mapperEnable) {
        data.response = await (0, _index.convert)(req.config.mapperPrefix, data.response, data.mapper);
        delete data.mapper;
      }
    }
    res.send = old;
    return res.send(data);
  };
  next();
});
app.use('/', _router.default);
app.use('/static', _express.default.static(_config.default.sessionDirectory));
const server = http.listen(_config.default.port, () => {
  _logger.logger.info(`Server is running on port ${_config.default.port}`);
  _logger.logger.info(`Visit http://localhost:${_config.default.port}/api/ping, http://${(0, _functions.getIPAddress)()}:${_config.default.port}/api/ping`);
  _logger.logger.debug(_config.default);
  if (_config.default.startAllSession) {
    (0, _functions.startAllSession)(_config.default, _logger.logger);
  }
});exports.server = server;
//# sourceMappingURL=express.js.map