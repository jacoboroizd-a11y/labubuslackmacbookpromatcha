import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");
  if (code) {
    const db = await supabase();
    if (db) {
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          new URL(next === "/auth/reset" ? next : "/", request.url),
        );
    }
  }
  return NextResponse.redirect(
    new URL(
      "/auth?message=Enlace%20inv%C3%A1lido%20o%20vencido.%20Intenta%20nuevamente.",
      request.url,
    ),
  );
}
