import { jidToArray, verifyJid } from '../util/functions';

export default async function verifyConnection(req, res, next) {
  try {
    if (req.client) {
      let array = jidToArray(req.body.toJid ? req.body.toJid : req.body.fromJid ? req.body.fromJid : []);
      for (const jid of array) {
        const index = array.indexOf(jid);
        if (!(await verifyJid(req.client, jid))) {
          array.splice(index, 1);
        }
      }
      req.body.toJid = req.body.fromJid = array;
    } else {
      return res.status(404).json({
        connected: false,
        error: 'WhatsApp session is not active',
      });
    }
    next();
  } catch (e) {
    req.logger.error(e);
    return res.status(404).json({
      error: e.message,
    });
  }
}
