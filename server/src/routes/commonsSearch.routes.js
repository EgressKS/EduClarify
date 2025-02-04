import { Router } from 'express';
import { commonsSearchController } from '../controllers/commonsSearch.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, commonsSearchController);

export default router;
