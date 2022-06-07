import { Router } from 'express';
import * as IndexController from '../controller';
import * as SessionController from '../controller/session';
import { session } from './session';
import { message } from './message';
import { chat } from './chat';

const router = new Router({ mergeParams: true });

router.get('/api/ping', IndexController.ping);
router.route('/api/session/startup/:secret').get(SessionController.startAll).post(SessionController.startAll);
router.route('/api/session/restart/:secret').get(SessionController.restartAll).post(SessionController.restartAll);
router.use('/api/:session/session', session);
router.use('/api/:session/message', message);
router.use('/api/:session/chat', chat);

export default router;
