// import { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import { prisma } from "../lib/prisma";
// import { signToken } from "../lib/jwt";

// // POST /api/auth/register
// export async function register(req: Request, res: Response): Promise<void> {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       res.status(400).json({ message: "All fields are required" });
//       return;
//     }

//     if (password.length < 6) {
//       res.status(400).json({ message: "Password must be at least 6 characters" });
//       return;
//     }

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       res.status(409).json({ message: "Email already registered" });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const user = await prisma.user.create({
//       data: { name, email, password: hashedPassword },
//       select: { id: true, name: true, email: true, createdAt: true },
//     });

//     const token = signToken({ userId: user.id, email: user.email });

//     res.status(201).json({ token, user });
//   } catch (error) {
//     console.error("[register]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// // POST /api/auth/login
// export async function login(req: Request, res: Response): Promise<void> {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       res.status(400).json({ message: "Email and password are required" });
//       return;
//     }

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       res.status(401).json({ message: "Invalid credentials" });
//       return;
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       res.status(401).json({ message: "Invalid credentials" });
//       return;
//     }

//     const token = signToken({ userId: user.id, email: user.email });

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         createdAt: user.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("[login]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// // GET /api/auth/me
// export async function getMe(req: Request, res: Response): Promise<void> {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user!.userId },
//       select: { id: true, name: true, email: true, createdAt: true },
//     });

//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     res.json({ user });
//   } catch (error) {
//     console.error("[getMe]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }