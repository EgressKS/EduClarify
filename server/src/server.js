import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

export async function startServer() {
  await connectDB();

  const server = app.listen(ENV.port, () => {
    console.log(`Server running at http://localhost:${ENV.port}`);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down server...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

