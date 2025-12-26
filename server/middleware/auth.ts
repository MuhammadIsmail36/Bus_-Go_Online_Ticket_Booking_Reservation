import { Request, Response, NextFunction } from "express";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin_secure_token_2025";

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  // Check for Bearer token
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === ADMIN_TOKEN && token.length > 0) {
      return next();
    }
  }

  // Check for Authorization header with token directly
  if (authHeader && authHeader === ADMIN_TOKEN && ADMIN_TOKEN.length > 0) {
    return next();
  }

  return res.status(401).json({ 
    error: "Unauthorized. Admin authentication required.",
    requiresLogin: true 
  });
}
