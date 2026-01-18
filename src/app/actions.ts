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



// ... (Your existing deletePortfolioItem function is above here) ...

// 5. Apply to Project (This fixes the red underline in ApplicationModal)
export async function applyToProject(projectId: string, roleId: string, roleTitle: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Login required" };

  // Check if already applied
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (existing) return { error: "You have already applied to this project." };

  const { error } = await supabase.from("applications").insert({
    project_id: projectId,
    user_id: user.id,
    role_id: roleId,
    role_title: roleTitle,
    note: formData.get("note") as string,
    portfolio_link: formData.get("portfolio_link") as string,
    availability: formData.get("availability") as string,
    status: 'pending'
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// 6. Post Comment (This fixes the red underline in ProjectClientUI)
export async function postComment(projectId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Login required" };

  const { error } = await supabase.from("comments").insert({
    project_id: projectId,
    user_id: user.id,
    content: content
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}


// ... existing imports ...
// 7. Manage Application (Accept/Decline)
export async function manageApplication(
  applicationId: string, 
  projectId: string, 
  status: 'accepted' | 'declined',
  roleId: string, // Which slot in the JSON is this?
  applicant: { id: string; full_name: string; email: string; username: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Login required" };

  // 1. Verify Ownership (Security Check)
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, squad")
    .eq("id", projectId)
    .single();

  if (!project || project.owner_id !== user.id) {
    return { error: "Unauthorized" };
  }

  // 2. Update Application Status
  const { error: appError } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (appError) return { error: appError.message };

  // 3. IF ACCEPTED: Update Project Squad JSON
  if (status === 'accepted') {
    const updatedSquad = project.squad.map((member: any) => {
      if (member.id === roleId) {
        return {
          ...member,
          isFilled: true,
          filledBy: applicant.id,
          // We can store minimal user info here for easy display
          name: applicant.full_name,
          username: applicant.username
        };
      }
      return member;
    });

    const { error: squadError } = await supabase
      .from("projects")
      .update({ squad: updatedSquad })
      .eq("id", projectId);

    if (squadError) return { error: "Failed to update squad roster" };
  }

  revalidatePath(`/dashboard/projects/${projectId}/applications`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}



// 8. Remove Member
export async function removeMember(applicationId: string, projectId: string, roleId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Login required" };

  // 1. Fetch Project to verify ownership
  const { data: project } = await supabase.from("projects").select("squad, owner_id").eq("id", projectId).single();
  if (!project || project.owner_id !== user.id) return { error: "Unauthorized" };

  // 2. Update Application (Mark as Removed)
  await supabase.from("applications").update({ status: 'removed', note: reason }).eq("id", applicationId);

  // 3. Reset Squad Slot in JSON
  const updatedSquad = project.squad.map((member: any) => {
      if (member.id === roleId) {
        return {
          ...member,
          isFilled: false,
          filledBy: null,
          name: null,
          username: null
        };
      }
      return member;
  });

  const { error } = await supabase.from("projects").update({ squad: updatedSquad }).eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}/applications`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}