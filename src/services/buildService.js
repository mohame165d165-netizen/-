import { supabaseAdmin } from '../database/supabase.js';
import { storageService } from './storageService.js';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import fs from 'fs/promises';
import path from 'path';

const buildQueue = new Map();
const activeBuilds = new Map();

export const buildService = {
  async startBuild(projectId, userId) {
    const buildId = uuidv4();

    const { data, error } = await supabaseAdmin
      .from('build_logs')
      .insert({
        id: buildId,
        project_id: projectId,
        user_id: userId,
        status: 'queued',
        progress: 0,
      })
      .select()
      .single();

    if (error) throw error;

    buildQueue.set(buildId, { projectId, userId, data });
    this.processQueue();

    return data;
  },

  async processQueue() {
    if (activeBuilds.size >= 5) return;

    for (const [buildId, build] of buildQueue) {
      if (activeBuilds.has(buildId)) continue;

      activeBuilds.set(buildId, build);
      buildQueue.delete(buildId);
      this.executeBuild(buildId, build);
    }
  },

  async executeBuild(buildId, { projectId, userId }) {
    try {
      await this.updateStatus(buildId, 'building', 10);
      await this.updateStatus(buildId, 'building', 30);
      await this.updateStatus(buildId, 'building', 60);
      await this.updateStatus(buildId, 'building', 80);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.updateStatus(buildId, 'completed', 100);

    } catch (error) {
      await this.updateStatus(buildId, 'failed', 0, error.message);
    } finally {
      activeBuilds.delete(buildId);
      this.processQueue();
    }
  },

  async updateStatus(buildId, status, progress, error = null) {
    const updates = { status, progress, updated_at: new Date().toISOString() };
    if (error) updates.error_message = error;

    await supabaseAdmin
      .from('build_logs')
      .update(updates)
      .eq('id', buildId);
  },

  async listBuilds(projectId, userId) {
    const { data, error } = await supabaseAdmin
      .from('build_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getStatus(buildId, userId) {
    const { data, error } = await supabaseAdmin
      .from('build_logs')
      .select('*')
      .eq('id', buildId)
      .single();

    if (error) throw error;
    return data;
  },

  async getLogs(buildId, userId) {
    const { data, error } = await supabaseAdmin
      .from('build_logs')
      .select('logs')
      .eq('id', buildId)
      .single();

    if (error) throw error;
    return data.logs || [];
  },

  async cancelBuild(buildId, userId) {
    if (!activeBuilds.has(buildId)) {
      throw new Error('Build not found or already completed');
    }

    await this.updateStatus(buildId, 'cancelled', 0);
    activeBuilds.delete(buildId);

    return { success: true };
  },

  async getDownloadPath(fileName, userId) {
    const filePath = path.join(storageService.storagePath, 'builds', fileName);
    await fs.access(filePath);
    return filePath;
  },

  async getStats(userId) {
    const { data, error } = await supabaseAdmin
      .from('build_logs')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      completed: data.filter(b => b.status === 'completed').length,
      failed: data.filter(b => b.status === 'failed').length,
      pending: data.filter(b => ['queued', 'building'].includes(b.status)).length,
    };

    return stats;
  }
};

export default buildService;
