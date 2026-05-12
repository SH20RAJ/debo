'use client';

import * as React from 'react';

import { normalizeStaticValue } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { MarkdownPlugin } from '@platejs/markdown';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';

export function PlateEditor({
  initialValue,
  onChange,
  placeholder = "Type your amazing content here...",
  variant = "default"
}: {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: "default" | "demo" | "fullWidth";
}) {
  // Memoize the normalized initial value to prevent unnecessary re-initialization
  const normalizedValue = React.useMemo(() => {
    if (!initialValue) return undefined;
    
    try {
      // Try to parse as JSON first
      if (initialValue.trim().startsWith('{') || initialValue.trim().startsWith('[')) {
        return JSON.parse(initialValue);
      }
    } catch (e) {
      // Fallback to markdown if JSON parsing fails
    }
    
    return undefined; // usePlateEditor handles undefined/initial logic
  }, [initialValue]);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: normalizedValue || (initialValue ? undefined : defaultValue),
  });

  // Handle Markdown deserialization for initialValue if it's not JSON
  React.useEffect(() => {
    if (initialValue && !normalizedValue && editor) {
      const isMarkdown = !initialValue.trim().startsWith('{') && !initialValue.trim().startsWith('[');
      if (isMarkdown) {
        editor.tf.setValue(editor.api.markdown.deserialize(initialValue));
      }
    }
  }, [initialValue, normalizedValue, editor]);

  return (
    <Plate 
      editor={editor}
      onChange={({ value }) => {
        if (onChange) {
          // Serialize to Markdown for consistent storage in the 'content' field
          const markdown = editor.api.markdown.serialize();
          onChange(markdown);
        }
      }}
    >
      <EditorContainer>
        <Editor variant={variant} placeholder={placeholder} />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

const defaultValue = normalizeStaticValue([
  {
    children: [{ text: '' }],
    type: 'p',
  },
]);
