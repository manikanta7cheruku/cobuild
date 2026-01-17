"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Update Profile Action
export async function updateProfile(formData: any) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates = {
    full_name: formData.full_name,
    username: formData.username,
    university: formData.university,
    grad_year: formData.grad_year,
    roles: [formData.primary_role],
    experience_level: formData.experience_level,
    availability: formData.availability,
    about: formData.about,
    skills: formData.skills,
    primary_link: formData.primary_link,
    secondary_link: formData.secondary_link,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/profile/${formData.username}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

// 2. Add Portfolio/Trophy Action
export async function addPortfolioItem(formData: FormData, username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("portfolio_items").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    role: formData.get("role") as string,
    demo_url: formData.get("demo_url") as string,
    readme_url: formData.get("readme_url") as string,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/profile/${username}`);
  return { success: true };
}

// 3. Update Trophy
export async function updatePortfolioItem(formData: FormData, itemId: string, username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("portfolio_items").update({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    role: formData.get("role") as string,
    demo_url: formData.get("demo_url") as string,
    readme_url: formData.get("readme_url") as string,
  }).eq("id", itemId).eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/profile/${username}`);
  return { success: true };
}

// 4. Delete Trophy
export async function deletePortfolioItem(itemId: string, username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("portfolio_items").delete().eq("id", itemId).eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/profile/${username}`);
  return { success: true };
}