import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/index.js';

export const storageService = {
  storagePath: null,
  initialized: false,

  async init() {
    if (this.initialized) return;

    this.storagePath = config.storage.path;
    await this.ensureDirectory(this.storagePath);
    await this.ensureDirectory(path.join(this.storagePath, 'builds'));
    await this.ensureDirectory(path.join(this.storagePath, 'temp'));
    await this.ensureDirectory(path.join(this.storagePath, 'exports'));

    this.initialized = true;
    console.log(`Storage initialized at: ${this.storagePath}`);
  },

  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  },

  async writeFile(relativePath, content) {
    if (!this.initialized) await this.init();

    const fullPath = path.join(this.storagePath, relativePath);
    await this.ensureDirectory(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
    return fullPath;
  },

  async readFile(relativePath) {
    if (!this.initialized) await this.init();

    const fullPath = path.join(this.storagePath, relativePath);
    return await fs.readFile(fullPath, 'utf-8');
  },

  async deleteFile(relativePath) {
    if (!this.initialized) await this.init();

    const fullPath = path.join(this.storagePath, relativePath);
    await fs.unlink(fullPath);
  },

  async listFiles(relativePath = '') {
    if (!this.initialized) await this.init();

    const fullPath = path.join(this.storagePath, relativePath);
    const files = await fs.readdir(fullPath, { withFileTypes: true });

    return files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      path: path.join(relativePath, file.name),
    }));
  },

  async getStorageSize() {
    if (!this.initialized) await this.init();

    const getTotalSize = async (dirPath) => {
      let size = 0;
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          size += await getTotalSize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          size += stats.size;
        }
      }

      return size;
    };

    return await getTotalSize(this.storagePath);
  },

  async cleanOldFiles(maxAge = 7 * 24 * 60 * 60 * 1000) {
    if (!this.initialized) await this.init();

    const tempPath = path.join(this.storagePath, 'temp');
    const files = await fs.readdir(tempPath, { withFileTypes: true });
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(tempPath, file.name);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
      }
    }
  }
};

export default storageService;
