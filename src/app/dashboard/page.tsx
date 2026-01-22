import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import { Suspense } from "react";
import DashboardLoading from "./loading";

export default async function DashboardPage() {
  return (
    // This Suspense boundary forces the Loading Skeleton to appear
    <Suspense fallback={<DashboardLoading />}>
      <AsyncDashboard />
    </Suspense>
  );
}

// This component does the heavy lifting
async function AsyncDashboard() {
  const supabase = await createClient();
  
  // 1. Get User (Fastest check)
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Fetch all heavy data in parallel
  const [profileRes, projectsRes, appsRes, favRes] = await Promise.all([
    supabase.from("profiles").select("full_name, username").eq("id", user?.id).single(),
    supabase.from("projects").select("*, profiles:owner_id(full_name, username)").order("created_at", { ascending: false }),
    supabase.from("applications").select("*, projects(name)").eq("user_id", user?.id),
    supabase.from("favorites").select("project_id").eq("user_id", user?.id)
  ]);

  return (
    <DashboardClient 
      user={user} 
      profile={profileRes.data} 
      initialProjects={projectsRes.data}
      initialApplications={appsRes.data}
      initialFavorites={favRes.data ? favRes.data.map(f => f.project_id) : []}
    />
  );
}