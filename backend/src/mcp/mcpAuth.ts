import type { NextFunction, Request, Response } from "express";

/**
 * Protects MCP tool endpoints with a shared Bearer token when MCP_API_KEY is set.
 *
 * Leaving MCP_API_KEY unset keeps local development simple. In production, the
 * main backend should send the same value via Authorization: Bearer <key>.
 */
export function requireMcpApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = process.env.MCP_API_KEY;

  if (!apiKey) {
    next();
    return;
  }

  const expectedAuthorization = `Bearer ${apiKey}`;

  if (req.header("authorization") === expectedAuthorization) {
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized MCP request." });
}
