import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const profileRouter = express.Router();

profileRouter.get('/', authMiddleware, profileController.getProfile);
profileRouter.put('/', authMiddleware, profileController.updateProfile);

profileRouter.get('/curated', authMiddleware, profileController.getCuratedItems);
profileRouter.post('/curated', authMiddleware, profileController.addCuratedItem);
profileRouter.delete('/curated/:id', authMiddleware, profileController.deleteCuratedItem);

export default profileRouter;