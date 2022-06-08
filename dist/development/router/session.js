"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");var _express = require("express");
var SessionController = _interopRequireWildcard(require("../controller/session"));
var _authentication = _interopRequireDefault(require("../midleware/authentication"));function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

const router = new _express.Router({ mergeParams: true });

router.get('/encrypt/:secret', SessionController.encrypt);
router.get('/create', _authentication.default, SessionController.create);
router.get('/restart', _authentication.default, SessionController.restart);
router.get('/state', _authentication.default, SessionController.state);
router.get('/close', _authentication.default, SessionController.close);
router.get('/logOut', _authentication.default, SessionController.logOut);
router.get('/info', _authentication.default, SessionController.info);

exports.session = router;
//# sourceMappingURL=session.js.map