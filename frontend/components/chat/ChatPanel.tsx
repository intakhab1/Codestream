"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserName: string; 
}

export function ChatPanel({ messages, onSendMessage, currentUserName }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  }

  return (
    <div className="h-full flex flex-col border-t border-border bg-card">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Chat</span>
        {messages.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{messages.length} messages</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.userName === currentUserName;  // ← ONLY here
            return (
              <div key={msg.id} className={cn("flex flex-col gap-0.5", isOwn ? "items-end" : "items-start")}>
                <div className="flex items-center gap-1.5">
                  {!isOwn && <span className="text-xs font-medium text-muted-foreground">{msg.userName}</span>}
                  <span className="text-xs text-muted-foreground/60">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className={cn("px-3 py-2 rounded-xl text-sm max-w-[80%] break-words",
                  isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-secondary-foreground rounded-bl-sm")}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 text-sm bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring" />
          <button onClick={handleSend} disabled={!input.trim()}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}