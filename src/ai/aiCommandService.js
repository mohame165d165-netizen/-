import { arabicCommandParser } from './arabicCommandParser.js';
import { codeGenerator } from './codeGenerator.js';
import { supabaseAdmin } from '../database/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const aiCommandService = {
  async executeCommand(projectId, userId, commandText) {
    const parsed = arabicCommandParser.parse(commandText);

    const commandId = uuidv4();
    await supabaseAdmin.from('ai_commands').insert({
      id: commandId,
      project_id: projectId,
      user_id: userId,
      command: commandText,
      parsed_command: parsed,
      status: 'processing',
    });

    try {
      let result;
      switch (parsed.type) {
        case 'create_screen':
          result = await codeGenerator.createScreen(projectId, parsed.params[0]);
          break;
        case 'add_button':
          result = await codeGenerator.addButton(projectId, {
            name: parsed.params[0],
            text: parsed.params[1],
            screen: parsed.params[2],
          });
          break;
        case 'add_text':
          result = await codeGenerator.addText(projectId, {
            name: parsed.params[0],
            content: parsed.params[1],
            screen: parsed.params[2],
          });
          break;
        case 'add_image':
          result = await codeGenerator.addImage(projectId, {
            id: parsed.params[0],
            screen: parsed.params[1],
          });
          break;
        case 'change_color':
          result = await codeGenerator.changeColor(projectId, {
            element: parsed.params[0],
            color: parsed.params[1],
          });
          break;
        case 'set_theme':
          result = await codeGenerator.setTheme(projectId, parsed.params[0]);
          break;
        case 'set_app_name':
          result = await codeGenerator.setAppName(projectId, parsed.params[0]);
          break;
        case 'add_navigation':
          result = await codeGenerator.addNavigation(projectId, {
            from: parsed.params[0],
            to: parsed.params[1],
          });
          break;
        case 'on_click_navigate':
          result = await codeGenerator.onClickNavigate(projectId, {
            element: parsed.params[0],
            targetScreen: parsed.params[1],
          });
          break;
        case 'build_app':
          result = { message: 'Build initiated', type: 'build' };
          break;
        default:
          result = { message: 'Command not recognized', type: 'unknown' };
      }

      await supabaseAdmin.from('ai_commands')
        .update({ status: 'completed', result, updated_at: new Date().toISOString() })
        .eq('id', commandId);

      await supabaseAdmin.from('ai_results').insert({
        id: uuidv4(),
        command_id: commandId,
        project_id: projectId,
        result,
        success: true,
      });

      return { success: true, result, parsed };

    } catch (error) {
      await supabaseAdmin.from('ai_commands')
        .update({ status: 'failed', error: error.message, updated_at: new Date().toISOString() })
        .eq('id', commandId);

      throw error;
    }
  },

  async parseCommand(commandText) {
    return arabicCommandParser.parse(commandText);
  },

  async getHistory(projectId, userId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('ai_commands')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  getSupportedCommands() {
    return arabicCommandParser.getSupportedCommands();
  }
};

export default aiCommandService;
