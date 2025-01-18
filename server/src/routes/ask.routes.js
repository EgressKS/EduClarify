import { Router } from 'express';
import { askController } from '../controllers/ask.controller.js';

const router = Router();

router.post('/', askController);

export default router;

