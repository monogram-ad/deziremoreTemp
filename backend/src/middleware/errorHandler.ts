import { Request, Response, NextFunction } from "express";

/**
 * Single place that turns a thrown/rejected error into a JSON response.
 * Must be registered with app.use(errorHandler) AFTER all routes (and
 * after the 404 handler) — see server.ts.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);

  // Prisma known-error codes — translate to sane HTTP statuses instead
  // of leaking a raw Prisma error message/stack to the client.
  if (err?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
    });
  }
  if (err?.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "Related record does not exist.",
    });
  }
  if (err?.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found." });
  }

  const status = err?.status || err?.statusCode || 500;
  const message =
    status < 500 ? err?.message || "Request failed" : "Internal server error";

  return res.status(status).json({ success: false, message });
}
