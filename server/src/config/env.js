import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  heygenApiKey: process.env.HEYGEN_API_KEY,
  heygenBaseUrl: process.env.NEXT_PUBLIC_BASE_API_URL || 'https://api.heygen.com',
};

