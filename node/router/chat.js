import { Router } from 'express';
import * as ChatController from '../controller/chat';
import verifyToken from '../midleware/authentication';
import verifyConnection from '../midleware/connection';

const router = new Router({ mergeParams: true });

router.post('/sendPresenceUpdate', verifyToken, verifyConnection, ChatController.sendPresenceUpdate);
router.post('/onWhatsApp', verifyToken, verifyConnection, ChatController.onWhatsApp);
router.post('/onWhatsApp', verifyToken, verifyConnection, ChatController.onWhatsApp);
router.post('/profilePictureUrl', verifyToken, verifyConnection, ChatController.profilePictureUrl);
router.post('/fetchStatus', verifyToken, verifyConnection, ChatController.fetchStatus);

exports.chat = router;
