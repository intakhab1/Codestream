"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

function MiniTile({ stream, name, isLocal = false, isMuted = false, isVideoOff = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden border border-border/50 shrink-0"
      style={{ width: 110, height: 82 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}
      />
      {isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
        <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full truncate max-w-[75%]">
          {name}{isLocal ? " (you)" : ""}
        </span>
        {isMuted && (
          <div className="bg-destructive rounded-full p-0.5">
            <MicOff className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

interface MobileVideoStripProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  remoteNames: Map<string, string>;
  isVideoOn: boolean;
  isAudioOn: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  localUserName: string;
  participants: { socketId: string; userName: string; isAudioOn?: boolean }[];
}

export function MobileVideoStrip({
  localStream, remoteStreams, remoteNames,
  isVideoOn, isAudioOn, onToggleVideo, onToggleAudio,
  localUserName, participants,
}: MobileVideoStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const remoteTiles = Array.from(remoteStreams.entries()).map(([socketId, stream]) => ({
    socketId,
    stream,
    name: remoteNames.get(socketId) || participants.find((p) => p.socketId === socketId)?.userName || "Unknown",
    isLocal: false,
    isMuted: participants.find((p) => p.socketId === socketId)?.isAudioOn === false,
  }));

  const allTiles = [
    { socketId: "local", stream: localStream, name: localUserName, isLocal: true, isMuted: !isAudioOn },
    ...remoteTiles,
  ];

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    checkScroll();
  }, [allTiles.length]);

  function scrollBy(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -130 : 130, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  }

  return (
    <div className="bg-card border-t border-b border-border shrink-0">
      {/* Tiles row */}
      <div className="relative flex items-center px-1 py-2">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy("left")}
            className="absolute left-0 z-10 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center shadow border border-border"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {allTiles.map((tile) => (
            <div key={tile.socketId} style={{ scrollSnapAlign: "start" }}>
              <MiniTile
                stream={tile.stream}
                name={tile.name}
                isLocal={tile.isLocal}
                isVideoOff={tile.isLocal ? !isVideoOn : false}
                isMuted={tile.isMuted}
              />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy("right")}
            className="absolute right-10 z-10 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center shadow border border-border"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Controls pinned to right */}
        <div className="flex flex-col gap-1.5 ml-2 shrink-0">
          <button
            onClick={onToggleAudio}
            className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              isAudioOn ? "bg-secondary" : "bg-destructive")}
          >
            {isAudioOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-white" />}
          </button>
          <button
            onClick={onToggleVideo}
            className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              isVideoOn ? "bg-secondary" : "bg-destructive")}
          >
            {isVideoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}