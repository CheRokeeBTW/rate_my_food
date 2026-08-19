import crypto from "crypto";
import type { Request, Response } from "express";

const VISITOR_COOKIE = "visitor_id";

export function getVisitorKey(
  req: Request,
  res: Response,
) {
  const authenticatedUser = req.user;

  if (authenticatedUser) {
    return {
      userId: authenticatedUser.id,
      visitorId: undefined,
    };
  }

  let visitorId = req.cookies?.[VISITOR_COOKIE];

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    res.cookie(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }

  return {
    userId: undefined,
    visitorId,
  };
}