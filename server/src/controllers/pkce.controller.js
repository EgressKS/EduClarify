import { asyncHandler } from '../middleware/asyncHandler.js';

// In-memory storage for PKCE data (use Redis in production)
const pkceStore = new Map();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      pkceStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Store PKCE data temporarily
 * POST /api/oauth/store-pkce
 */
export const storePKCE = asyncHandler(async (req, res) => {
  const { state, codeVerifier, timestamp } = req.body;

  if (!state || !codeVerifier) {
    return res.status(400).json({
      success: false,
      message: 'State and codeVerifier are required'
    });
  }

  pkceStore.set(state, {
    codeVerifier,
    timestamp: timestamp || Date.now()
  });

  res.status(200).json({
    success: true,
    message: 'PKCE data stored successfully'
  });
});

/**
 * Retrieve PKCE data
 * POST /api/oauth/retrieve-pkce
 */
export const retrievePKCE = asyncHandler(async (req, res) => {
  const { state } = req.body;

  if (!state) {
    return res.status(400).json({
      success: false,
      message: 'State is required'
    });
  }

  const data = pkceStore.get(state);
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'PKCE data not found or expired'
    });
  }

  // Remove after retrieval
  pkceStore.delete(state);

  res.status(200).json({
    success: true,
    data: {
      codeVerifier: data.codeVerifier
    }
  });
});
