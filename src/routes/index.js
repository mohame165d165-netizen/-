import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import fileRoutes from './fileRoutes.js';
import aiRoutes from './aiRoutes.js';
import buildRoutes from './buildRoutes.js';

export const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/builds', buildRoutes);
};

export default setupRoutes;
