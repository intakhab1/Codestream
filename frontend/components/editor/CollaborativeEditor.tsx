"use client";

import { useRef, useEffect, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { LANGUAGES, Language } from "@/types";
import { useAppSelector } from "@/hooks/useRedux";

interface CollaborativeEditorProps {
  code: string;
  language: Language;
  onCodeChange: (code: string) => void;
  onCursorChange: (cursor: { line: number; column: number }) => void;
  onLanguageChange: (lang: Language) => void;
  readOnly?: boolean;
  onRun: () => void;
  isRunning: boolean;

}

export function CollaborativeEditor({
  code, language, onCodeChange, onCursorChange, onLanguageChange, onRun, isRunning, readOnly = false,
}: CollaborativeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const isRemoteChange = useRef(false);
  const decorationsRef = useRef<string[]>([]);
  const participants = useAppSelector((s) => s.participants.participants);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => onRun()
    );
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange({ line: e.position.lineNumber, column: e.position.column });
    });

    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      glyphMargin: false,
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 8,
      folding: true,
      wordWrap: "on",
      tabSize: 2,
      automaticLayout: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
    });
  };

  // Sync remote code changes without losing cursor position
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const currentValue = model.getValue();

    if (currentValue !== code) {
      isRemoteChange.current = true;

      const pos = editor.getPosition();

      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: code }],
        () => null
      );

      if (pos) editor.setPosition(pos);

      isRemoteChange.current = false;
    }
  }, [code]);

// Replace the decorations useEffect:
// Remove old decorations and color useEffects, replace with this ONE useEffect:
useEffect(() => {
  if (!editorRef.current || !monacoRef.current) return;

  // Remove old widgets
  const editor = editorRef.current;
  const existingWidgets = (editor as any)._cursorWidgets || [];
  existingWidgets.forEach((w: any) => editor.removeContentWidget(w));

  // Create new widgets for each participant
  const widgets = participants
    .filter((p) => p.cursor)
    .map((p) => {
      const safeId = p.socketId.replace(/[^a-zA-Z0-9]/g, '');
      const widget = {
        getId: () => `cursor-widget-${safeId}`,
        getDomNode: () => {
          const node = document.createElement('div');
          node.style.cssText = `
            display: inline-block;
            pointer-events: none;
            z-index: 100;
          `;
          
          const cursor = document.createElement('div');
          cursor.style.cssText = `
            width: 2px;
            height: 18px;
            background-color: ${p.color};
            animation: remoteBlink 1s step-end infinite;
            border-radius: 1px;
            display: inline-block;
          `;
          
          node.appendChild(cursor);
          return node;
        },
        getPosition: () => ({
          position: {
            lineNumber: p.cursor!.line || 1,
            column: p.cursor!.column || 1,
          },
          preference: [
            monacoRef.current!.editor.ContentWidgetPositionPreference.EXACT,
          ],
        }),
      };
      
      editor.addContentWidget(widget);
      return widget;
    });

  (editor as any)._cursorWidgets = widgets;

  return () => {
    widgets.forEach((w) => editor.removeContentWidget(w));
  };
}, [participants]);


// Replace the dynamic colors useEffect:
useEffect(() => {
  const styleId = "cursor-colors";
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = participants.map((p) => {
    const safeId = p.socketId.replace(/[^a-zA-Z0-9]/g, '');
    return `
      .remote-cursor-blink-${safeId} {
        color: ${p.color} !important;
        font-size: 12px !important;
        font-weight: bold !important;
        animation: cursorBlink-${safeId} 1s step-end infinite !important;
        letter-spacing: -2px;
      }
      @keyframes cursorBlink-${safeId} {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
  }).join("\n");
}, [participants]);

  const handleChange: OnChange = useCallback((value) => {
    if (isRemoteChange.current) return;
    onCodeChange(value || "");
  }, [onCodeChange]);

  return (
    <div className="h-full flex flex-col">
      {/* Language selector */}
      <div className="flex items-center px-4 py-2 border-b border-border bg-card">
        
        {/* LEFT: Code Editor label */}
        <div className="text-xs font-semibold text-muted-foreground tracking-wide">
          Code Editor
        </div>

        {/* RIGHT: Language selector */}
        <div className="ml-auto flex items-center gap-2">

          <span className="text-xs text-muted-foreground font-medium">
            Language:
          </span>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="text-xs bg-background border border-input rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-2 py-1 rounded-md transition-colors"
          >
            {isRunning
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : "Run"}
          </button>

        </div>

      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={LANGUAGES.find((l) => l.value === language)?.monacoId || "javascript"}
          value={code}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          onMount={handleEditorMount}
          onChange={handleChange}
          options={{
            readOnly,
            glyphMargin: false,
            lineNumbersMinChars: 2,
            lineDecorationsWidth: 8,
            padding: {
              top: 8,
              bottom: 8,
            },
          }}
          loading={<div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading editor...</div>}
        />
      </div>

    <style>{`
      @keyframes remoteBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `}</style>
    </div>
  );
}