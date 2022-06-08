"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = verifyConnection;var _functions = require("../util/functions");

async function verifyConnection(req, res, next) {
  try {
    if (req.client) {
      let array = (0, _functions.jidToArray)(req.body.toJid ? req.body.toJid : req.body.fromJid ? req.body.fromJid : []);
      for (const jid of array) {
        const index = array.indexOf(jid);
        if (!(await (0, _functions.verifyJid)(req.client, jid))) {
          array.splice(index, 1);
        }
      }
      req.body.toJid = req.body.fromJid = array;
    } else {
      return res.status(404).json({
        connected: false,
        error: 'WhatsApp session is not active' });

    }
    next();
  } catch (e) {
    req.logger.error(e);
    return res.status(404).json({
      error: e.message });

  }
}
//# sourceMappingURL=connection.js.map