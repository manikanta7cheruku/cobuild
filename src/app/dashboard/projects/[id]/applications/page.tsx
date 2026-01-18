import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ReviewAppsClient from "@/components/ReviewAppsClient";

export default async function ReviewApplicationsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch Project (Ensure Ownership)
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  
  if (!project) return notFound();
  if (project.owner_id !== user.id) {
    return <div className="p-10 text-red-500 font-bold">Unauthorized. You do not own this project.</div>;
  }

  // 3. Fetch Applications (Pending Only for this view, or all if you prefer)
  const { data: applications } = await supabase
    .from("applications")
    .select("*, profiles:user_id(*)") // Join with profiles to get name/avatar
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const pendingCount = applications?.filter((a: any) => a.status === 'pending').length || 0;

  return (
    <div className="bg-slate-50 text-slate-900 h-screen flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',_sans-serif]">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 flex-shrink-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link href={`/dashboard/projects/${id}`} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </Link>
                <span className="text-sm font-bold text-slate-900 hidden md:block">Back to Project</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">
                   {user.email?.substring(0,2).toUpperCase()}
                </div>
            </div>
        </div>
      </nav>

      {/* PROJECT CONTEXT HEADER */}
      <div className="bg-slate-900 text-white flex-shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Reviewing Applications For</p>
                <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                    {project.name}
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{pendingCount} Pending</span>
                </h1>
            </div>
        </div>
      </div>

      {/* MAIN CLIENT UI */}
      <ReviewAppsClient applications={applications || []} project={project} />

    </div>
  );
}