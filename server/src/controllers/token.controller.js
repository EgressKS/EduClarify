import { ENV } from '../config/env.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createStreamingToken = asyncHandler(async (_req, res) => {
  if (!ENV.heygenApiKey) {
    return res.status(500).json({ error: 'HEYGEN_API_KEY is missing' });
  }

  const response = await fetch(`${ENV.heygenBaseUrl}/v1/streaming.create_token`, {
    method: 'POST',
    headers: {
      'x-api-key': ENV.heygenApiKey,
    },
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to retrieve access token' });
  }

  const data = await response.json();
  const token = data?.data?.token;

  if (!token) {
    return res.status(502).json({ error: 'Token missing in HeyGen response' });
  }

  res.status(200).json({ token });
});

