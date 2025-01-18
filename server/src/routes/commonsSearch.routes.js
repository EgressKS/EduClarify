import { Router } from 'express';
import { commonsSearchController } from '../controllers/commonsSearch.controller.js';

const router = Router();

router.get('/', commonsSearchController);

export default router;

