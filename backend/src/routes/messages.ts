import { Router, Request, Response } from "express";
import { messagesDb } from "../mongo";

const router = Router();

router.get("/:roomId", async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await messagesDb.findMany(req.params.roomId);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;


// import { Router, Request, Response } from "express";
// import { prisma } from "../lib/prisma";

// const router = Router();

// router.get("/:roomId", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const messages = await prisma.message.findMany({
//       where: { roomId: req.params.roomId },
//       orderBy: { createdAt: "asc" },
//       take: 50,
//     });
//     res.json({ messages });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// export default router;