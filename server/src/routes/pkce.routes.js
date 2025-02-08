import express from 'express';
import { storePKCE, retrievePKCE } from '../controllers/pkce.controller.js';

const router = express.Router();

router.post('/store-pkce', storePKCE);
router.post('/retrieve-pkce', retrievePKCE);

export default router;
