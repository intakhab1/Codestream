"use client";

import { useEffect, useRef } from "react";
import { Video, VideoOff, Mic, MicOff, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

function VideoTile({ stream, name, isLocal = false, isMuted = false, isVideoOff = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden aspect-video border border-border/50">
      {/* Keep video element always mounted, just hide it with CSS */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
      />
      {/* Show placeholder on top when video is off */}
      {isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
        </div>
      )}
      {/* Name tag */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[80%]">
          {name} {isLocal && "(you)"}
        </span>
        {isMuted && (
          <div className="bg-destructive rounded-full p-1">
            <MicOff className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoPanelProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  remoteNames: Map<string, string>;
  isVideoOn: boolean;
  isAudioOn: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  localUserName: string;
  participants: { socketId: string; userName: string; isAudioOn?: boolean }[];}

export function VideoPanel({ localStream, remoteStreams, remoteNames, isVideoOn, isAudioOn, onToggleVideo, onToggleAudio, localUserName, participants }: VideoPanelProps) {
  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" /> Video Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <VideoTile stream={localStream} name={localUserName} isLocal isVideoOff={!isVideoOn} isMuted={!isAudioOn} />

        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
          const participant = participants.find((p) => p.socketId === socketId);

          return (
            <VideoTile
              key={socketId}
              stream={stream}
              name={remoteNames.get(socketId) || participant?.userName || "Unknown"}
              // isMuted={participant ? !participant.isAudioOn : false}
              isMuted={participant?.isAudioOn === false}
            />
          );
        })}


        {remoteStreams.size === 0 && (
          <div className="text-center py-6 text-xs text-muted-foreground">
            <p>No one else in the call.</p>
            <p className="mt-1">Share the room link to invite others.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex items-center justify-center gap-3">
        <button onClick={onToggleAudio}
          className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isAudioOn ? "bg-secondary hover:bg-secondary/80" : "bg-destructive hover:bg-destructive/80")}>
          {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-white" />}
        </button>
        <button onClick={onToggleVideo}
          className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isVideoOn ? "bg-secondary hover:bg-secondary/80" : "bg-destructive hover:bg-destructive/80")}>
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
}