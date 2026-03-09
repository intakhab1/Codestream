// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Code2, Plus, LogOut, Moon, Sun, Trash2, ExternalLink, Users, Clock, Loader2 } from "lucide-react";
// import { useTheme } from "next-themes";
// import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
// import { logout, fetchCurrentUser } from "@/store/slices/authSlice";
// import { setRooms, addRoom, removeRoom } from "@/store/slices/roomSlice";
// import { api } from "@/lib/api";
// import { Room } from "@/types";

// export default function DashboardPage() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { theme, setTheme } = useTheme();
//   const { user, token } = useAppSelector((s) => s.auth);
//   const { rooms } = useAppSelector((s) => s.room);

//   const [isCreating, setIsCreating] = useState(false);
//   const [newRoomName, setNewRoomName] = useState("");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!token) { router.push("/auth/login"); return; }
//     dispatch(fetchCurrentUser());
//     loadRooms();
//   }, [token]);

//   async function loadRooms() {
//     try {
//       setIsLoading(true);
//       const data = await api.getRooms();
//       dispatch(setRooms(data.rooms));
//     } catch { } finally { setIsLoading(false); }
//   }

//   async function handleCreateRoom() {
//     if (!newRoomName.trim()) return;
//     try {
//       setIsCreating(true);
//       const data = await api.createRoom({ name: newRoomName });
//       dispatch(addRoom(data.room));
//       setShowCreateModal(false);
//       setNewRoomName("");
//       router.push(`/room/${data.room.id}`);
//     } catch (err) { console.error(err); } finally { setIsCreating(false); }
//   }

//   async function handleDeleteRoom(id: string, e: React.MouseEvent) {
//     e.preventDefault();
//     if (!confirm("Delete this room?")) return;
//     try { await api.deleteRoom(id); dispatch(removeRoom(id)); } catch (err) { console.error(err); }
//   }

//   function handleLogout() { dispatch(logout()); router.push("/"); }

//   const languageColors: Record<string, string> = {
//     javascript: "bg-yellow-400/20 text-yellow-400",
//     typescript: "bg-blue-400/20 text-blue-400",
//     python: "bg-green-400/20 text-green-400",
//     cpp: "bg-purple-400/20 text-purple-400",
//     java: "bg-orange-400/20 text-orange-400",
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <nav className="border-b border-border bg-card">
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           <Link href="/" className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//               <Code2 className="w-5 h-5 text-primary-foreground" />
//             </div>
//             <span className="font-bold text-lg">Codestream</span>
//           </Link>
//           <div className="flex items-center gap-3">
//             <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
//             <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//               className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
//               {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             </button>
//             <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
//               <LogOut className="w-4 h-4" />
//               <span className="hidden sm:block">Logout</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto px-6 py-10">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
//             <p className="text-muted-foreground mt-1">{rooms.length} room{rooms.length !== 1 ? "s" : ""}</p>
//           </div>
//           <button onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
//             <Plus className="w-4 h-4" /> New Room
//           </button>
//         </div>

//         {isLoading ? (
//           <div className="flex items-center justify-center py-20">
//             <Loader2 className="w-8 h-8 animate-spin text-primary" />
//           </div>
//         ) : rooms.length === 0 ? (
//           <div className="text-center py-20">
//             <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//             <h3 className="text-lg font-medium mb-2">No rooms yet</h3>
//             <p className="text-muted-foreground mb-6">Create your first room to start coding together</p>
//             <button onClick={() => setShowCreateModal(true)}
//               className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
//               Create Room
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {rooms.map((room: Room) => (
//               <Link key={room.id} href={`/room/${room.id}`}
//                 className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-semibold truncate">{room.name}</h3>
//                     <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${languageColors[room.language] || "bg-muted text-muted-foreground"}`}>
//                       {room.language}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button onClick={(e) => handleDeleteRoom(room.id, e)}
//                       className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
//                       <Trash2 className="w-3.5 h-3.5" />
//                     </button>
//                     <span className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground">
//                       <ExternalLink className="w-3.5 h-3.5" />
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                   <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room.members?.length || 0} member{(room.members?.length || 0) !== 1 ? "s" : ""}</span>
//                   <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(room.updatedAt).toLocaleDateString()}</span>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </main>

//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
//             <h2 className="text-lg font-semibold mb-4">Create New Room</h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1.5">Room Name</label>
//                 <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
//                   placeholder="My Coding Session" onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()} autoFocus
//                   className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
//                 <button onClick={handleCreateRoom} disabled={isCreating || !newRoomName.trim()}
//                   className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
//                   {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
//                   Create Room
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }export default function DashboardPage() { return null; }
export default function DashboardPage() { return null; }
