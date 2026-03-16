"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Code2, Users, Video, Zap, ArrowRight, Terminal, Pencil, Check, X } from "lucide-react";

const ADJECTIVES = ["Swift", "Bright", "Clever", "Silent", "Bold", "Sharp", "Quick", "Cool", "Calm", "Epic"];
const NOUNS      = ["Coder", "Hacker", "Builder", "Wizard", "Ninja", "Dev", "Pilot", "Forge", "Mind", "Stack"];

function randomName() {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}


const PREVIEW_IMAGE: string | null = null;

// Shown only when PREVIEW_IMAGE is null
function EditorPreview() {
  const lines = [
    { indent: 0, color: "#c084fc", text: "function",  rest: " solve(nums) {" },
    { indent: 1, color: "#67e8f9", text: "const map", rest: " = new Map();" },
    { indent: 1, color: "#86efac", text: "for ",      rest: "(let i = 0; i < nums.length; i++) {" },
    { indent: 2, color: "#67e8f9", text: "const comp",rest: " = target - nums[i];" },
    { indent: 2, color: "#fbbf24", text: "if ",       rest: "(map.has(comp)) {" },
    { indent: 3, color: "#86efac", text: "return ",   rest: "[map.get(comp), i];" },
    { indent: 2, color: "#94a3b8", text: "}",         rest: "" },
    { indent: 2, color: "#67e8f9", text: "map.set",   rest: "(nums[i], i);" },
    { indent: 1, color: "#94a3b8", text: "}",         rest: "" },
    { indent: 0, color: "#94a3b8", text: "}",         rest: "" },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <div className="flex-1 mx-4 bg-[#0d1117] rounded-md px-3 py-1 text-xs text-slate-500 font-mono">
          solution.js — Codestream
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
            <Video className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-10 bg-[#0d1117] border-r border-white/5 flex flex-col items-center pt-3 gap-3">
          <Code2 className="w-4 h-4 text-primary" />
          <Users className="w-4 h-4 text-slate-600" />
          <Terminal className="w-4 h-4 text-slate-600" />
        </div>

        {/* Code area */}
        <div className="flex-1 flex">
          <div className="w-8 pt-3 pb-3 text-right pr-2 select-none">
            {lines.map((_, i) => (
              <div key={i} className="text-[11px] font-mono text-slate-600 leading-5">{i + 1}</div>
            ))}
          </div>
          <div className="flex-1 pt-3 pb-3 pl-2 overflow-hidden">
            {lines.map((l, i) => (
              <div key={i} className="text-[11px] font-mono leading-5 whitespace-nowrap">
                <span style={{ marginLeft: l.indent * 14 }} />
                <span style={{ color: l.color }}>{l.text}</span>
                <span className="text-slate-300">{l.rest}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video strip */}
        <div className="w-24 bg-[#0a0f14] border-l border-white/5 flex flex-col gap-2 p-2">
          {[
            { name: "Alex", bg: "bg-violet-600" },
            { name: "Sam",  bg: "bg-cyan-600" },
            { name: "You",  bg: "bg-emerald-600" },
          ].map((u) => (
            <div key={u.name} className="relative rounded-lg overflow-hidden bg-slate-800 aspect-video">
              <div className={`absolute inset-0 ${u.bg} opacity-20`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-6 h-6 rounded-full ${u.bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {u.name[0]}
                </div>
              </div>
              <span className="absolute bottom-0.5 left-1 text-[9px] text-white/70">{u.name}</span>
            </div>
          ))}
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[9px] text-slate-500">Alex:4</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[9px] text-slate-500">Sam:7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-primary/80 text-primary-foreground text-[10px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-300" /> 3 online</span>
          <span>JavaScript</span>
        </div>
        <span className="opacity-70">codestream.app</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`).catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("userName");
    const name = saved || randomName();
    setUserName(name);
    if (!saved) localStorage.setItem("userName", name);
  }, []);

  function startEditName() {
    setTempName(userName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 50);
  }

  function confirmName() {
    const n = tempName.trim() || userName;
    setUserName(n);
    localStorage.setItem("userName", n);
    setEditingName(false);
  }

  function cancelName() {
    setEditingName(false);
  }

  async function handleCreate() {
    if (!userName.trim()) return;
    setIsCreating(true);
    try {
      localStorage.setItem("userName", userName.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${userName}'s Room` }),
      });
      const data = await res.json();
      router.push(`/room/${data.room.id}?name=${encodeURIComponent(userName.trim())}`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  }

  function handleJoin() {
    if (!userName.trim() || !roomLink.trim()) return;
    localStorage.setItem("userName", userName.trim());
    const match = roomLink.match(/\/room\/([^/?]+)/);
    const roomId = match ? match[1] : roomLink.trim();
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName.trim())}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm px-6 h-16 flex items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Codestream</span>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-16">

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Code together,{" "}
                <span className="text-primary">in real‑time</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Instant collaborative rooms with live code sync, WebRTC video, and multi-language execution. No sign-up needed.
              </p>
            </div>

            {/* Username pill */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">You are</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameInputRef}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmName(); if (e.key === "Escape") cancelName(); }}
                    className="text-sm font-semibold bg-background border border-primary rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring w-40"
                  />
                  <button onClick={confirmName} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                  <button onClick={cancelName} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditName}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                >
                  {userName}
                  <Pencil className="w-3 h-3 opacity-60" />
                </button>
              )}
            </div>

            {/* CTAs */}
            {!showJoin ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {isCreating
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                    : <><Zap className="w-4 h-4" /> Create New Room</>}
                </button>
                <button
                  onClick={() => setShowJoin(true)}
                  className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl font-semibold transition-colors text-sm border border-border"
                >
                  <Users className="w-4 h-4" /> Join a Room
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomLink}
                    onChange={(e) => setRoomLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="Paste room link or ID..."
                    autoFocus
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={!roomLink.trim()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                  >
                    Join <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setShowJoin(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left">
                  ← Back
                </button>
              </div>
            )}
          </div>

          {/* Right: preview — swap PREVIEW_IMAGE above to use a real screenshot */}
          <div className="hidden lg:block">
            {PREVIEW_IMAGE ? (
              <img
                src={PREVIEW_IMAGE}
                alt="Codestream in action"
                className="w-full rounded-2xl border border-border shadow-2xl object-cover"
              />
            ) : (
              <EditorPreview />
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Code2 className="w-5 h-5" />,    title: "Live Code Sync",  desc: "Cursor tracking & real-time edits" },
            { icon: <Video className="w-5 h-5" />,    title: "Video Chat",       desc: "WebRTC, no account needed" },
            { icon: <Terminal className="w-5 h-5" />, title: "5 Languages",      desc: "JS, TS, Python, C++, Java" },
            { icon: <Zap className="w-5 h-5" />,      title: "Instant Rooms",   desc: "Share a link, start coding" },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
              <div className="text-primary mb-2">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}