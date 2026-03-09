// import { Request, Response } from "express";
// import { prisma } from "../lib/prisma";

// // GET /api/rooms - list user's rooms
// export async function getUserRooms(req: Request, res: Response): Promise<void> {
//   try {
//     const rooms = await prisma.room.findMany({
//       where: {
//         members: { some: { userId: req.user!.userId } },
//       },
//       include: {
//         members: {
//           include: { user: { select: { id: true, name: true, email: true } } },
//         },
//         _count: { select: { messages: true } },
//       },
//       orderBy: { updatedAt: "desc" },
//     });
//     res.json({ rooms });
//   } catch (error) {
//     console.error("[getUserRooms]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// // POST /api/rooms - create room
// export async function createRoom(req: Request, res: Response): Promise<void> {
//   try {
//     const { name, language = "javascript" } = req.body;

//     if (!name) {
//       res.status(400).json({ message: "Room name is required" });
//       return;
//     }

//     const room = await prisma.room.create({
//       data: {
//         name,
//         language,
//         members: {
//           create: { userId: req.user!.userId, role: "owner" },
//         },
//       },
//       include: {
//         members: {
//           include: { user: { select: { id: true, name: true, email: true } } },
//         },
//       },
//     });

//     res.status(201).json({ room });
//   } catch (error) {
//     console.error("[createRoom]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// // GET /api/rooms/:id - get room details
// export async function getRoom(req: Request, res: Response): Promise<void> {
//   try {
//     const { id } = req.params;

//     const room = await prisma.room.findUnique({
//       where: { id },
//       include: {
//         members: {
//           include: { user: { select: { id: true, name: true, email: true } } },
//         },
//       },
//     });

//     if (!room) {
//       res.status(404).json({ message: "Room not found" });
//       return;
//     }

//     // If not already a member, add them (join via link)
//     // const isMember = room.members.some((m) => m.userId === req.user!.userId);
//     const isMember = room.members.some(
//         (m: { userId: string }) => m.userId === req.user!.userId
//     );

//     if (!isMember) {
//       await prisma.roomMember.create({
//         data: { roomId: id, userId: req.user!.userId, role: "member" },
//       });
//     }

//     res.json({ room });
//   } catch (error) {
//     console.error("[getRoom]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// // PATCH /api/rooms/:id - update room
// export async function updateRoom(req: Request, res: Response): Promise<void> {
//   try {
//     const { id } = req.params;
//     const { language, code, name } = req.body;

//     const room = await prisma.room.update({
//       where: { id },
//       data: {
//         ...(language && { language }),
//         ...(code !== undefined && { code }),
//         ...(name && { name }),
//       },
//     });

//     res.json({ room });
//   } catch (error) {
//     console.error("[updateRoom]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// // DELETE /api/rooms/:id - delete room
// export async function deleteRoom(req: Request, res: Response): Promise<void> {
//   try {
//     const { id } = req.params;

//     const membership = await prisma.roomMember.findUnique({
//       where: { roomId_userId: { roomId: id, userId: req.user!.userId } },
//     });

//     if (!membership || membership.role !== "owner") {
//       res.status(403).json({ message: "Only room owner can delete" });
//       return;
//     }

//     await prisma.room.delete({ where: { id } });
//     res.json({ message: "Room deleted" });
//   } catch (error) {
//     console.error("[deleteRoom]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }