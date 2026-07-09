import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupRoutes } from './routes/index.js';
import { storageService } from './services/storageService.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.server.nodeEnv === 'development' ? '*' : ['https://your-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

await storageService.init();

setupRoutes(app);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Blossom Backend API',
    version: '1.0.0',
    description: 'Arabic AI App Builder Backend',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      files: '/api/projects/:projectId/files',
      ai: '/api/ai',
      builds: '/api/builds',
    },
    documentation: '/api/docs',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use(errorHandler);

const server = app.listen(config.server.port, config.server.host, () => {
  console.log(`Blossom Backend running on http://${config.server.host}:${config.server.port}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Health check: http://${config.server.host}:${config.server.port}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
