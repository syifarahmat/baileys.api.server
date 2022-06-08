import { Router } from 'express';
import * as MessageController from '../controller/message';
import multer from 'multer';
import verifyToken from '../midleware/authentication';
import verifyConnection from '../midleware/connection';

const upload = multer({
  storage: multer.memoryStorage(),
  inMemory: true,
}).single('file');
const router = new Router({ mergeParams: true });

router.post('/sendText', verifyToken, verifyConnection, MessageController.sendText);
router.post('/sendImage', upload, verifyToken, verifyConnection, MessageController.sendImage);
router.post('/sendVideo', upload, verifyToken, verifyConnection, MessageController.sendVideo);
router.post('/sendAudio', upload, verifyToken, verifyConnection, MessageController.sendAudio);
router.post('/sendDocument', upload, verifyToken, verifyConnection, MessageController.sendDocument);
router.post('/sendSticker', upload, verifyToken, verifyConnection, MessageController.sendSticker);
router.post('/sendButton', verifyToken, verifyConnection, MessageController.sendButton);
router.post('/sendMediaButton', upload, verifyToken, verifyConnection, MessageController.sendMediaButton);
router.post('/sendList', verifyToken, verifyConnection, MessageController.sendList);
router.post('/sendContact', verifyToken, verifyConnection, MessageController.sendContact);
router.post('/forward', verifyToken, verifyConnection, MessageController.forward);
router.post('/reaction', verifyToken, verifyConnection, MessageController.reaction);
router.post('/loadMessages', verifyToken, verifyConnection, MessageController.loadMessages);
router.post('/loadMessage', verifyToken, verifyConnection, MessageController.loadMessage);
router.post('/sendReadReceipt', verifyToken, verifyConnection, MessageController.sendReadReceipt);

exports.message = router;
