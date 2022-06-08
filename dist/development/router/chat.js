"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _express = require("express");
var ChatController = _interopRequireWildcard(require("../controller/chat"));
var _authentication = _interopRequireDefault(require("../midleware/authentication"));
var _connection = _interopRequireDefault(require("../midleware/connection"));function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

const router = new _express.Router({ mergeParams: true });

router.post('/sendPresenceUpdate', _authentication.default, _connection.default, ChatController.sendPresenceUpdate);
router.post('/onWhatsApp', _authentication.default, _connection.default, ChatController.onWhatsApp);
router.post('/onWhatsApp', _authentication.default, _connection.default, ChatController.onWhatsApp);
router.post('/profilePictureUrl', _authentication.default, _connection.default, ChatController.profilePictureUrl);
router.post('/fetchStatus', _authentication.default, _connection.default, ChatController.fetchStatus);
router.post('/presenceSubscribe', _authentication.default, _connection.default, ChatController.presenceSubscribe);
router.post('/chats', _authentication.default, _connection.default, ChatController.chats);

exports.chat = router;
//# sourceMappingURL=chat.js.map