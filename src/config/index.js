import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    host: process.env.HOST || '0.0.0.0',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'blossom-secret-key',
  },
  storage: {
    path: process.env.STORAGE_PATH || './storage',
    maxSize: parseInt(process.env.MAX_STORAGE_SIZE, 10) || 10737418240,
  },
  build: {
    timeout: parseInt(process.env.BUILD_TIMEOUT, 10) || 300000,
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_BUILDS, 10) || 5,
  },
};

export default config;
