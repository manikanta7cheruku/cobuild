// src/app/api/profile/route.ts

// @ts-nocheck  // ignore TS in this file

import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server"; // your server-side client

// GET for quick debug
export async function GET() {
  return NextResponse.json({ ok: true, method: "GET" });
}

// POST: save or update profile
export async function POST(req: Request) {
  const body = await req.json();

  const {
    fullName,
    username,
    university,
    major,
    roles,           // string[]
    otherRole,
    experienceLevel,
    skills,
    about,
    availability,
    primaryLink,
    secondaryLink,
  } = body;

  const supabase = await createClient();

  // read logged-in user from Supabase auth cookie
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("getUser error or no user:", userError);
    return NextResponse.json(
      {
        message:
          "You’re not signed in. Please sign in again before completing your profile.",
      },
      { status: 401 }
    );
  }

  // roles column is text[] → send a JS string[] or null
  const rolesArray =
    Array.isArray(roles) && roles.length > 0 ? roles : null;

  const payload = {
    id: user.id,
    email: user.email,

    full_name: fullName.trim(),
    username: username.trim(),
    university: university.trim(),
    major: major.trim(),

    roles: rolesArray,                         // text[]
    other_role: otherRole || null,
    experience_level: experienceLevel || null,
    skills: skills || null,
    about: about || null,
    availability: availability || null,
    primary_link: primaryLink || null,
    secondary_link: secondaryLink || null,

    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Profile upsert error:", error);
    return NextResponse.json(
      {
        message: error.message ?? "We couldn’t save your profile.",
        details: error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Profile saved." }, { status: 200 });
}