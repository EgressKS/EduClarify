import axios from 'axios';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { UserService } from '../services/user.service.js';
import { generateToken } from '../middleware/auth.js';
import { ENV } from '../config/env.js';

// Google OAuth 2.0 with PKCE configuration
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

/**
 * Exchange authorization code for tokens using PKCE
 * POST /api/oauth/google/callback
 */
export const googleCallback = asyncHandler(async (req, res) => {
  const { code, codeVerifier, redirectUri } = req.body;

  console.log('=== Google OAuth Callback ===');
  console.log('Code:', code ? code.substring(0, 20) + '...' : 'missing');
  console.log('Code Verifier:', codeVerifier ? codeVerifier.substring(0, 20) + '...' : 'missing');
  console.log('Redirect URI:', redirectUri);
  console.log('ENV Redirect URI:', ENV.googleRedirectUri);

  if (!code || !codeVerifier) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code and code verifier are required'
    });
  }

  try {
    const finalRedirectUri = redirectUri || ENV.googleRedirectUri;
    console.log('Using redirect URI:', finalRedirectUri);

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(GOOGLE_TOKEN_ENDPOINT, {
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      code: code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: finalRedirectUri,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      transformRequest: [(data) => {
        return Object.entries(data)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
      }],
    });

    const { access_token, id_token } = tokenResponse.data;

    console.log('Token exchange successful');
    console.log('Access token:', access_token ? 'received' : 'missing');

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to obtain access token from Google'
      });
    }

    // Get user info from Google
    console.log('Fetching user info from Google...');
    const userInfoResponse = await axios.get(GOOGLE_USERINFO_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const googleUser = userInfoResponse.data;

    if (!googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get user email from Google'
      });
    }

    // Find or create user in database
    const user = await UserService.findOrCreateGoogleUser({
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split('@')[0],
      avatarUrl: googleUser.picture,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: UserService.formatUserResponse(user),
        token,
      },
    });
  } catch (error) {
    console.error('=== Google OAuth Error ===');
    console.error('Error:', error.message);
    console.error('Response data:', JSON.stringify(error.response?.data));
    console.error('Response status:', error.response?.status);
    console.error('Stack:', error.stack);
    
    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(400).json({
        success: false,
        message: 'Authorization code has expired or already been used. Please try logging in again.',
        details: error.response?.data
      });
    }

    // Return detailed error for debugging
    return res.status(500).json({
      success: false,
      message: error.response?.data?.error_description || error.message || 'Google authentication failed',
      errorType: error.response?.data?.error || 'unknown',
      details: error.response?.data || { message: error.message, stack: error.stack?.split('\n')[0] }
    });
  }
});

/**
 * Get Google OAuth configuration for client
 * GET /api/oauth/google/config
 */
export const getGoogleConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      clientId: ENV.googleClientId,
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      scope: 'openid email profile',
      redirectUri: ENV.googleRedirectUri, // Send to client for debugging
    },
  });
});

/**
 * Debug endpoint to check server configuration
 * GET /api/oauth/debug
 */
export const debugConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      hasClientId: !!ENV.googleClientId,
      hasClientSecret: !!ENV.googleClientSecret,
      redirectUri: ENV.googleRedirectUri,
      nodeEnv: ENV.nodeEnv,
    },
  });
});
