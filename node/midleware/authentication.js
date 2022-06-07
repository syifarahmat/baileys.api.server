import bcrypt from 'bcrypt';
import { clientsArray } from '../util/variable';

function formatSession(session) {
  return session.split(':')[0];
}
const verifyToken = (req, res, next) => {
  const secureToken = req.config.secretKey;
  const { session } = req.params;
  const { authorization: token } = req.headers;
  if (!session) {
    return res.status(401).send({ error: 'Session not informed' });
  }
  try {
    let tokenDecrypt = '';
    let sessionDecrypt = '';
    try {
      sessionDecrypt = session.split(':')[0];
      tokenDecrypt = session.split(':')[1].replace(/_/g, '/').replace(/-/g, '+');
    } catch (error) {
      try {
        if (token && token !== '' && token.split(' ').length > 0) {
          const value = token.split(' ')[1];
          if (value) tokenDecrypt = value.replace(/_/g, '/').replace(/-/g, '+');
          else return res.status(401).json({ error: 'Token is not present. Check your header and try again' });
        } else {
          return res.status(401).json({ error: 'Token is not present. Check your header and try again' });
        }
      } catch (e) {
        req.logger.error(e);
        return res.status(401).json({ error: 'Check that a Session and Token are correct', detail: error });
      }
    }
    bcrypt.compare(sessionDecrypt + secureToken, tokenDecrypt, function (err, result) {
      if (result) {
        req.session = formatSession(req.params.session);
        req.token = tokenDecrypt;
        req.client = clientsArray[req.session];
        next();
      } else {
        return res.status(401).json({ error: 'Check that the Session and Token are correct' });
      }
    });
  } catch (e) {
    req.logger.error(e);
    return res.status(401).json({
      error: 'Check that the Session and Token are correct.',
      detail: e,
    });
  }
};

export default verifyToken;
