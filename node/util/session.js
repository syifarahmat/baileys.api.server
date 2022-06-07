import makeWASocket, { Browsers, DisconnectReason, downloadContentFromMessage, downloadMediaMessage, fetchLatestBaileysVersion, makeInMemoryStore, useMultiFileAuthState } from '@adiwajshing/baileys';
import { clientsArray } from './variable';
import path from 'path';
import { callWebHook, sendUnread } from './functions';
import fs from 'fs';
import * as mime from 'mime-types';

export default class SessionUtil {
  getClient(session) {
    let client = clientsArray[session];
    if (!client) {
      client = clientsArray[session] = { status: null, session: session };
    }
    return client;
  }
  async syncConfig(req, session, client) {
    const config = fs.existsSync(path.join(req.config.sessionDirectory, session, 'config.json')) ? JSON.parse(fs.readFileSync(path.join(req.config.sessionDirectory, session, 'config.json'))) : {};
    Object.assign(config, client.config);
    Object.assign(config, { status: client.status });
    fs.writeFileSync(path.join(req.config.sessionDirectory, session, 'config.json'), JSON.stringify(config));
  }
  async downloadMediaMessage(req, session, message, type) {
    const messageType = Object.keys(message.message)[0];
    const extension = mime.extension(message.message[messageType].mimetype);
    if (fs.existsSync(path.join(req.config.sessionDirectory, session, messageType, `${message.key.id}.${extension}`))) {
      return path.join(req.config.sessionDirectory, session, messageType, `${message.key.id}.${extension}`);
    }
    const buffer = await downloadMediaMessage(
      message,
      type,
      {},
      {
        logger: req.logger,
        reuploadRequest: req.client.updateMediaMessage,
      },
    );
    const writeFileWait = (path, data) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(path, data, error => {
          if (error) reject(error);
          else resolve(path);
        });
      });
    };
    if (!fs.existsSync(path.join(req.config.sessionDirectory, session, messageType))) {
      fs.mkdirSync(path.join(req.config.sessionDirectory, session, messageType), { recursive: true });
    }
    return await writeFileWait(path.join(req.config.sessionDirectory, session, messageType, `${message.key.id}.${extension}`), buffer);
  }
  async createSession(req, clientsArray, session, res) {
    let client = this.getClient(session);
    if (client.status != null && client.status !== 'close') {
      await sendUnread(client, req);
      return;
    }
    Object.assign(client, { status: 'initializing', config: req.body });
    const { state, saveCreds } = await useMultiFileAuthState(path.join(req.config.sessionDirectory, session));
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WhatsApp v${version.join('.')}${isLatest ? ', lates version' : ''}`);
    let sockect = makeWASocket({
      version,
      logger: req.logger.child({}),
      printQRInTerminal: client.config.printQRInTerminal ? client.config.printQRInTerminal : req.config.printQRInTerminal,
      auth: state,
      msgRetryCounterMap: {},
      browser: Browsers.macOS(req.config.browserName),
    });
    const store = makeInMemoryStore({ logger: req.logger });
    try {
      store.readFromFile(path.join(req.config.sessionDirectory, session, 'store.json'));
    } catch (e) {
      fs.rmSync(path.join(req.config.sessionDirectory, session, 'store.json'));
    }
    setInterval(() => {
      try {
        store.writeToFile(path.join(req.config.sessionDirectory, session, 'store.json'));
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
        callWebHook(client, req, `connection.${connection}`, {
          data: data,
        });
        return;
      }
      if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          Object.assign(client, { status: 'close' });
          await this.createSession(req, clientsArray, session, res);
        } else {
          Object.assign(client, { status: 'close' });
          clientsArray[session] = undefined;
          callWebHook(client, req, `connection.${connection}`, {
            data: data,
          });
          fs.rmSync(path.join(req.config.sessionDirectory, session), { recursive: true });
        }
      }
      if (connection === 'open') {
        Object.assign(client, { status: 'open' });
        await this.syncConfig(req, session, client);
        callWebHook(client, req, `connection.${connection}`, {
          data: data,
        });
        await sendUnread(client, req);
      }
      if (connection) {
        if (connection !== 'close') {
          callWebHook(client, req, `connection.${connection}`, {
            data: data,
          });
        }
      }
      if (qr) {
        Object.assign(client, { status: 'qrcode', qrcode: qr });
        await this.syncConfig(req, session, client);
        callWebHook(client, req, 'connection.qrcode', {
          data: data,
        });
      }
    });
    sockect.ev.on('call', (data, _) => {
      callWebHook(client, req, 'call', {
        data: data,
      });
    });
    sockect.ev.on('chats.set', (data, _) => {
      callWebHook(client, req, 'chats.set', {
        data: data,
      });
    });
    sockect.ev.on('chats.upsert', (data, _) => {
      callWebHook(client, req, 'chats.upsert', {
        data: data,
      });
    });
    sockect.ev.on('chats.update', (data, _) => {
      callWebHook(client, req, 'chats.update', {
        data: data,
      });
    });
    sockect.ev.on('chats.delete', (data, _) => {
      callWebHook(client, req, 'chats.delete', {
        data: data,
      });
    });
    sockect.ev.on('contacts.set', (data, _) => {
      callWebHook(client, req, 'contacts.set', {
        data: data,
      });
    });
    sockect.ev.on('contacts.upsert', (data, _) => {
      callWebHook(client, req, 'contacts.upsert', {
        data: data,
      });
    });
    sockect.ev.on('messages.set', (data, _) => {
      callWebHook(client, req, 'messages.set', {
        data: data,
      });
    });
    sockect.ev.on('messages.upsert', async (data, _) => {
      callWebHook(client, req, 'messages.upsert', {
        data: data,
      });
      const messageType = data.messages[0].message ? (data.messages[0].key.fromMe ? false : Object.keys(data.messages[0].message)[0]) : false;
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
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('message-info.update', (data, _) => {
      callWebHook(client, req, 'messages.info.update', {
        data: data,
      });
    });
    sockect.ev.on('message-receipt.update', (data, _) => {
      callWebHook(client, req, 'messages.receipt.update', {
        data: data,
      });
    });
    sockect.ev.on('messages.delete', (data, _) => {
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('contacts.update', (data, _) => {
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('groups.update', (data, _) => {
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('group-participants.update', (data, _) => {
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('blocklist.set', (data, _) => {
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('blocklist.update', (data, _) => {
      callWebHook(client, req, 'messages.update', {
        data: data,
      });
    });
    sockect.ev.on('presence.update', (data, _) => {
      callWebHook(client, req, 'presence.update', {
        data: data,
      });
    });
  }
}
