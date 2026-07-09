import { supabaseAdmin } from '../database/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const fileService = {
  async list(projectId, userId) {
    const { data, error } = await supabaseAdmin
      .from('project_files')
      .select('id, path, language, file_type, created_at, updated_at')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  },

  async getTree(projectId, userId) {
    const files = await this.list(projectId, userId);
    const tree = {};

    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { type: 'file', id: file.id, language: file.language };
        } else {
          current[part] = current[part] || { type: 'folder', children: {} };
          current = current[part].children;
        }
      });
    });

    return tree;
  },

  async getAllWithContent(projectId, userId) {
    const { data, error } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  },

  async create(projectId, userId, { path, content, language, fileType }) {
    const { data, error } = await supabaseAdmin
      .from('project_files')
      .insert({
        id: uuidv4(),
        project_id: projectId,
        path,
        content,
        language: language || this.detectLanguage(path),
        file_type: fileType || 'file',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getContent(fileId, userId) {
    const { data, error } = await supabaseAdmin
      .from('project_files')
      .select('content')
      .eq('id', fileId)
      .single();

    if (error) throw error;
    return data.content;
  },

  async update(fileId, userId, { content, path }) {
    const updates = { updated_at: new Date().toISOString() };
    if (content !== undefined) updates.content = content;
    if (path !== undefined) updates.path = path;

    const { data, error } = await supabaseAdmin
      .from('project_files')
      .update(updates)
      .eq('id', fileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(fileId, userId) {
    const { error } = await supabaseAdmin
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  },

  async batchUpsert(projectId, userId, files) {
    const records = files.map(file => ({
      id: uuidv4(),
      project_id: projectId,
      path: file.path,
      content: file.content,
      language: file.language || this.detectLanguage(file.path),
      file_type: 'file',
    }));

    const { data, error } = await supabaseAdmin
      .from('project_files')
      .upsert(records, { onConflict: 'project_id,path' })
      .select();

    if (error) throw error;
    return data;
  },

  detectLanguage(path) {
    const ext = path.split('.').pop().toLowerCase();
    const languageMap = {
      java: 'java',
      xml: 'xml',
      kt: 'kotlin',
      json: 'json',
      gradle: 'gradle',
      pro: 'proguard',
      properties: 'properties',
    };
    return languageMap[ext] || 'text';
  }
};

export default fileService;
