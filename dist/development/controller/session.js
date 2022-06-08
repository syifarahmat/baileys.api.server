"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.close = close;exports.create = create;exports.encrypt = encrypt;exports.info = info;exports.logOut = logOut;exports.restart = restart;exports.restartAll = restartAll;exports.startAll = startAll;exports.state = state;var _session = _interopRequireDefault(require("../util/session"));
var _variable = require("../util/variable");
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _functions = require("../util/functions");

async function encrypt(req, res) {
  const { session, secret } = req.params;
  const { authorization: token } = req.headers;
  const secure = req.config.secretKey;
  let tokenDecrypt = '';
  if (secret === undefined) {
    tokenDecrypt = token.split(' ')[0];
  } else {
    tokenDecrypt = secret;
  }
  if (tokenDecrypt !== secure) {
    return res.status(400).json({
      error: 'The secret is incorrect' });

  }
  _bcrypt.default.hash(session + secure, 10, function (error, hash) {
    if (error) return res.status(500).json(error);
    const hashFormat = hash.replace(/\//g, '_').replace(/\+/g, '-');
    return res.status(201).json({
      session: session,
      token: hashFormat,
      full: `${session}:${hashFormat}` });

  });
}
async function create(req, res) {
  const { session } = req.params;
  const sessionUtil = new _session.default();
  await state(req, res);
  await sessionUtil.createSession(req, _variable.clientsArray, session);
}
async function restart(req, res) {
  const { session } = req.params;
  _variable.clientsArray[session] = undefined;
  const sessionUtil = new _session.default();
  await sessionUtil.createSession(req, _variable.clientsArray, session, res);
  return await res.status(201).json({ success: `Restarting sessions ${session}`, session: session });
}
async function restartAll(req, res) {
  Object.assign(req, {
    params: {
      force: true,
      ...req.params } });


  return await startAll(req, res);
}
async function startAll(req, res) {
  const { secret, force = false } = req.params;
  const { authorization: token } = req.headers;
  let tokenDecrypt = '';
  if (secret === undefined) {
    tokenDecrypt = token.split(' ')[0];
  } else {
    tokenDecrypt = secret;
  }
  const sessions = await (0, _functions.getAllSession)(req);
  if (tokenDecrypt !== req.config.secretKey) {
    return res.status(400).json({
      error: 'The token is incorrect' });

  }
  sessions.map(async (session) => {
    const sessionUtil = new _session.default();
    if (session.config) {
      Object.assign(req, { body: session.config });
    }
    if (force) {
      _variable.clientsArray[session.session] = undefined;
    }
    await sessionUtil.createSession(req, _variable.clientsArray, session.session, res);
  });
  return await res.status(201).json({ success: `${force ? 'Restarting' : 'Starting'} ${sessions.length} sessions`, sessions: sessions });
}
async function state(req, res) {
  const { session } = req.params;
  try {
    const client = req.client;
    if (client == null || client.status == null) {
      return res.status(200).json({ connected: false, session: session });
    } else {
      return res.status(200).json({
        connection: client.status,
        qrcode: client.qrcode });

    }
  } catch (e) {
    req.logger.error(e);
    return res.status(500).json({ connected: false, error: 'The session is not active' });
  }
}
async function logOut(req, res) {
  const { session } = req.params;
  try {
    const client = req.client;
    if (client == null || client.status == null) {
      return res.status(200).json({ connected: false, session: session });
    } else {
      await client.logout();
      return res.status(200).json({
        connection: client.status,
        qrcode: client.qrcode });

    }
  } catch (e) {
    req.logger.error(e);
    return res.status(500).json({ error: 'The session is not active' });
  }
}
async function close(req, res) {
  const { session } = req.params;
  try {
    const client = req.client;
    if (client == null || client.status == null) {
      return res.status(200).json({ connected: false, session: session });
    } else {
      _variable.clientsArray[session] = undefined;
      return res.status(200).json({
        connection: client.status,
        qrcode: client.qrcode });

    }
  } catch (e) {
    req.logger.error(e);
    return res.status(500).json({ error: 'The session is not active' });
  }
}
async function info(req, res) {
  const { session } = req.params;
  try {
    const client = req.client;
    if (client.status == null) {
      return res.status(200).json({ session: session });
    } else {
      return res.status(200).json({
        connection: client.status,
        info: { ...client.user, session: session } });

    }
  } catch (e) {
    req.logger.error(e);
    return res.status(500).json({ error: 'The session is not active' });
  }
}
//# sourceMappingURL=session.js.map