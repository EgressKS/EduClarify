import { Router } from 'express';

import askRoutes from './ask.routes.js';
import commonsSearchRoutes from './commonsSearch.routes.js';
import tokenRoutes from './token.routes.js';
import authRoutes from './auth.routes.js';
import oauthRoutes from './oauth.routes.js';
import pkceRoutes from './pkce.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/ask', askRoutes);
router.use('/commons-search', commonsSearchRoutes);
router.use('/get-access-token', tokenRoutes);

// Add PKCE routes under /oauth
router.use('/oauth', pkceRoutes);

export default router;
