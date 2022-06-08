"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _path = _interopRequireDefault(require("path"));
var _multer = _interopRequireDefault(require("multer"));
var _fs = _interopRequireDefault(require("fs"));
var _config = _interopRequireDefault(require("../config"));

const storage = _multer.default.diskStorage({
  destination: function (req, file, callback) {
    if (!_fs.default.existsSync(_path.default.join(_config.default.sessionDirectory, req.params.session, 'uploads'))) {
      _fs.default.mkdirSync(_path.default.join(_config.default.sessionDirectory, req.params.session, 'uploads'), {
        recursive: true });

    }
    callback(null, _path.default.join(_config.default.sessionDirectory, req.params.session, 'uploads'));
  },
  filename: function (req, file, callback) {
    let filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  } });


const uploadUtil = (0, _multer.default)({ storage: storage });var _default =
uploadUtil;exports.default = _default;
//# sourceMappingURL=upload.js.map