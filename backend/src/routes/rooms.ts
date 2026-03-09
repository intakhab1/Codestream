import { Router, Request, Response } from "express";
import { roomsDb } from "../mongo";

const router = Router();

// GET /api/rooms/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await roomsDb.findUnique(req.params.id);
    if (!room) { res.status(404).json({ message: "Room not found" }); return; }
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/rooms
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, language = "javascript" } = req.body;
    if (!name) { res.status(400).json({ message: "Room name is required" }); return; }
    const room = await roomsDb.create({ name, language });
    res.status(201).json({ room });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /api/rooms/:id
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, code, name } = req.body;
    const room = await roomsDb.update(req.params.id, {
      ...(language && { language }),
      ...(code !== undefined && { code }),
      ...(name && { name }),
    });
    if (!room) { res.status(404).json({ message: "Room not found" }); return; }
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/rooms/:id
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await roomsDb.delete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;



// import { Router, Request, Response } from "express";
// import { prisma } from "../lib/prisma";

// const router = Router();

// // GET /api/rooms/:id
// router.get("/:id", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const room = await prisma.room.findUnique({ where: { id: req.params.id } });
//     if (!room) { res.status(404).json({ message: "Room not found" }); return; }
//     res.json({ room });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // POST /api/rooms
// router.post("/", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name, language = "javascript" } = req.body;
//     if (!name) { res.status(400).json({ message: "Room name is required" }); return; }
//     const room = await prisma.room.create({ data: { name, language } });
//     res.status(201).json({ room });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // PATCH /api/rooms/:id
// router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { language, code, name } = req.body;
//     const room = await prisma.room.update({
//       where: { id: req.params.id },
//       data: {
//         ...(language && { language }),
//         ...(code !== undefined && { code }),
//         ...(name && { name }),
//       },
//     });
//     res.json({ room });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // DELETE /api/rooms/:id
// router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
//   try {
//     await prisma.room.delete({ where: { id: req.params.id } });
//     res.json({ message: "Room deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// export default router;