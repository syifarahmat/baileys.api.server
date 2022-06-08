"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _commander = require("commander");
var _mergeDeep = _interopRequireDefault(require("merge-deep"));
var _fs = _interopRequireDefault(require("fs"));
var _functions = require("./util/functions");function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}
const config = {};

const packages = async () => {
  try {
    return await Promise.resolve().then(() => _interopRequireWildcard(require('../package.json')));
  } catch (e) {}
};

const commander = new _commander.Command();

commander.
version(packages.version ? packages.version : Math.floor(Math.random() * 200), '-v, --version').
usage('[OPTIONS]...').
option('-sk, --secretKey <value>', 'Define secret key to genereta access token', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').
option('-p, --port <number>', 'Define listing port', 3333).
option('-an, --applicationName <value>', 'Define application name', 'WhatsApp.Bot').
option('-ll, --logLevel <value>', 'Define log level', 'debug').
option('-lp, --logPretty <value>', 'Define log pretty print', true).
option('-qr, --printQRInTerminal <value>', 'Define print qrcode in terminal', true).
option('-lc, --logColorize <value>', 'Define log colorize print', true).
option('-lmf, --logMessageFormat <value>', 'Define log message format', false).
option('-ltm, --logTranslateTime <value>', 'Define log translate the epoch time value into a human readable date and time string', true).
option('-bn, --browserName <value>', 'Set device browser name', 'Chrome').
option('-sas, --startAllSession <value>', 'Define starts all sessions when starting the server', true).
option('-ml, --maxListeners <number>', 'Define the maximum global listeners. 0 = infinity', 15).
option('-sd, --sessionDirectory <value>', 'Define sessionDirectory for each whatsapp instance for working with multi device', './session/').
option('-wu, --webhookUrl <value>', 'Define event webhook url to send all event', 'http://127.0.0.1:3000/hook/').
option('-wad, --mediaAutoDownload <value>', 'Define automatically downloads files to upload to the webhook', true).
option('-wrm, --webhookReadMessage <value>', 'Define to marks messages as read when the webhook returns ok', true).
option('-suc, --sendUnreadCount <value>', 'Define to load message count from unread chats', 100).
option('-c, --config <value>', 'Read config from json file or json string', {}).
parse(process.argv);

let options = commander.opts();
Object.assign(options, {
  port: parseInt(options.port),
  maxListeners: parseInt(options.maxListeners),
  logPretty: (0, _functions.stringToBoolean)(options.logPretty),
  printQRInTerminal: (0, _functions.stringToBoolean)(options.printQRInTerminal),
  logColorize: (0, _functions.stringToBoolean)(options.logColorize),
  logMessageFormat: (0, _functions.stringToBoolean)(options.logMessageFormat),
  logTranslateTime: (0, _functions.stringToBoolean)(options.logTranslateTime),
  startAllSession: (0, _functions.stringToBoolean)(options.startAllSession),
  mediaAutoDownload: (0, _functions.stringToBoolean)(options.mediaAutoDownload),
  webhookReadMessage: (0, _functions.stringToBoolean)(options.webhookReadMessage) });

options = (0, _mergeDeep.default)({}, config, options);
if (!_fs.default.existsSync(options.sessionDirectory)) {
  _fs.default.mkdirSync(options.sessionDirectory, { recursive: true });
}
if (_fs.default.existsSync(options.config)) {
  try {
    const json = JSON.parse(_fs.default.readFileSync(options.config));
    options = (0, _mergeDeep.default)(options, json);
  } catch (e) {}
} else {
  try {
    const json = JSON.parse(options.config);
    options = (0, _mergeDeep.default)(options, json);
  } catch (e) {}
}

module.exports = {
  ...options };
//# sourceMappingURL=config.js.map