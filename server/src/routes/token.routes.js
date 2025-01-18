import { Router } from 'express';
import { createStreamingToken } from '../controllers/token.controller.js';

const router = Router();

router.post('/', createStreamingToken);

export default router;

