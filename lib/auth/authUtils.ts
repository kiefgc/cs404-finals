// Import server-only to prevent client-side usage
import "server-only";

// Import required Next.js modules
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Define types for user payload
interface UserPayload extends JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// Validate JWT secret exists
function getJwtSecret(): Uint8Array {
  // TEMPORARY DEBUG: Let's see what environment keys actually exist
  console.log("--- ENV DEBUG START ---");
  console.log("All available env keys:", Object.keys(process.env));
  console.log("Is JWT_SECRET present?:", !!process.env.JWT_SECRET);
  console.log("--- ENV DEBUG END ---");

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

// Utility function to sign JWT tokens
async function signToken(payload: UserPayload): Promise<string> {
  const secret = getJwtSecret();
  const expiresInDays = 7;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${expiresInDays}d`)
    .sign(secret);
}

// Utility function to verify JWT tokens
async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    // Validate the payload structure
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

// Authentication guard function
async function authGuard(
  requiredRoles: string[] = ["USER", "ADMIN"],
): Promise<UserPayload | null> {
  try {
    // Get the cookies store
    const cookieStore = await cookies();

    // Extract the auth token
    const authToken = cookieStore.get("auth_token")?.value;

    // If no token, return null
    if (!authToken) {
      return null;
    }

    // Verify the token
    const decoded = await verifyToken(authToken);

    // If token is invalid, return null
    if (!decoded) {
      return null;
    }

    // Check if the user's role is in the required roles
    if (!requiredRoles.includes(decoded.role)) {
      return null;
    }

    // Return the decoded user data
    return decoded;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Authentication guard function that throws errors instead of returning null
export async function requireAuth(
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

// Export functions
export { signToken, verifyToken, authGuard };
export type { UserPayload };
