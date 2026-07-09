import { supabaseAdmin } from '../database/supabase.js';

export const authService = {
  async register(email, password, displayName) {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) throw error;

    if (data.user) {
      await supabaseAdmin.from('app_users').insert({
        id: data.user.id,
        email: data.user.email,
        display_name: displayName,
      });
    }

    return data;
  },

  async login(email, password) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async logout(token) {
    const { error } = await supabaseAdmin.auth.admin.signOut(token);
    if (error) throw error;
  },

  async getCurrentUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId, displayName) {
    const { data, error } = await supabaseAdmin
      .from('app_users')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default authService;
