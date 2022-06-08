"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _baileys = _interopRequireWildcard(require("@adiwajshing/baileys"));
var _variable = require("./variable");
var _path = _interopRequireDefault(require("path"));
var _functions = require("./functions");
var _fs = _interopRequireDefault(require("fs"));
var mime = _interopRequireWildcard(require("mime-types"));
var _logger = require("./logger");function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

class SessionUtil {
  getClient(session) {
    let client = _variable.clientsArray[session];
    if (!client) {
      client = _variable.clientsArray[session] = { status: null, session: session };
    }
    return client;
  }
  async syncConfig(req, session, client) {
    const config = _fs.default.existsSync(_path.default.join(req.config.sessionDirectory, session, 'config.json')) ? JSON.parse(_fs.default.readFileSync(_path.default.join(req.config.sessionDirectory, session, 'config.json'))) : {};
    Object.assign(config, client.config);
    Object.assign(config, { status: client.status });
    _fs.default.writeFileSync(_path.default.join(req.config.sessionDirectory, session, 'config.json'), JSON.stringify(config));
  }
  async downloadMediaMessage(req, session, message, type) {
    const messageType = Object.keys(message.message)[0];
    const extension = mime.extension(message.message[messageType].mimetype);
    if (_fs.default.existsSync(_path.default.join(req.config.sessionDirectory, session, messageType, `${message.key.id}.${extension}`))) {
      return _path.default.join(req.config.sessionDirectory, session, messageType, `${message.key.id}.${extension}`);
    }
    const buffer = await (0, _baileys.downloadMediaMessage)(
    message,
    type,
    {},
    {
      logger: req.logger,
      reuploadRequest: req.client.updateMediaMessage });


    const writeFileWait = (path, data) => {
      return new Promise((resolve, reject) => {
        _fs.default.writeFile(path, data, (error) => {
          if (error) reject(error);else
          resolve(path);
        });
      });
    };
    if (!_fs.default.existsSync(_path.default.join(req.config.sessionDirectory, session, messageType))) {
      _fs.default.mkdirSync(_path.default.join(req.config.sessionDirectory, session, messageType), { recursive: true });
    }
    return await writeFileWait(_path.default.join(req.config.sessionDirectory, session, messageType, `${message.key.id}.${extension}`), buffer);
  }
  async createSession(req, clientsArray, session, res) {
    let client = this.getClient(session);
    if (client.status != null && client.status !== 'close') {
      await (0, _functions.sendUnread)(client, req);
      return;
    }
    Object.assign(client, { status: 'initializing', config: req.body });
    const { state, saveCreds } = await (0, _baileys.useMultiFileAuthState)(_path.default.join(req.config.sessionDirectory, session));
    const { version, isLatest } = await (0, _baileys.fetchLatestBaileysVersion)();
    _logger.logger.info(`Using WhatsApp v${version.join('.')}${isLatest ? ', lates version' : ''}`);
    let sockect = (0, _baileys.default)({
      version,
      logger: req.logger.child({}),
      printQRInTerminal: client.config.printQRInTerminal ? client.config.printQRInTerminal : req.config.printQRInTerminal,
      auth: state,
      msgRetryCounterMap: {},
      browser: _baileys.Browsers.macOS(req.config.browserName) });

    const store = (0, _baileys.makeInMemoryStore)({ logger: req.logger });
    try {
      store.readFromFile(_path.default.join(req.config.sessionDirectory, session, 'store.json'));
    } catch (e) {
      _fs.default.rmSync(_path.default.join(req.config.sessionDirectory, session, 'store.json'));
    }
    setInterval(() => {
      try {
        store.writeToFile(_path.default.join(req.config.sessionDirectory, session, 'store.json'));
      } catch (e) {}
    }, 10000);
    client = clientsArray[session] = Object.assign(sockect, { ...client, store: store });
    store.bind(sockect.ev);
    sockect.ev.on('creds.update', saveCreds);
    sockect.ev.on('connection.update', async (data, _) => {
      const { connection, lastDisconnect, qr } = data;
      if (connection === 'connecting') {
        Object.assign(client, { status: 'connecting' });
        await this.syncConfig(req, session, client);
        (0, _functions.callWebHook)(client, req, `connection.${connection}`, {
          data: data });

        return;
      }
      if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode !== _baileys.DisconnectReason.loggedOut) {
          Object.assign(client, { status: 'close' });
          await this.createSession(req, clientsArray, session, res);
        } else {
          Object.assign(client, { status: 'close' });
          clientsArray[session] = undefined;
          (0, _functions.callWebHook)(client, req, `connection.${connection}`, {
            data: data });

          _fs.default.rmSync(_path.default.join(req.config.sessionDirectory, session), { recursive: true });
        }
      }
      if (connection === 'open') {
        Object.assign(client, { status: 'open' });
        await this.syncConfig(req, session, client);
        (0, _functions.callWebHook)(client, req, `connection.${connection}`, {
          data: data });

        await (0, _functions.sendUnread)(client, req);
      }
      if (connection) {
        if (connection !== 'close') {
          (0, _functions.callWebHook)(client, req, `connection.${connection}`, {
            data: data });

        }
      }
      if (qr) {
        Object.assign(client, { status: 'qrcode', qrcode: qr });
        await this.syncConfig(req, session, client);
        (0, _functions.callWebHook)(client, req, 'connection.qrcode', {
          data: data });

      }
    });
    sockect.ev.on('call', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'call', {
        data: data });

    });
    sockect.ev.on('chats.set', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'chats.set', {
        data: data });

    });
    sockect.ev.on('chats.upsert', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'chats.upsert', {
        data: data });

    });
    sockect.ev.on('chats.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'chats.update', {
        data: data });

    });
    sockect.ev.on('chats.delete', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'chats.delete', {
        data: data });

    });
    sockect.ev.on('contacts.set', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'contacts.set', {
        data: data });

    });
    sockect.ev.on('contacts.upsert', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'contacts.upsert', {
        data: data });

    });
    sockect.ev.on('messages.set', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.set', {
        data: data });

    });
    sockect.ev.on('messages.upsert', async (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.upsert', {
        data: data });

      const messageType = data.messages[0].message ? data.messages[0].key.fromMe ? false : Object.keys(data.messages[0].message)[0] : false;
      if (['stickerMessage', 'imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(messageType) && req.config.mediaAutoDownload) {
        if (Number(data.messages[0].message[messageType].fileLength) < 10485760) {
          if (messageType === 'stickerMessage') {
            await this.downloadMediaMessage(req, session, data.messages[0], 'buffer');
          }
          if (messageType === 'imageMessage') {
            await this.downloadMediaMessage(req, session, data.messages[0], 'buffer');
          }
          if (messageType === 'videoMessage') {
            await this.downloadMediaMessage(req, session, data.messages[0], 'buffer');
          }
          if (messageType === 'audioMessage') {
            await this.downloadMediaMessage(req, session, data.messages[0], 'buffer');
          }
          if (messageType === 'documentMessage') {
            await this.downloadMediaMessage(req, session, data.messages[0], 'buffer');
          }
        }
      }
    });
    sockect.ev.on('messages.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('message-info.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.info.update', {
        data: data });

    });
    sockect.ev.on('message-receipt.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.receipt.update', {
        data: data });

    });
    sockect.ev.on('messages.delete', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('contacts.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('groups.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('group-participants.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('blocklist.set', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('blocklist.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'messages.update', {
        data: data });

    });
    sockect.ev.on('presence.update', (data, _) => {
      (0, _functions.callWebHook)(client, req, 'presence.update', {
        data: data });

    });
  }}exports.default = SessionUtil;
//# sourceMappingURL=session.js.map