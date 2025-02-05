import { Router } from 'express';
import { googleCallback, getGoogleConfig } from '../controllers/oauth.controller.js';

const router = Router();

// Google OAuth 2.0 with PKCE
router.get('/google/config', getGoogleConfig);
router.post('/google/callback', googleCallback);

export default router;
