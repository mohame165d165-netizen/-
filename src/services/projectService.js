import { supabaseAdmin } from '../database/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const projectService = {
  async create(userId, { name, description, packageName, config }) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        id: uuidv4(),
        user_id: userId,
        name,
        description,
        package_name: packageName || `com.blossom.app_${Date.now()}`,
        config: config || {},
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list(userId, { status, limit = 50, offset = 0 }) {
    let query = supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async get(projectId, userId) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(projectId, userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(projectId, userId) {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};

export default projectService;
