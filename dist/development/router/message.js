"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _express = require("express");
var MessageController = _interopRequireWildcard(require("../controller/message"));
var _multer = _interopRequireDefault(require("multer"));
var _authentication = _interopRequireDefault(require("../midleware/authentication"));
var _connection = _interopRequireDefault(require("../midleware/connection"));function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage(),
  inMemory: true }).
single('file');
const router = new _express.Router({ mergeParams: true });

router.post('/sendText', _authentication.default, _connection.default, MessageController.sendText);
router.post('/sendImage', upload, _authentication.default, _connection.default, MessageController.sendImage);
router.post('/sendVideo', upload, _authentication.default, _connection.default, MessageController.sendVideo);
router.post('/sendAudio', upload, _authentication.default, _connection.default, MessageController.sendAudio);
router.post('/sendDocument', upload, _authentication.default, _connection.default, MessageController.sendDocument);
router.post('/sendSticker', upload, _authentication.default, _connection.default, MessageController.sendSticker);
router.post('/sendButton', _authentication.default, _connection.default, MessageController.sendButton);
router.post('/sendMediaButton', upload, _authentication.default, _connection.default, MessageController.sendMediaButton);
router.post('/sendList', _authentication.default, _connection.default, MessageController.sendList);
router.post('/sendContact', _authentication.default, _connection.default, MessageController.sendContact);
router.post('/forward', _authentication.default, _connection.default, MessageController.forward);
router.post('/reaction', _authentication.default, _connection.default, MessageController.reaction);
router.post('/loadMessages', _authentication.default, _connection.default, MessageController.loadMessages);
router.post('/loadMessage', _authentication.default, _connection.default, MessageController.loadMessage);
router.post('/sendReadReceipt', _authentication.default, _connection.default, MessageController.sendReadReceipt);

exports.message = router;
//# sourceMappingURL=message.js.map