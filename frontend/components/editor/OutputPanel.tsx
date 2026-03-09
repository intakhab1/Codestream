"use client";

import { X, Terminal, AlertCircle, CheckCircle } from "lucide-react";

interface OutputPanelProps {
  output: string;
  stderr: string;
  exitCode: number | null;
  isRunning: boolean;
  onClose: () => void;
}

export function OutputPanel({ output, stderr, exitCode, isRunning, onClose }: OutputPanelProps) {
  const hasError = exitCode !== null && exitCode !== 0;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Output</span>
          {exitCode !== null && (
            <div className={`flex items-center gap-1 text-xs ${hasError ? "text-red-400" : "text-green-400"}`}>
              {hasError
                ? <AlertCircle className="w-3 h-3" />
                : <CheckCircle className="w-3 h-3" />}
              {hasError ? `Exit code ${exitCode}` : "Completed"}
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isRunning ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Running...
          </div>
        ) : (
          <>
            {output && (
              <pre className="text-green-300 whitespace-pre-wrap">{output}</pre>
            )}
            {stderr && (
              <pre className="text-red-400 whitespace-pre-wrap mt-2">{stderr}</pre>
            )}
            {!output && !stderr && exitCode !== null && (
              <span className="text-muted-foreground text-xs">No output</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}