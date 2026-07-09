import { supabaseAdmin } from '../database/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const xmlTemplates = {
  screen: (name, content = '') => `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${name}"
        android:textSize="24sp"
        android:textStyle="bold" />

${content}
</LinearLayout>`,

  button: (id, text) => `    <Button
        android:id="@+id/${id}"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${text}" />`,

  text: (id, content) => `    <TextView
        android:id="@+id/${id}"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${content}"
        android:textSize="16sp" />`,

  image: (id) => `    <ImageView
        android:id="@+id/${id}"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@drawable/ic_launcher" />`,
};

const javaTemplates = {
  activity: (packageName, activityName, layoutName) => `package ${packageName};

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class ${activityName}Activity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.${layoutName});
    }
}`,
};

const themeColors = {
  light: { primary: '#6200EE', background: '#FFFFFF', text: '#000000' },
  dark: { primary: '#BB86FC', background: '#121212', text: '#FFFFFF' },
  blue: { primary: '#2196F3', background: '#E3F2FD', text: '#0D47A1' },
  green: { primary: '#4CAF50', background: '#E8F5E9', text: '#1B5E20' },
};

export const codeGenerator = {
  async createScreen(projectId, screenName) {
    const layoutName = `activity_${screenName.toLowerCase().replace(/\s+/g, '_')}`;
    const xmlContent = xmlTemplates.screen(screenName);

    const { data: file, error } = await supabaseAdmin
      .from('project_files')
      .insert({
        id: uuidv4(),
        project_id: projectId,
        path: `res/layout/${layoutName}.xml`,
        content: xmlContent,
        language: 'xml',
        file_type: 'file',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      message: `Screen "${screenName}" created`,
      file: file,
      layoutName,
    };
  },

  async addButton(projectId, { name, text, screen }) {
    const layoutName = `activity_${screen.toLowerCase().replace(/\s+/g, '_')}`;
    const { data: existingFile, error: fetchError } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', `res/layout/${layoutName}.xml`)
      .single();

    if (fetchError) throw new Error('Screen not found');

    const buttonXml = xmlTemplates.button(name, text);
    const updatedContent = existingFile.content.replace(
      '</LinearLayout>',
      `${buttonXml}\n</LinearLayout>`
    );

    const { data, error } = await supabaseAdmin
      .from('project_files')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', existingFile.id)
      .select()
      .single();

    if (error) throw error;

    return { message: `Button "${name}" added to screen "${screen}"`, file: data };
  },

  async addText(projectId, { name, content, screen }) {
    const layoutName = `activity_${screen.toLowerCase().replace(/\s+/g, '_')}`;
    const { data: existingFile, error: fetchError } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', `res/layout/${layoutName}.xml`)
      .single();

    if (fetchError) throw new Error('Screen not found');

    const textXml = xmlTemplates.text(name, content);
    const updatedContent = existingFile.content.replace(
      '</LinearLayout>',
      `${textXml}\n</LinearLayout>`
    );

    const { data, error } = await supabaseAdmin
      .from('project_files')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', existingFile.id)
      .select()
      .single();

    if (error) throw error;

    return { message: `Text "${name}" added to screen "${screen}"`, file: data };
  },

  async addImage(projectId, { id, screen }) {
    const layoutName = `activity_${screen.toLowerCase().replace(/\s+/g, '_')}`;
    const { data: existingFile, error: fetchError } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', `res/layout/${layoutName}.xml`)
      .single();

    if (fetchError) throw new Error('Screen not found');

    const imageXml = xmlTemplates.image(id);
    const updatedContent = existingFile.content.replace(
      '</LinearLayout>',
      `${imageXml}\n</LinearLayout>`
    );

    const { data, error } = await supabaseAdmin
      .from('project_files')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', existingFile.id)
      .select()
      .single();

    if (error) throw error;

    return { message: `Image "${id}" added to screen "${screen}"`, file: data };
  },

  async changeColor(projectId, { element, color }) {
    const { data: files, error: fetchError } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('language', 'xml');

    if (fetchError) throw fetchError;

    let updated = false;
    for (const file of files) {
      if (file.content.includes(`@+id/${element}`)) {
        const updatedContent = file.content.replace(
          new RegExp(`(<[^>]*android:id="\\+id/${element}"[^>]*)>`),
          `$1 android:background="${color}">`
        );

        await supabaseAdmin
          .from('project_files')
          .update({ content: updatedContent, updated_at: new Date().toISOString() })
          .eq('id', file.id);

        updated = true;
        break;
      }
    }

    if (!updated) {
      throw new Error(`Element "${element}" not found`);
    }

    return { message: `Color of "${element}" changed to "${color}"` };
  },

  async setTheme(projectId, themeName) {
    const theme = themeColors[themeName.toLowerCase()];
    if (!theme) {
      throw new Error(`Unknown theme: ${themeName}`);
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('config')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    const updatedConfig = {
      ...project.config,
      theme: themeName,
      colors: theme,
    };

    await supabaseAdmin
      .from('projects')
      .update({ config: updatedConfig, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    return { message: `Theme set to "${themeName}"`, theme };
  },

  async setAppName(projectId, name) {
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    await supabaseAdmin
      .from('projects')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${name}</string>
</resources>`;

    const { error: fileError } = await supabaseAdmin
      .from('project_files')
      .upsert({
        id: uuidv4(),
        project_id: projectId,
        path: 'res/values/strings.xml',
        content: stringsXml,
        language: 'xml',
        file_type: 'file',
      }, { onConflict: 'project_id,path' });

    if (fileError) throw fileError;

    return { message: `App name set to "${name}"` };
  },

  async addNavigation(projectId, { from, to }) {
    const fromLayout = `activity_${from.toLowerCase().replace(/\s+/g, '_')}`;
    const { data: existingFile, error: fetchError } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', `res/layout/${fromLayout}.xml`)
      .single();

    if (fetchError) throw new Error('Source screen not found');

    const buttonXml = xmlTemplates.button(`btn_nav_to_${to.toLowerCase().replace(/\s+/g, '_')}`, `Go to ${to}`);
    const updatedContent = existingFile.content.replace(
      '</LinearLayout>',
      `${buttonXml}\n</LinearLayout>`
    );

    await supabaseAdmin
      .from('project_files')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', existingFile.id);

    return { message: `Navigation added from "${from}" to "${to}"` };
  },

  async onClickNavigate(projectId, { element, targetScreen }) {
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('package_name')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    const activityName = element.replace(/_/g, '_').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const targetActivityName = targetScreen.replace(/\s+/g, '');
    const javaContent = `// TODO: Add this to your Activity class
findViewById(R.id.${element}).setOnClickListener(v -> {
    Intent intent = new Intent(${activityName}Activity.this, ${targetActivityName}Activity.class);
    startActivity(intent);
});`;

    return {
      message: `On click handler created for "${element}" to navigate to "${targetScreen}"`,
      code: javaContent,
    };
  }
};

export default codeGenerator;
