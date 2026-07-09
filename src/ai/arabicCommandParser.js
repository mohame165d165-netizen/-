import { supabaseAdmin } from '../database/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const commands = {
  CREATE_SCREEN: {
    pattern: /أنشئ?\s*شاش[ةه]?\s*باس[مـ]?\s*["'](.+?)["']/i,
    type: 'create_screen',
  },
  ADD_BUTTON: {
    pattern: /أضف?\s*زر[اً]?\s*باس[مـ]?\s*["'](.+?)["']\s*يقول?\s*["'](.+?)["']\s*في?\s*شاش[ةه]?\s*["'](.+?)["']/i,
    type: 'add_button',
  },
  ADD_TEXT: {
    pattern: /أضف?\s*نص[اً]?\s*باس[مـ]?\s*["'](.+?)["']\s*محتواه?\s*["'](.+?)["']\s*في?\s*شاش[ةه]?\s*["'](.+?)["']/i,
    type: 'add_text',
  },
  ADD_IMAGE: {
    pattern: /أضف?\s*صور[ةه]?\s*بمعرف?\s*["'](.+?)["']\s*في?\s*شاش[ةه]?\s*["'](.+?)["']/i,
    type: 'add_image',
  },
  CHANGE_COLOR: {
    pattern: /غي[رّ]?\s*لون?\s*["'](.+?)["']\s*إلى?\s*(.+)/i,
    type: 'change_color',
  },
  SET_THEME: {
    pattern: /غي[رّ]?\s*الثيم?\s*إلى?\s*(.+)/i,
    type: 'set_theme',
  },
  SET_APP_NAME: {
    pattern: /سم[يّ]?\s*التطبيق?\s*إلى?\s*["'](.+?)["']/i,
    type: 'set_app_name',
  },
  ADD_NAVIGATION: {
    pattern: /أضف?\s*تنقل?\s*بين?\s*شاش[تيـ]?\s*["'](.+?)["']\s*و?\s*["'](.+?)["']/i,
    type: 'add_navigation',
  },
  ON_CLICK_NAVIGATE: {
    pattern: /عند?\s*الضغط?\s*على?\s*["'](.+?)["']\s*انتقل?\s*إلى?\s*شاش[ةه]?\s*["'](.+?)["']/i,
    type: 'on_click_navigate',
  },
  BUILD_APP: {
    pattern: /ابن[ي]?\s*التطبيق/i,
    type: 'build_app',
  },
};

export const arabicCommandParser = {
  parse(command) {
    for (const [key, config] of Object.entries(commands)) {
      const match = command.match(config.pattern);
      if (match) {
        return {
          type: config.type,
          command: key,
          params: match.slice(1),
          raw: command,
        };
      }
    }

    return {
      type: 'unknown',
      command: null,
      params: [],
      raw: command,
    };
  },

  getSupportedCommands() {
    const descriptions = {
      CREATE_SCREEN: 'أنشئ شاشة باسم "الرئيسية" - Creates a new screen',
      ADD_BUTTON: 'أضف زر باسم "btn_send" يقول "إرسال" في شاشة "الرئيسية" - Adds a button to screen',
      ADD_TEXT: 'أضف نص باسم "txt_title" محتواه "مرحبا" في شاشة "الرئيسية" - Adds text to screen',
      ADD_IMAGE: 'أضف صورة بمعرف "img_logo" في شاشة "الرئيسية" - Adds image to screen',
      CHANGE_COLOR: 'غيّر لون "btn_send" إلى #FF0000 - Changes element color',
      SET_THEME: 'غيّر الثيم إلى dark - Sets app theme',
      SET_APP_NAME: 'سمّي التطبيق إلى "تطبيقي" - Sets app name',
      ADD_NAVIGATION: 'أضف تنقل بين شاشتي "الرئيسية" و "الإعدادات" - Adds navigation',
      ON_CLICK_NAVIGATE: 'عند الضغط على "btn_next" انتقل إلى شاشة "الإعدادات" - On click navigation',
      BUILD_APP: 'ابني التطبيق - Starts APK build',
    };

    return Object.entries(descriptions).map(([key, desc]) => ({
      command: key,
      description: desc,
    }));
  },

  getCommandType() {
    return commands;
  }
};

export default arabicCommandParser;
