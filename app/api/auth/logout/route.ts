import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/"
    });

    // Safely redirect back to the home page so the header updates immediately
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (error) {
    console.error("Logout error:", error);
    
    // Fallback safe redirect if URL parsing hits an edge case
    return NextResponse.redirect(new URL("/", "http://localhost:3000"));
  }
}