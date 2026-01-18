import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProjectClientUI from "@/components/ProjectClientUI";
import ApplicationWrapper from "./ApplicationWrapper"; 
import { Clock, Lock, Plus, Github, MessageCircle } from "lucide-react";

const timeAgo = (date: string) => {
  const diff = new Date().getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 3600 * 24));
  return days === 0 ? "Today" : `${days}d ago`;
};

export default async function ProjectDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const supabase = await createClient();

  // 1. Fetch Data
  const { data: project } = await supabase.from("projects").select("*, profiles:owner_id(*)").eq("id", id).single();
  if (!project) return notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: comments } = await supabase.from("comments").select("*, profiles:user_id(*)").eq("project_id", id).order("created_at", { ascending: false });

  // 2. Check Permissions
  let myApplication = null;
  let isMember = false;

  if (user) {
    // Check if pending app exists
    const { data: app } = await supabase.from("applications").select("role_id, status").eq("project_id", id).eq("user_id", user.id).single();
    myApplication = app;

    // Check if actually IN the squad (Accepted)
    isMember = project.squad?.some((m: any) => m.filledBy === user.id);
  }

  const isOwner = user?.id === project.owner_id;
  const hasAccess = isOwner || isMember;
  const filledCount = project.squad.filter((s:any) => s.isFilled).length;

  // --- SUB-COMPONENTS ---
  
  const OverviewContent = (
    <div className="prose prose-slate max-w-none text-slate-600 font-sans">
      
      {/* 🚀 WORKSPACE UI (If Member/Owner) */}
      {hasAccess ? (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden relative mb-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Team Workspace</h2>
                <p className="text-sm text-slate-500 mb-6">Welcome to the squad! Join the chat and grab the code.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. DISCORD */}
                    <a href={project.discord_link || "#"} target="_blank" className={`flex items-center gap-4 p-4 rounded-xl border border-slate-200 transition group ${project.discord_link ? 'hover:border-[#5865F2] hover:bg-[#5865F2]/5 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                        <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-[#5865F2]">Join Discord</h3>
                            <p className="text-xs text-slate-500">{project.discord_link ? "Project Chat" : "Link not added"}</p>
                        </div>
                    </a>

                    {/* 2. GITHUB */}
                    <a href={project.repo_link || "#"} target="_blank" className={`flex items-center gap-4 p-4 rounded-xl border border-slate-200 transition group ${project.repo_link ? 'hover:border-black hover:bg-slate-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                            <Github size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-black">Open Repo</h3>
                            <p className="text-xs text-slate-500">{project.repo_link ? "View Source Code" : "Link not added"}</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
      ) : (
        /* 🔒 LOCKED STATE (If Visitor) */
        <div className="bg-slate-50 rounded-xl p-8 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center mb-8">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-3"><Lock className="text-slate-400" size={20} /></div>
            <h4 className="font-bold text-slate-900">Project Links Locked</h4>
            <p className="text-sm text-slate-500 mt-1 mb-4">Join the team to access the GitHub Repo and Workspace.</p>
        </div>
      )}

      {/* STANDARD CONTENT */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">The Problem</h3>
      <p className="mb-6 leading-relaxed whitespace-pre-wrap">{project.problem}</p>
      <h3 className="text-lg font-bold text-slate-900 mb-2">The Solution</h3>
      <p className="mb-6 leading-relaxed whitespace-pre-wrap">{project.solution}</p>
      <h3 className="text-lg font-bold text-slate-900 mb-2">Tech Stack</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tech_stack?.map((t: string) => <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">{t}</span>)}
      </div>
    </div>
  );

  const DiscussionContent = (
    <div className="space-y-6">
      {comments?.map((c: any) => (
        <div key={c.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-100"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.profiles?.username}`} alt="avatar" /></div>
            <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1"><span className="text-sm font-bold text-slate-900">{c.profiles?.full_name}</span><span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span></div>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{c.content}</p>
            </div>
        </div>
      ))}
      {(!comments || comments.length === 0) && <p className="text-slate-400 italic text-sm">No comments yet. Be the first!</p>}
    </div>
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-24 md:pb-10 font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/dashboard" className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm hover:bg-black transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </Link>
                <span className="text-sm font-bold text-slate-500 hidden md:block">Back to Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
                 <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">{user?.email?.substring(0,2).toUpperCase()}</div>
            </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT: INFO */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        {isMember && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wide">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                You are a Member
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wide ${project.limit_to_uni ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                            {project.limit_to_uni ? "Campus Only" : "Idea Phase"}
                        </span>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Clock size={12}/> Posted {timeAgo(project.created_at)}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{project.name}</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.profiles?.username}`} alt="avatar" /></div>
                            <span className="text-sm font-bold text-slate-700">{project.profiles?.full_name}</span>
                        </div>
                    </div>
                </div>
                <ProjectClientUI projectId={id} overviewContent={OverviewContent} discussionContent={DiscussionContent}  hasAccess={hasAccess} />
            </div>

            {/* RIGHT: SQUAD */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Squad Roster</h3>
                            <span className="text-xs font-bold text-slate-500">{filledCount}/{project.squad.length} Filled</span>
                        </div>
                        <div className="p-4 space-y-4">
                            
                            {project.squad.map((member: any) => {
                                const isDev = member.type === 'dev'; 
                                const containerClass = isDev 
                                    ? "relative border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-3 group hover:border-blue-400 transition"
                                    : "border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-4 group hover:border-slate-300 transition";
                                const iconColor = isDev ? "text-blue-500 border-blue-200" : "text-slate-400 border-slate-200";
                                const titleColor = isDev ? "text-blue-900" : "text-slate-500";
                                const skillColor = isDev ? "text-blue-600" : "text-slate-400";

                                return (
                                    <div key={member.id}>
                                        {member.isFilled ? (
                                            /* FILLED SLOT */
                                            member.filledBy === user?.id ? (
                                                /* YOU (Current User) */
                                                <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-blue-200"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="avatar" /></div>
                                                        <div><p className="text-sm font-bold text-slate-900">You</p><p className="text-xs text-blue-600 font-bold">{member.title}</p></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-1 rounded border border-blue-100">Joined</span>
                                                </div>
                                            ) : (
                                                /* OTHER MEMBER */
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || member.title}`} alt="avatar" /></div>
                                                        <div><p className="text-sm font-bold text-slate-900">{member.type === 'leader' ? project.profiles.full_name : (member.name || "Member")}</p><p className="text-xs text-slate-500">{member.title}</p></div>
                                                    </div>
                                                    {member.type === 'leader' ? <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Admin</span> : <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Ready</span>}
                                                </div>
                                            )
                                        ) : (
                                            /* OPEN SLOT */
                                            <div className={containerClass}>
                                                <div className="flex items-center justify-between gap-4 w-full">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-10 h-10 rounded-full bg-white border flex-shrink-0 flex items-center justify-center ${iconColor}`}>
                                                            {member.type === 'dev' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg> : <Plus size={20}/>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-bold truncate ${titleColor}`}>{member.title}</p>
                                                            <p className={`text-xs truncate ${skillColor}`}>{member.skill || "Open Role"}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {isOwner ? (
                                                        <span className="flex-shrink-0 text-xs font-bold text-slate-400">Empty</span>
                                                    ) : myApplication?.role_id === member.id ? (
                                                        <span className="flex-shrink-0 px-4 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg">Pending</span>
                                                    ) : (
                                                        <ApplicationWrapper project={{id, name: project.name}} role={member} btnStyle={isDev ? "blue" : "white"} />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* ADMIN ACTIONS */}
                    {isOwner && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Admin Actions</h4>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Owner View</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href={`/dashboard/projects/${id}/edit`} className="w-full">
                                    <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Edit Project</button>
                                </Link>
                                <Link href={`/dashboard/projects/${id}/applications`} className="w-full">
                                    <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Review Apps</button>
                                </Link>
                            </div>
                            <button className="w-full mt-2 py-2 border border-red-100 text-red-600 bg-red-50 rounded-lg text-xs font-bold hover:bg-red-100 transition">Close Project</button>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}