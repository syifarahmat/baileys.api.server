"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _express = require("express");
var IndexController = _interopRequireWildcard(require("../controller"));
var SessionController = _interopRequireWildcard(require("../controller/session"));
var _session2 = require("./session");
var _message = require("./message");
var _chat = require("./chat");function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

const router = new _express.Router({ mergeParams: true });

router.get('/api/ping', IndexController.ping);
router.route('/api/session/startup/:secret').get(SessionController.startAll).post(SessionController.startAll);
router.route('/api/session/restart/:secret').get(SessionController.restartAll).post(SessionController.restartAll);
router.use('/api/:session/session', _session2.session);
router.use('/api/:session/message', _message.message);
router.use('/api/:session/chat', _chat.chat);var _default =

router;exports.default = _default;
//# sourceMappingURL=index.js.map