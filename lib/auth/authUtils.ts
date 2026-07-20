// Removed "server-only" to allow execution in Edge/Middleware runtimes

import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

interface UserPayload extends JWTPayload {
  userId: number;
  email: string;
  role: string;
}

function getJwtSecret(): Uint8Array {
  // Graceful fallback to prevent runtime crashes if env variable isn't loaded
  const secretKey = process.env.JWT_SECRET || "fallback_development_secret_key_change_in_production_12345";
  return new TextEncoder().encode(secretKey);
}

async function signToken(payload: UserPayload): Promise<string> {
  const secret = getJwtSecret();
  const expiresInDays = 7;


  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${expiresInDays}d`)
    .sign(secret);
}

async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (
      payload &&
      typeof payload.userId === "number" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    return null;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

/**
 * Server-Side Auth Guard (For Server Components & API Routes)
 * Accepts an optional token string for Edge/Middleware runtime support.
 */
async function authGuard(
  requiredRoles: string[] = ["USER", "ADMIN"],
  providedToken?: string
): Promise<UserPayload | null> {
  try {
    let authToken = providedToken;

    // If no explicit token passed (e.g. Server Component), attempt reading via next/headers
    if (!authToken) {
      try {
        const cookieStore = await cookies();
        authToken = cookieStore.get("auth_token")?.value;
      } catch {
        // Suppress errors when called outside of AsyncLocalStorage/Node execution context
      }
    }

    if (!authToken) {
      return null;
    }

    const decoded = await verifyToken(authToken);

    if (!decoded) {
      return null;
    }

    if (!requiredRoles.includes(decoded.role)) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

async function requireAuth(
  requiredRoles: string[] = ["USER", "ADMIN"],
): Promise<UserPayload> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    throw new Error("Unauthorized: No authentication token");
  }

  const payload = await verifyToken(authToken);
  if (!payload) {
    throw new Error("Unauthorized: Invalid authentication token");
  }

  if (!requiredRoles.includes(payload.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return payload;
}

export { signToken, verifyToken, authGuard, requireAuth };
export type { UserPayload };