import { NextResponse } from "next/server";
import { createAuthToken } from "../../../utils/jwt";

export const runtime = "nodejs";

export async function POST(request: Request) { // handles POST /api/auth
  try {
    const body = (await request.json()) as { password?: string }; //read request body(get password:"123")

    if (body.password !== "123") { //Check password, if worng password, unauthorized
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const response = NextResponse.json({ success: true }); //if correct, create response
    response.cookies.set("auth_token", await createAuthToken(), { //Set cookie
      httpOnly: true, //Browser JS cannot steal the token(security)
      path: "/", //Cookie work everywhere(all admin routes)
      sameSite: "lax",//protection
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication route failed";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth_token");
  return response;
}
