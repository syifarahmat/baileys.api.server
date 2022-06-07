import { Router } from 'express';
import * as SessionController from '../controller/session';
import verifyToken from '../midleware/authentication';

const router = new Router({ mergeParams: true });

router.get('/encrypt/:secret', SessionController.encrypt);
router.get('/create', verifyToken, SessionController.create);
router.get('/restart', verifyToken, SessionController.restart);
router.get('/state', verifyToken, SessionController.state);
router.get('/close', verifyToken, SessionController.close);
router.get('/logOut', verifyToken, SessionController.logOut);
router.get('/info', verifyToken, SessionController.info);

exports.session = router;
