import { v4 as uuidv4 } from 'uuid';

export const utils = {
  generateId: () => uuidv4(),

  formatError: (error) => ({
    message: error.message || 'Unknown error',
    code: error.code || 'INTERNAL_ERROR',
    details: error.details || null,
  }),

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6;
  },

  sanitizeFilename: (filename) => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  },

  parseBoolean: (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  },

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  retry: async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await utils.sleep(delay * Math.pow(2, i));
        }
      }
    }
    throw lastError;
  },

  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),

  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
};

export default utils;
