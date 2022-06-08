"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.forward = forward;exports.loadMessage = loadMessage;exports.loadMessages = loadMessages;exports.reaction = reaction;exports.sendAudio = sendAudio;exports.sendButton = sendButton;exports.sendContact = sendContact;exports.sendDocument = sendDocument;exports.sendImage = sendImage;exports.sendList = sendList;exports.sendMedia = sendMedia;exports.sendMediaButton = sendMediaButton;exports.sendReadReceipt = sendReadReceipt;exports.sendSticker = sendSticker;exports.sendText = sendText;exports.sendVideo = sendVideo;var _fs = _interopRequireDefault(require("fs"));
var mime = _interopRequireWildcard(require("mime-types"));
var _baileys = require("@adiwajshing/baileys");function _getRequireWildcardCache(nodeInterop) {if (typeof WeakMap !== "function") return null;var cacheBabelInterop = new WeakMap();var cacheNodeInterop = new WeakMap();return (_getRequireWildcardCache = function (nodeInterop) {return nodeInterop ? cacheNodeInterop : cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj, nodeInterop) {if (!nodeInterop && obj && obj.__esModule) {return obj;}if (obj === null || typeof obj !== "object" && typeof obj !== "function") {return { default: obj };}var cache = _getRequireWildcardCache(nodeInterop);if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj.default = obj;if (cache) {cache.set(obj, newObj);}return newObj;}

async function sendText(req, res) {
  const { toJid, message, type, simulation = true } = req.body;
  const content = req.body.content ? req.body.content : {};
  const option = req.body.option ? req.body.option : {};
  try {
    let results = [];
    for (const jid of toJid) {
      if (simulation) {
        await req.client.presenceSubscribe(jid);
        await (0, _baileys.delay)(500);
        await req.client.sendPresenceUpdate('composing', jid);
      }
      if (typeof message === 'object') {
        results.push(
        await req.client.sendMessage(
        jid,
        {
          forward: message,
          ...content },

        {
          ...option }));



      } else if (typeof message === 'undefined') {
        results.push(
        await req.client.sendMessage(
        jid,
        {
          ...content },

        {
          ...option }));



      } else {
        results.push(
        await req.client.sendMessage(
        jid,
        {
          text: message,
          ...content },

        {
          ...option }));



      }
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: 'No message send, please verify' });

    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error sent ${type ? type : 'text'} message, ${e.message}` });

  } finally {
    for (const jid of toJid) {
      await req.client.sendPresenceUpdate('paused', jid);
    }
  }
}

async function sendMedia(req, res) {
  const { toJid, type, caption, path, simulation = true } = req.body;
  if (!type) {
    return res.status(401).send({
      error: `Sending media required type` });

  }
  if (!path && !req.file) {
    return res.status(401).send({
      error: `Sending the ${type} is required` });

  }
  const content = req.body.content ? req.body.content : {};
  if (!content.fileName) {
    Object.assign(content, {
      fileName: req.file ? req.file.originalname : type,
      ...content });

  }
  const option = req.body.option ? req.body.option : {};
  try {
    let results = [];
    for (const jid of toJid) {
      if (simulation) {
        await req.client.presenceSubscribe(jid);
        await (0, _baileys.delay)(500);
        if (type === 'audio') {
          await req.client.sendPresenceUpdate('recording', jid);
        } else {
          await req.client.sendPresenceUpdate('composing', jid);
        }
      }
      results.push(
      await req.client.sendMessage(
      jid,
      {
        mimetype: path ? mime.lookup(path) : req.file.mimetype,
        [type]: path ? path.startsWith('http') ? { url: path } : _fs.default.readFileSync(path) : req.file.buffer,
        caption: caption,
        ptt: type === 'audio',
        ...content },

      {
        ...option }));



    }
    if (results.length === 0) {
      return res.status(400).json({
        error: 'No message send, please verify jid' });

    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error sent ${type} message, ${e.message}` });

  } finally {
    for (const jid of toJid) {
      await req.client.sendPresenceUpdate('paused', jid);
    }
  }
}

async function sendImage(req, res) {
  Object.assign(req, {
    body: {
      type: 'image',
      ...req.body } });


  return await sendMedia(req, res);
}

async function sendVideo(req, res) {
  Object.assign(req, {
    body: {
      type: 'video',
      ...req.body } });


  return await sendMedia(req, res);
}

async function sendAudio(req, res) {
  Object.assign(req, {
    body: {
      type: 'audio',
      ...req.body } });


  return await sendMedia(req, res);
}

async function sendDocument(req, res) {
  Object.assign(req, {
    body: {
      type: 'document',
      ...req.body } });


  return await sendMedia(req, res);
}

async function sendSticker(req, res) {
  Object.assign(req, {
    body: {
      type: 'sticker',
      ...req.body } });


  return await sendMedia(req, res);
}

function prepareButton(buttons) {
  let template = [];
  buttons.map((button, index) => {
    if (button.type === 'replyButton') {
      template.push({
        quickReplyButton: {
          index: button.index ? button.index : index + 1,
          id: button.id ? button.id : button.title,
          displayText: button.title ?? '' } });


    }
    if (button.type === 'callButton') {
      template.push({
        callButton: {
          index: button.index ? button.index : index + 1,
          displayText: button.title ?? '',
          phoneNumber: button.payload ?? '' } });


    }
    if (button.type === 'urlButton') {
      template.push({
        urlButton: {
          index: button.index ? button.index : index + 1,
          displayText: button.title ?? '',
          url: button.payload ?? '' } });


    }
  });
  return template;
}

async function sendButton(req, res) {
  const { footer, buttons } = req.body;
  const content = req.body.content ? req.body.content : {};
  Object.assign(content, {
    footer: footer,
    templateButtons: prepareButton(buttons) });

  Object.assign(req, {
    body: {
      type: 'button',
      content: content,
      ...req.body } });


  return await sendText(req, res);
}

async function sendMediaButton(req, res) {
  const { footer, buttons } = req.body;
  const content = req.body.content ? req.body.content : {};
  Object.assign(content, {
    footer: footer,
    templateButtons: prepareButton(buttons) });

  Object.assign(req, {
    body: {
      content: content,
      ...req.body } });


  return await sendMedia(req, res);
}

async function sendList(req, res) {
  const { title, buttonText, footer, sections } = req.body;
  const content = req.body.content ? req.body.content : {};
  Object.assign(content, {
    footer: footer,
    sections: sections,
    buttonText: buttonText,
    title: title });

  Object.assign(req, {
    body: {
      type: 'list',
      content: content,
      ...req.body } });


  return await sendText(req, res);
}
async function sendContact(req, res) {
  const { phoneNumber } = req.body;
  let { fullName, organization } = req.body;
  fullName = fullName ? fullName : phoneNumber;
  organization = organization ? organization : fullName;
  const content = req.body.content ? req.body.content : {};
  Object.assign(content, {
    contacts: {
      displayName: fullName,
      contacts: [
      {
        displayName: fullName,
        vcard: `BEGIN:VCARD
VERSION:3.0
FN:${fullName}
ORG:${organization};
TEL;type=CELL;type=VOICE;waid=${phoneNumber}:${phoneNumber}\n
END:VCARD` }] } });




  Object.assign(req, {
    body: {
      type: 'contact',
      content: content,
      ...req.body } });


  return await sendText(req, res);
}
async function forward(req, res) {
  const { message } = req.body;
  const content = req.body.content ? req.body.content : {};
  Object.assign(content, {
    forward: message });

  Object.assign(req, {
    body: {
      type: 'forward',
      content: content,
      ...req.body } });


  return await sendText(req, res);
}
async function reaction(req, res) {
  const { message, emoticon } = req.body;
  const content = req.body.content ? req.body.content : {};
  Object.assign(content, {
    react: {
      text: emoticon,
      key: message.key ? message.key : message } });


  Object.assign(req, {
    body: {
      type: 'emoticon',
      content: content,
      ...req.body } });


  return await sendText(req, res);
}

async function loadMessages(req, res) {
  const { fromJid, limit, onlyFromMe = false, onlyNotFromMe = false } = req.body;
  try {
    let results = [];
    for (const jid of fromJid) {
      for (const message of await req.client.store.loadMessages(jid, limit)) {
        if (onlyFromMe && message && message.key.fromMe) {
          results.push(message);
        }
        if (onlyNotFromMe && message && !message.key.fromMe) {
          results.push(message);
        }
      }
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No messages can load ${onlyFromMe ? 'only from me, ' : ', '}${onlyNotFromMe ? 'only not from me' : ''}` });

    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error load messages, ${e.message}` });

  }
}
async function loadMessage(req, res) {
  const { fromJid, id } = req.body;
  try {
    let results = [];
    for (const jid of fromJid) {
      const message = await req.client.store.loadMessage(jid, id);
      if (message) {
        results.push(message);
      }
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No message can load with id ${id}` });

    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error load message, ${e.message}` });

  }
}
async function sendReadReceipt(req, res) {
  const { message } = req.body;
  try {
    let key = message.key ? message.key : message;
    await req.client.sendReadReceipt(key.remoteJid, key.participant, [key.id]);
    res.status(201).json({ success: `Message successfull receipt`, message: key });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error receipt message, ${e.message}` });

  }
}
//# sourceMappingURL=message.js.map