import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB, closeDB } from './config/db.js';

export async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.warn('Database connection failed, but server will continue:', error.message);
    console.warn('Some features requiring database may not work.');
  }

  const server = app.listen(ENV.port, () => {
    console.log(`Server running at http://localhost:${ENV.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down server...`);
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
