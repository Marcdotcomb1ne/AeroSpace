import express from 'express';
import * as communityController from '../controllers/community.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const communityRouter = express.Router();

communityRouter.get('/', authMiddleware, communityController.getMessages);
communityRouter.post('/', authMiddleware, communityController.sendMessage);
communityRouter.delete('/:id', authMiddleware, communityController.deleteMessage);

export default communityRouter;