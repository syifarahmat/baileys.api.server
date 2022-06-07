export async function sendPresenceUpdate(req, res) {
  const { toJid, presence } = req.body;
  try {
    let results = [];
    for (const jid of toJid) {
      const result = await req.client.sendPresenceUpdate(presence, jid);
      results.push(result ? result : jid);
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No presence can send`,
      });
    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error send presence, ${e.message}`,
    });
  }
}
export async function onWhatsApp(req, res) {
  const { fromJid } = req.body;
  try {
    let results = [];
    for (const jid of fromJid) {
      const result = await req.client.onWhatsApp(jid);
      results.push(result ? result : {});
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No jid on whatsapp`,
      });
    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error on whatsapp, ${e.message}`,
    });
  }
}
export async function profilePictureUrl(req, res) {
  const { fromJid, hd = false } = req.body;
  try {
    let results = [];
    for (const jid of fromJid) {
      const result = await req.client.profilePictureUrl(jid, hd ? 'image' : undefined);
      results.push(result ? result : {});
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No profile picture on whatsapp`,
      });
    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error profile picture, ${e.message}`,
    });
  }
}
export async function fetchStatus(req, res) {
  const { fromJid } = req.body;
  try {
    let results = [];
    for (const jid of fromJid) {
      const result = await req.client.fetchStatus(jid);
      results.push(result ? result : {});
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No status on whatsapp`,
      });
    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error status, ${e.message}`,
    });
  }
}
export async function presenceSubscribe(req, res) {
  const { fromJid } = req.body;
  try {
    let results = [];
    for (const jid of fromJid) {
      const result = await req.client.presenceSubscribe(jid);
      results.push(result ? result : {});
    }
    if (results.length === 0) {
      return res.status(400).json({
        error: `No presence subscribe`,
      });
    }
    res.status(201).json({ response: results });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      error: `Error presence subscribe, ${e.message}`,
    });
  }
}
