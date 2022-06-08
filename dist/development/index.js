"use strict";var _express = require("./express");
var _logger = require("./util/logger");

const exitHandler = () => {
  if (_express.server) {
    _express.server.close(() => {
      _logger.logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
const unexpectedErrorHandler = (error) => {
  _logger.logger.error(error);
  exitHandler();
};
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
  _logger.logger.info('SIGTERM received');
  if (_express.server) {
    _express.server.close();
  }
});
//# sourceMappingURL=index.js.map