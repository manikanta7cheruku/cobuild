"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
//import { sendEmail } from "@/utils/mailer"; // Nodemailer Import

// 1. Update Profile
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

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/profile/${formData.username}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

// 2. Add Portfolio Item
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

// 3. Update Portfolio Item
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

// 4. Delete Portfolio Item
export async function deletePortfolioItem(itemId: string, username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("portfolio_items").delete().eq("id", itemId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/profile/${username}`);
  return { success: true };
}

// 5. Apply to Project (With Email)
export async function applyToProject(projectId: string, roleId: string, roleTitle: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login required" };

  const { data: existing } = await supabase.from("applications").select("id").eq("project_id", projectId).eq("user_id", user.id).single();
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

  // EMAIL: Notify Owner
  // const { data } = await supabase.from("projects").select("name, profiles:owner_id(email)").eq("id", projectId).single();
  // const project: any = data;

  // if (project?.profiles?.email) {
  //   await sendEmail(
  //     project.profiles.email,
  //     `👋 New application for ${project.name}`,
  //     `
  //     <div style="font-family: sans-serif; color: #333;">
  //       <h2>Someone wants to join the squad!</h2>
  //       <p><strong>${user.email}</strong> applied for the <strong>${roleTitle}</strong> role.</p>
  //       <p><em>"${formData.get("note")}"</em></p>
  //       <br/>
  //       <a href="https://cobuild-app.vercel.app/dashboard/projects/${projectId}/applications" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Application</a>
  //     </div>
  //     `
  //   );
  // }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// 6. Post Comment
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

// 7. Manage Application (With Email)
export async function manageApplication(
  applicationId: string, 
  projectId: string, 
  status: 'accepted' | 'declined',
  roleId: string,
  applicant: { id: string; full_name: string; email: string; username: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login required" };

  const { data } = await supabase.from("projects").select("owner_id, squad, name").eq("id", projectId).single();
  const project: any = data;

  if (!project || project.owner_id !== user.id) return { error: "Unauthorized" };

  const { error: appError } = await supabase.from("applications").update({ status }).eq("id", applicationId);
  if (appError) return { error: appError.message };

  if (status === 'accepted') {
    const updatedSquad = project.squad.map((member: any) => {
      if (member.id === roleId) {
        return {
          ...member,
          isFilled: true,
          filledBy: applicant.id,
          name: applicant.full_name,
          username: applicant.username
        };
      }
      return member;
    });

    const { error: squadError } = await supabase.from("projects").update({ squad: updatedSquad }).eq("id", projectId);
    if (squadError) return { error: "Failed to update squad roster" };

    // EMAIL: Notify Applicant
    // if (applicant.email) {
    //    await sendEmail(
    //      applicant.email,
    //      `🎉 You're in! Welcome to ${project.name}`,
    //      `
    //      <div style="font-family: sans-serif; color: #333;">
    //        <h2 style="color: green;">Application Accepted</h2>
    //        <p>You are officially part of the <strong>${project.name}</strong> squad.</p>
    //        <p>The workspace links (Discord/GitHub) are now unlocked.</p>
    //        <br/>
    //        <a href="https://cobuild-app.vercel.app/dashboard/projects/${projectId}" style="background: #2563EB; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Workspace</a>
    //      </div>
    //      `
    //    );
    // }
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

  const { data: project } = await supabase.from("projects").select("squad, owner_id").eq("id", projectId).single();
  if (!project || project.owner_id !== user.id) return { error: "Unauthorized" };

  await supabase.from("applications").update({ status: 'removed', note: reason }).eq("id", applicationId);

  const updatedSquad = project.squad.map((member: any) => {
      if (member.id === roleId) {
        return { ...member, isFilled: false, filledBy: null, name: null, username: null };
      }
      return member;
  });

  const { error } = await supabase.from("projects").update({ squad: updatedSquad }).eq("id", projectId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}/applications`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// 9. Send Project Created Email
// export async function sendProjectCreatedEmail(projectId: string, projectName: string) {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if(!user || !user.email) return;

//   await sendEmail(
//     user.email,
//     `🚀 Your project is live: ${projectName}`,
//     `
//     <div style="font-family: sans-serif; color: #333;">
//       <h2>You just started something.</h2>
//       <p>Your project <strong>${projectName}</strong> is live.</p>
//       <p>We will notify you when someone applies.</p>
//       <br/>
//       <a href="https://cobuild-app.vercel.app/dashboard/projects/${projectId}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a>
//     </div>
//     `
//   );
// }

// 10. Delete Project
export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login required" };

  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}