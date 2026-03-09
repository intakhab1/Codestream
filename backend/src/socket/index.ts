import { Server, Socket } from "socket.io";
import { messagesDb, roomsDb } from "../mongo";

interface UserInfo {
  userName: string;
  socketId: string;
  cursor?: { line: number; column: number };
  color: string;
}

const roomUsers = new Map<string, Map<string, UserInfo>>();
const saveTimers = new Map<string, NodeJS.Timeout>();

function getUserColor(socketId: string): string {
  const colors = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#F0B27A"];
  const index = socketId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function handleLeaveRoom(socket: Socket, roomId: string, io: Server): void {
  const roomMap = roomUsers.get(roomId);
  if (!roomMap) return;
  roomMap.delete(socket.id);
  if (roomMap.size === 0) roomUsers.delete(roomId);
  socket.leave(roomId);
  io.to(roomId).emit("room:participants", Array.from(roomMap.values()));
  io.to(roomId).emit("webrtc:peer-left", { socketId: socket.id });
}

export function setupSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    const userName = (socket.handshake.query.userName as string) || "Anonymous";
    console.log(`Connected: ${socket.id} | User: ${userName}`);

    socket.on("media:audio-toggle", ({ isAudioOn }) => {
      for (const [roomId, roomMap] of roomUsers.entries()) {
        if (roomMap.has(socket.id)) {
          socket.to(roomId).emit("media:audio-toggle", { socketId: socket.id, isAudioOn });
          break;
        }
      }
    });

    socket.on("room:join", async ({ roomId }: { roomId: string }) => {
      socket.join(roomId);

      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      const roomMap = roomUsers.get(roomId)!;

      const userInfo: UserInfo = {
        userName,
        socketId: socket.id,
        color: getUserColor(socket.id),
      };

      roomMap.set(socket.id, userInfo);
      io.to(roomId).emit("room:participants", Array.from(roomMap.values()));
      socket.to(roomId).emit("webrtc:new-peer", { socketId: socket.id, userName });
    });

    socket.on("room:leave", ({ roomId }: { roomId: string }) => {
      handleLeaveRoom(socket, roomId, io);
    });

    socket.on("code:change", ({ roomId, code }: { roomId: string; code: string }) => {
      socket.to(roomId).emit("code:change", { code, from: socket.id });

      if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId)!);
      saveTimers.set(roomId, setTimeout(() => {
        roomsDb.update(roomId, { code }).catch(console.error);
        saveTimers.delete(roomId);
      }, 2000));
    });

    socket.on("code:cursor", ({ roomId, cursor }: { roomId: string; cursor: { line: number; column: number } }) => {
      const roomMap = roomUsers.get(roomId);
      if (roomMap?.has(socket.id)) roomMap.get(socket.id)!.cursor = cursor;
      socket.to(roomId).emit("code:cursor", { socketId: socket.id, cursor, color: getUserColor(socket.id) });
    });

    socket.on("code:language", ({ roomId, language }: { roomId: string; language: string }) => {
      roomsDb.update(roomId, { language }).catch(console.error);
      socket.to(roomId).emit("code:language", { language });
    });

    socket.on("chat:message", async ({ roomId, content }: { roomId: string; content: string }) => {
      try {
        const message = await messagesDb.create({ roomId, userName, content });
        io.to(roomId).emit("chat:message", message);
      } catch (error) {
        console.error("[chat:message]", error);
      }
    });

    // WebRTC — userName forwarded so video tiles show correct names
    socket.on("webrtc:offer", ({ targetSocketId, offer }: { targetSocketId: string; offer: any }) => {
      io.to(targetSocketId).emit("webrtc:offer", { from: socket.id, offer, userName });
    });

    socket.on("webrtc:answer", ({ targetSocketId, answer }: { targetSocketId: string; answer: any }) => {
      io.to(targetSocketId).emit("webrtc:answer", { from: socket.id, answer, userName });
    });

    socket.on("webrtc:ice-candidate", ({ targetSocketId, candidate }: { targetSocketId: string; candidate: any }) => {
      io.to(targetSocketId).emit("webrtc:ice-candidate", { from: socket.id, candidate });
    });

    socket.on("disconnect", () => {
      for (const [roomId, roomMap] of roomUsers.entries()) {
        if (roomMap.has(socket.id)) handleLeaveRoom(socket, roomId, io);
      }
    });
  });
}


// import { Server, Socket } from "socket.io";
// import { prisma } from "../lib/prisma";

// interface UserInfo {
//   userName: string;
//   socketId: string;
//   cursor?: { line: number; column: number };
//   color: string;
// }

// const roomUsers = new Map<string, Map<string, UserInfo>>();
// const saveTimers = new Map<string, NodeJS.Timeout>();

// function getUserColor(socketId: string): string {
//   const colors = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#F0B27A"];
//   const index = socketId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
//   return colors[index];
// }

// export function setupSocketHandlers(io: Server): void {
//   io.on("connection", (socket: Socket) => {
//     const userName = (socket.handshake.query.userName as string) || "Anonymous";
//     console.log(`Connected: ${socket.id} | User: ${userName}`);

//     //handlers
//     socket.on("media:audio-toggle", ({ isAudioOn }) => {

//       for (const [roomId, roomMap] of roomUsers.entries()) {
//         if (roomMap.has(socket.id)) {
//           socket.to(roomId).emit("media:audio-toggle", {
//             socketId: socket.id,
//             isAudioOn
//           });
//           break;
//         }
//       }
//     });
    
//     socket.on("room:join", async ({ roomId }: { roomId: string }) => {
//     socket.join(roomId);

//     if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
//     const roomMap = roomUsers.get(roomId)!;

//     const userInfo: UserInfo = {
//         userName,
//         socketId: socket.id,
//         color: getUserColor(socket.id),
//     };

//     roomMap.set(socket.id, userInfo);

//     // Broadcast full list to EVERYONE including the newcomer
//     io.to(roomId).emit("room:participants", Array.from(roomMap.values()));

//     // Notify existing users to initiate WebRTC offer to the newcomer
//     socket.to(roomId).emit("webrtc:new-peer", { socketId: socket.id, userName });
//     });

//     socket.on("room:leave", ({ roomId }: { roomId: string }) => {
//       handleLeaveRoom(socket, roomId, io);
//     });

//     socket.on("code:change", ({ roomId, code }: { roomId: string; code: string }) => {
//       socket.to(roomId).emit("code:change", { code, from: socket.id });
      
//       // Save to DB after 2 seconds of inactivity
//       if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId)!);
//       saveTimers.set(roomId, setTimeout(() => {
//         prisma.room.update({ where: { id: roomId }, data: { code } }).catch(console.error);
//         saveTimers.delete(roomId);
//       }, 2000));
//     });

//     socket.on("code:cursor", ({ roomId, cursor }: { roomId: string; cursor: { line: number; column: number } }) => {
//       const roomMap = roomUsers.get(roomId);
//       if (roomMap?.has(socket.id)) roomMap.get(socket.id)!.cursor = cursor;
//       socket.to(roomId).emit("code:cursor", { socketId: socket.id, cursor, color: getUserColor(socket.id) });
//     });

//     socket.on("code:language", ({ roomId, language }: { roomId: string; language: string }) => {
//       prisma.room.update({ where: { id: roomId }, data: { language } }).catch(console.error);
//       socket.to(roomId).emit("code:language", { language });
//     });

//     socket.on("chat:message", async ({ roomId, content }: { roomId: string; content: string }) => {
//       try {
//         const message = await prisma.message.create({
//           data: { content, roomId, userName },
//         });
//         io.to(roomId).emit("chat:message", message);
//       } catch (error) {
//         console.error("[chat:message]", error);
//       }
//     });

//     socket.on("webrtc:offer", ({ targetSocketId, offer }: { targetSocketId: string; offer: any }) => {
//       io.to(targetSocketId).emit("webrtc:offer", { from: socket.id, offer });
//     });

//     socket.on("webrtc:answer", ({ targetSocketId, answer }: { targetSocketId: string; answer: any }) => {
//       io.to(targetSocketId).emit("webrtc:answer", { from: socket.id, answer });
//     });

//     socket.on("webrtc:ice-candidate", ({ targetSocketId, candidate }: { targetSocketId: string; candidate: any }) => {
//       io.to(targetSocketId).emit("webrtc:ice-candidate", { from: socket.id, candidate });
//     });

//     socket.on("disconnect", () => {
//       for (const [roomId, roomMap] of roomUsers.entries()) {
//         if (roomMap.has(socket.id)) handleLeaveRoom(socket, roomId, io);
//       }
//     });
//   });
// }

// function handleLeaveRoom(socket: Socket, roomId: string, io: Server): void {
//   const roomMap = roomUsers.get(roomId);
//   if (!roomMap) return;
//   roomMap.delete(socket.id);
//   if (roomMap.size === 0) roomUsers.delete(roomId);
//   socket.leave(roomId);
//   // Broadcast full updated list to everyone remaining
//   io.to(roomId).emit("room:participants", Array.from(roomMap.values()));
//   io.to(roomId).emit("webrtc:peer-left", { socketId: socket.id });
// }