import api from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import { convert } from '../mapper/index';
import path from 'path';

export async function getAllSession(req) {
  let canStart = [];
  const sessions = fs.readdirSync(path.join(req.config.sessionDirectory));
  sessions.map(file => {
    if (fs.existsSync(path.join(req.config.sessionDirectory, file, 'config.json'))) {
      let config = fs.readFileSync(path.join(req.config.sessionDirectory, file, 'config.json'));
      canStart.push({ session: file, config: JSON.parse(config) });
    }
  });
  return canStart;
}
export function jidToArray(toJid) {
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
export async function callWebHook(client, req, event, data) {
  const webhook = client?.config.webhookUrl || req.config.webhookUrl || false;
  if (webhook) {
    try {
      data = Object.assign({ event: event, session: client.session }, data);
      if (req.config.mapperEnable) data = await convert(req.config.mapperPrefix, data);
      api
        .post(webhook, data)
        .then(async () => {
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
        })
        .catch(e => {
          req.logger.warn('Error calling webhook', e);
        });
    } catch (e) {
      req.logger.error(e);
    }
  }
}
export async function startAllSession(config, logger) {
  try {
    await api.get(`http://${getIPAddress()}:${config.port}/api/session/startup/${config.secretKey}`);
  } catch (e) {
    logger.error(e);
  }
}
export async function sendUnread(client, req) {
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
                type: 'notify',
              },
            });
          }
        }
      }
    }
    req.logger.info(`End send unread messages from session ${client.session}`);
  } catch (e) {
    req.logger.error(e);
  }
}
export async function markReadMessages(jid, client, messages) {
  for (const message of messages ? messages : []) {
    if (message.key && !message.key.fromMe) {
      await client.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id]);
      let update = await client.store.loadMessage(jid, message.key.id);
      await client.store.messages[jid].updateAssign(message.key.id, { ...update, status: 'READ' });
    }
  }
}
export function getJid(jid) {
  if (jid.includes('@g.us') || jid.includes('@c.us') || jid.includes('@s.whatsapp.net')) return jid.trim();
  return jid.includes('-') || jid.split('@')[0].length > 13 ? `${jid}@g.us`.trim() : `${jid}@s.whatsapp.net`.trim();
}
export async function verifyJid(client, jid) {
  if (jid.includes('@g.us')) {
    return true;
  }
  const [result] = await client.onWhatsApp(jid.trim());
  if (result?.exists) {
    return true;
  }
  throw new Error(`Jid ${jid.trim()} not registered on WhatsApp`);
}
export function strToBool(s) {
  return /^(true|1)$/i.test(s);
}
export function getIPAddress() {
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
export function setMaxListners(config) {
  if (config && Number.isInteger(config.maxListeners)) {
    process.setMaxListeners(config.maxListeners);
  }
}

export let unlinkAsync = promisify(fs.unlink);
