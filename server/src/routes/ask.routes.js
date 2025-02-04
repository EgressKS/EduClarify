import { Router } from 'express';
import { askController } from '../controllers/ask.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, askController);

export default router;
