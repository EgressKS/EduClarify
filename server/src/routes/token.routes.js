import { Router } from 'express';
import { createStreamingToken } from '../controllers/token.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createStreamingToken);

export default router;
