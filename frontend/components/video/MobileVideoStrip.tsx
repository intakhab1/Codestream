"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Height threshold: above this = vertical stacked tiles, below = horizontal strip
const VERTICAL_THRESHOLD = 180;

interface TileData {
  socketId: string;
  stream: MediaStream | null;
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

function VideoTile({ stream, name, isLocal, isMuted, isVideoOff, style }: TileData & { style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden border border-border/50 shrink-0" style={style}>
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
  panelHeight: number; // passed from parent so this component can switch layout
}

export function MobileVideoStrip({
  localStream, remoteStreams, remoteNames,
  isVideoOn, isAudioOn, onToggleVideo, onToggleAudio,
  localUserName, participants, panelHeight,
}: MobileVideoStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isVertical = panelHeight >= VERTICAL_THRESHOLD;

  const remoteTiles: TileData[] = Array.from(remoteStreams.entries()).map(([socketId, stream]) => ({
    socketId,
    stream,
    name: remoteNames.get(socketId) || participants.find((p) => p.socketId === socketId)?.userName || "Unknown",
    isLocal: false,
    isMuted: participants.find((p) => p.socketId === socketId)?.isAudioOn === false,
    isVideoOff: false,
  }));

  const allTiles: TileData[] = [
    { socketId: "local", stream: localStream, name: localUserName, isLocal: true, isMuted: !isAudioOn, isVideoOff: !isVideoOn },
    ...remoteTiles,
  ];

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => { checkScroll(); }, [allTiles.length, panelHeight]);

  function scrollBy(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -130 : 130, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  }

  // Controls always visible
  const Controls = (
    <div className="flex flex-col gap-1.5 shrink-0 justify-center px-1">
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
  );

  // ── VERTICAL layout (panel is tall enough) ────────────────────────────────
  if (isVertical) {
    const tileH = Math.max(60, Math.floor((panelHeight - 16) / Math.min(allTiles.length, 3)) - 6);
    return (
      <div className="flex h-full overflow-hidden bg-card border-t border-border">
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {allTiles.map((tile) => (
            <VideoTile key={tile.socketId} {...tile} style={{ height: tileH, width: "100%", aspectRatio: "unset" }} />
          ))}
        </div>
        <div className="flex items-center pr-1">
          {Controls}
        </div>
      </div>
    );
  }

  // ── HORIZONTAL strip layout (panel is short) ──────────────────────────────
  const tileH = Math.max(54, panelHeight - 16);
  const tileW = Math.round(tileH * (4 / 3));

  return (
    <div className="flex items-center h-full bg-card border-t border-border overflow-hidden">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy("left")}
          className="absolute left-1 z-10 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center shadow border border-border"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 px-2 py-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {allTiles.map((tile) => (
          <div key={tile.socketId} style={{ scrollSnapAlign: "start" }}>
            <VideoTile {...tile} style={{ width: tileW, height: tileH }} />
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

      {Controls}
    </div>
  );
}