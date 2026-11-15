import { createHash } from "node:crypto";

export const IA_SESSION_COOKIE = "ia_session";
export const IA_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const FRONTEND_ORIGINS = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const sameSite = (process.env.IA_COOKIE_SAME_SITE || "lax").toLowerCase();
const sameSiteValues = {
  lax: "Lax",
  strict: "Strict",
  none: "None",
};

if (!sameSiteValues[sameSite]) {
  throw new Error("IA_COOKIE_SAME_SITE debe ser lax, strict o none");
}

const cookieAttributes = [
  `Path=/api`,
  "HttpOnly",
  `SameSite=${sameSiteValues[sameSite]}`,
];

if (process.env.NODE_ENV === "production" || sameSite === "none") {
  cookieAttributes.push("Secure");
}

export const obtenerTokenSesion = (req) => {
  const cookies = req.headers.cookie?.split(";") ?? [];
  const cookie = cookies.find((item) =>
    item.trim().startsWith(`${IA_SESSION_COOKIE}=`),
  );
  const token = cookie?.trim().slice(IA_SESSION_COOKIE.length + 1);

  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return null;
  }

  return token;
};

export const hashTokenSesion = (token) =>
  createHash("sha256").update(token).digest("hex");

export const establecerCookieSesion = (res, token) => {
  res.setHeader(
    "Set-Cookie",
    `${IA_SESSION_COOKIE}=${token}; ${cookieAttributes.join("; ")}; Max-Age=${Math.floor(
      IA_SESSION_DURATION_MS / 1000,
    )}`,
  );
};

export const borrarCookieSesion = (res) => {
  res.setHeader(
    "Set-Cookie",
    `${IA_SESSION_COOKIE}=; ${cookieAttributes.join("; ")}; Max-Age=0`,
  );
};

export const requireTrustedOrigin = (req, res, next) => {
  const origin = req.get("origin");
  if (!origin || !FRONTEND_ORIGINS.includes(origin)) {
    return res.status(403).json({ message: "Origen no permitido." });
  }

  return next();
};
