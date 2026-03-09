"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Code2, Copy, Check, ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentRoom, setCode, setLanguage, clearRoom } from "@/store/slices/roomSlice";
import { clearParticipants } from "@/store/slices/participantsSlice";
import { setMessages, clearChat } from "@/store/slices/chatSlice";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CollaborativeEditor } from "@/components/editor/CollaborativeEditor";
import { VideoPanel } from "@/components/video/VideoPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ParticipantsPanel } from "@/components/participants/ParticipantsPanel";
import { OutputPanel } from "@/components/editor/OutputPanel";
import { Language } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python:     { language: "python",     version: "3.10.0" },
  cpp:        { language: "c++",        version: "10.2.0" },
  java:       { language: "java",       version: "15.0.2" },
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const roomId = params.id as string;

  const { currentRoom, currentCode, currentLanguage } = useAppSelector((s) => s.room);
  const { messages } = useAppSelector((s) => s.chat);
  const participants = useAppSelector((s) => s.participants.participants);

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Anonymous");

  // This ref holds the editor's direct update function.
  // Remote code changes call this directly — bypassing Redux — so no page re-render.
  const remoteUpdateRef = useRef<(code: string) => void>(() => {});

  // Resizing
  const [editorHeightPct, setEditorHeightPct] = useState(65);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoPanelWidth, setVideoPanelWidth] = useState(240);
  const isHDragging = useRef(false);

  // Output panel
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState("");
  const [stderr, setStderr] = useState("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Load name from URL first — fixes "Anonymous" bug
  useEffect(() => {
    const nameFromUrl = searchParams.get("name");
    if (nameFromUrl) {
      setUserName(nameFromUrl);
    } else {
      const saved = localStorage.getItem("userName");
      if (saved) setUserName(saved);
      else {
        const name = prompt("Enter your name:") || "Anonymous";
        localStorage.setItem("userName", name);
        setUserName(name);
      }
    }
  }, [searchParams]);

  // Remote code handler: updates editor directly WITHOUT Redux dispatch
  // This means no page re-render when remote user types — fixes flickering
  const handleRemoteCode = useCallback((code: string) => {
    remoteUpdateRef.current(code);
    // Still update Redux so currentCode stays correct for Run button
    dispatch(setCode(code));
  }, [dispatch]);

  const { socketRef, emitCodeChange, emitCursorChange, emitLanguageChange, sendMessage } =
    useSocket(roomId, userName, handleRemoteCode);

  const { localStream, remoteStreams, remoteNames,isVideoOn, isAudioOn, startLocalMedia, toggleVideo, toggleAudio } =
    useWebRTC(socketRef);

  // Load room data
  useEffect(() => {
    if (!roomId) return;
    async function loadRoom() {
      try {
        setIsLoading(true);
        const [roomRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/api/rooms/${roomId}`),
          fetch(`${API_URL}/api/messages/${roomId}`),
        ]);
        const roomData = await roomRes.json();
        const msgData = await msgRes.json();
        if (!roomRes.ok) { router.push("/"); return; }
        dispatch(setCurrentRoom(roomData.room));
        dispatch(setMessages(msgData.messages || []));
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }
    loadRoom();
    startLocalMedia();
    return () => {
      dispatch(clearRoom());
      dispatch(clearParticipants());
      dispatch(clearChat());
    };
  }, [roomId]);

  // Resize event listeners
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientY - rect.top) / rect.height) * 100;
      setEditorHeightPct(Math.min(Math.max(pct, 25), 85));
    }
    function onMouseUp() { isDragging.current = false; }
    function onMouseMoveH(e: MouseEvent) {
      if (!isHDragging.current) return;
      setVideoPanelWidth(Math.min(Math.max(window.innerWidth - e.clientX, 160), 480));
    }
    function onMouseUpH() { isHDragging.current = false; }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMoveH);
    window.addEventListener("mouseup", onMouseUpH);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMoveH);
      window.removeEventListener("mouseup", onMouseUpH);
    };
  }, []);

  const handleLocalCodeChange = useCallback((code: string) => {
    dispatch(setCode(code));
    emitCodeChange(code);
  }, [dispatch, emitCodeChange]);

  const handleLanguageChange = useCallback((lang: Language) => {
    dispatch(setLanguage(lang));
    emitLanguageChange(lang);
  }, [dispatch, emitLanguageChange]);

  const handleRun = useCallback(async () => {
    setShowOutput(true);
    setIsRunning(true);
    setOutput("");
    setStderr("");
    setExitCode(null);
    const lang = LANGUAGE_MAP[currentLanguage];
    if (!lang) {
      setStderr(`Unsupported language: ${currentLanguage}`);
      setExitCode(1);
      setIsRunning(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode, language: currentLanguage }),
      });
      const data = await res.json();
      setOutput(data.output || "");
      setStderr(data.stderr || "");
      setExitCode(data.exitCode ?? 0);
    } catch {
      setStderr("Failed to connect to execution server.");
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  }, [currentCode, currentLanguage]);

  async function copyRoomLink() {
    const url = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Code2 className="w-10 h-10 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:block">Home</span>
        </button>

        {/* <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {isRunning
            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <span>▶ Run</span>}
        </button> */}

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm truncate max-w-[200px]">{currentRoom?.name || "Room"}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Hi, <span className="text-foreground font-medium">{userName}</span>
          </span>
          <button onClick={copyRoomLink} className="flex items-center gap-1.5 text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Share"}
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>

        <div className="w-52 shrink-0 hidden lg:block">
          <ParticipantsPanel />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">

          <div style={{ height: `${editorHeightPct}%` }} className="overflow-hidden min-h-0">
            <CollaborativeEditor
              code={currentCode}
              language={currentLanguage}
              onCodeChange={handleLocalCodeChange}
              onCursorChange={emitCursorChange}
              onLanguageChange={handleLanguageChange}
              onRun={handleRun}
              isRunning={isRunning}

            />
          </div>

          {showOutput && (
            <div className="h-48 overflow-hidden min-h-0 border-t border-border shrink-0">
              <OutputPanel
                output={output}
                stderr={stderr}
                exitCode={exitCode}
                isRunning={isRunning}
                onClose={() => setShowOutput(false)}
              />
            </div>
          )}

          <div
            onMouseDown={(e) => { isDragging.current = true; e.preventDefault(); }}
            className="h-2 bg-border hover:bg-primary/40 cursor-row-resize shrink-0 transition-colors flex items-center justify-center"
          >
            <div className="w-8 h-0.5 bg-muted-foreground/30 rounded-full" />
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            <ChatPanel messages={messages} onSendMessage={sendMessage} currentUserName={userName} />
          </div>
        </div>

        <div
          onMouseDown={(e) => { isHDragging.current = true; e.preventDefault(); }}
          className="w-1.5 bg-border hover:bg-primary/40 cursor-col-resize shrink-0 transition-colors hidden md:flex items-center justify-center"
        >
          <div className="h-8 w-0.5 bg-muted-foreground/30 rounded-full" />
        </div>

        <div style={{ width: `${videoPanelWidth}px` }} className="shrink-0 hidden md:block overflow-hidden">
          <VideoPanel
            localStream={localStream}
            remoteStreams={remoteStreams}
            isVideoOn={isVideoOn}
            isAudioOn={isAudioOn}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            localUserName={userName}
            participants={participants}
          />
        </div>
      </div>
    </div>
  );
}