"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Code2, Users, Video, Zap, ArrowRight, Terminal } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [tab, setTab] = useState<"create" | "join">("create");

  // Wake up Render backend as soon as page loads
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`).catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("userName");
    if (saved) setUserName(saved);
  }, []);

  async function handleCreate() {
    if (!userName.trim() || !roomName.trim()) return;
    setIsCreating(true);
    try {
      localStorage.setItem("userName", userName.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() }),
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
    // Extract room ID from URL or use directly
    const match = roomLink.match(/\/room\/([^/?]+)/);
    const roomId = match ? match[1] : roomLink.trim();
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName.trim())}`);
  }

  const features = [
    { icon: <Code2 className="w-6 h-6" />, title: "Real-time Collaboration", desc: "Edit code together with live cursor tracking." },
    { icon: <Video className="w-6 h-6" />, title: "Video Chat", desc: "Built-in WebRTC video — no account needed." },
    { icon: <Terminal className="w-6 h-6" />, title: "5 Languages", desc: "JavaScript, TypeScript, Python, C++, Java." },
    { icon: <Zap className="w-6 h-6" />, title: "Instant Rooms", desc: "Create a room, share the link. Done." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm px-6 h-16 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Codestream</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Hero */}
        <div>
          {/* <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" /> No sign up required
          </div> */}
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Code together,{" "}
            <span className="text-primary">in real-time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Enter your name, create a room, share the link. Start collaborating instantly.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-4">
                <div className="text-primary mb-2">{f.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Entry form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Get Started</h2>

          {/* Name input - always shown */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1.5">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === "create" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Create Room
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === "join" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Join Room
            </button>
          </div>

          {tab === "create" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="My Coding Session"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={isCreating || !userName.trim() || !roomName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isCreating ? "Creating..." : <>Create Room <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Room Link or ID</label>
                <input
                  type="text"
                  value={roomLink}
                  onChange={(e) => setRoomLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  placeholder="Paste room link here..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={!userName.trim() || !roomLink.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Join Room <Users className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}