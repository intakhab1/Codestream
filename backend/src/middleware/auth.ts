// import { Request, Response, NextFunction } from "express";
// import { verifyToken, JwtPayload } from "../lib/jwt";

// // Extend Express Request to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user?: JwtPayload;
//     }
//   }
// }

// export function authenticate(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       res.status(401).json({ message: "No token provided" });
//       return;
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token);

//     req.user = decoded;
//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// }