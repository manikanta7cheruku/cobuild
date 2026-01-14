import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // read the authed user from cookie-based session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let redirectPath = "/onboarding"; // default for new users

      if (user) {
        // check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        // if profile exists, go to dashboard instead of onboarding
        if (existingProfile) {
          redirectPath = "/dashboard";
        }
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}