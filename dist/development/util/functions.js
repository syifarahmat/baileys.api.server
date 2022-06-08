"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.callWebHook = callWebHook;exports.getAllSession = getAllSession;exports.getIPAddress = getIPAddress;exports.getJid = getJid;exports.jidToArray = jidToArray;exports.markReadMessages = markReadMessages;exports.sendUnread = sendUnread;exports.setMaxListners = setMaxListners;exports.startAllSession = startAllSession;exports.stringToBoolean = stringToBoolean;exports.unlinkAsync = void 0;exports.verifyJid = verifyJid;var _axios = _interopRequireDefault(require("axios"));
var _fs = _interopRequireDefault(require("fs"));
var _util = require("util");
var _index = require("../mapper/index");
var _path = _interopRequireDefault(require("path"));

async function getAllSession(req) {
  let canStart = [];
  const sessions = _fs.default.readdirSync(_path.default.join(req.config.sessionDirectory));
  sessions.map((file) => {
    if (_fs.default.existsSync(_path.default.join(req.config.sessionDirectory, file, 'config.json'))) {
      let config = _fs.default.readFileSync(_path.default.join(req.config.sessionDirectory, file, 'config.json'));
      canStart.push({ session: file, config: JSON.parse(config) });
    }
  });
  return canStart;
}
function jidToArray(toJid) {
  let array = [];
  if (Array.isArray(toJid)) {
    for (let jid of toJid) {
      jid = getJid(jid);
      if (jid !== '') {
        array.push(jid);
      }
    }
  } else {
    let jids = toJid.split(/\s*[,;]\s*/g);
    for (let jid of jids) {
      jid = getJid(jid);
      if (jid !== '') {
        array.push(jid);
      }
    }
  }
  return array;
}
async function callWebHook(client, req, event, data) {
  const webhook = client?.config.webhookUrl || req.config.webhookUrl || false;
  if (webhook) {
    try {
      data = Object.assign({ event: event, session: client.session }, data);
      if (req.config.mapperEnable) data = await (0, _index.convert)(req.config.mapperPrefix, data);
      _axios.default.
      post(webhook, data).
      then(async () => {
        try {
          const events = ['messages.upsert'];
          if (events.includes(event) && data.data.type === 'notify' && req.config.webhookReadMessage) {
            for (const message of data.data.messages ? data.data.messages : []) {
              if (message.key && !message.key.fromMe) {
                await markReadMessages(message.key.remoteJid, client, [message]);
              }
            }
          }
        } catch (e) {
          req.logger.error(e);
        }
      }).
      catch((e) => {
        req.logger.warn('Error calling webhook', e);
      });
    } catch (e) {
      req.logger.error(e);
    }
  }
}
async function startAllSession(config, logger) {
  try {
    await _axios.default.get(`http://${getIPAddress()}:${config.port}/api/session/startup/${config.secretKey}`);
  } catch (e) {
    logger.error(e);
  }
}
async function sendUnread(client, req) {
  req.logger.info(`Start sending unread messages from session ${client.session}`);
  try {
    for (const chat of await client.store.chats.all()) {
      if (chat.unreadCount > 0) {
        for (const message of await client.store.loadMessages(chat.id, req.config.sendUnreadCount)) {
          if (!message.key.fromMe && !(message.status === 4 || message.status === 'READ')) {
            req.logger.debug(`Send message id ${message.key.id}, fromMe ${message.key.fromMe}, status ${message.status} to webhook`);
            await callWebHook(client, req, 'messages.upsert', {
              data: {
                messages: [message],
                type: 'notify' } });


          }
        }
      }
    }
    req.logger.info(`End send unread messages from session ${client.session}`);
  } catch (e) {
    req.logger.error(e);
  }
}
async function markReadMessages(jid, client, messages) {
  for (const message of messages ? messages : []) {
    if (message.key && !message.key.fromMe) {
      await client.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id]);
      let update = await client.store.loadMessage(jid, message.key.id);
      await client.store.messages[jid].updateAssign(message.key.id, { ...update, status: 'READ' });
    }
  }
}
function getJid(jid) {
  if (jid.includes('@g.us') || jid.includes('@c.us') || jid.includes('@s.whatsapp.net')) return jid.trim();
  return jid.includes('-') || jid.split('@')[0].length > 13 ? `${jid}@g.us`.trim() : `${jid}@s.whatsapp.net`.trim();
}
async function verifyJid(client, jid) {
  if (jid.includes('@g.us')) {
    return true;
  }
  const [result] = await client.onWhatsApp(jid.trim());
  if (result?.exists) {
    return true;
  }
  throw new Error(`Jid ${jid.trim()} not registered on WhatsApp`);
}
function stringToBoolean(s) {
  return /^(true|1)$/i.test(s);
}
function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var name in interfaces) {
    var current = interfaces[name];
    for (var loop = 0; loop < current.length; loop++) {
      var alias = current[loop];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) return alias.address;
    }
  }
  return '127.0.0.1';
}
function setMaxListners(config) {
  if (config && Number.isInteger(config.maxListeners)) {
    process.setMaxListeners(config.maxListeners);
  }
}

let unlinkAsync = (0, _util.promisify)(_fs.default.unlink);exports.unlinkAsync = unlinkAsync;
//# sourceMappingURL=functions.js.map