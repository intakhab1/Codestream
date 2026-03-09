"use client";

import { Users, Circle } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";

export function ParticipantsPanel() {
  const { participants } = useAppSelector((s) => s.participants);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Participants
          <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
            {participants.length}
          </span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((p) => (
          <div key={p.socketId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: p.color }}>
              {p.userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium truncate block">{p.userName}</span>
              <div className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}