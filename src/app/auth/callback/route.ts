import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  // Check if there is a 'next' param, otherwise default to onboarding
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. CHECK IF PROFILE EXISTS
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        // 2. LOGIC: If profile exists, go to Dashboard. If not, force Onboarding.
        if (existingProfile) {
          return NextResponse.redirect(`${origin}/dashboard`);
        } else {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  // 3. ERROR HANDLING: If code is invalid or expired
  // Redirect to home with an error message instead of showing a 404
  return NextResponse.redirect(`${origin}/?error=link-expired`);
}