import { createClient } from "@/utils/supabase/server";
import EditProfileModal from "@/components/EditProfileModal"; 
import AddPortfolioModal from "@/components/AddPortfolioModal"; 
import Link from "next/link";
import { Globe, Github, Linkedin, Plus, Rocket, Users, Edit2 } from "lucide-react";

// HELPER: Link Logic
const getLinkDetails = (url: string) => {
  if (!url) return null;
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  
  if (url.toLowerCase().includes('github')) 
    return { name: 'GitHub', icon: <Github size={14}/>, url: cleanUrl };
  if (url.toLowerCase().includes('linkedin')) 
    return { name: 'LinkedIn', icon: <Linkedin size={14}/>, url: cleanUrl };
  
  return { name: 'Website', icon: <Globe size={14}/>, url: cleanUrl };
};

export default async function ProfilePage(props: { params: Promise<{ username: string }>; searchParams: Promise<{ edit?: string; add_trophy?: string; edit_trophy?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { username } = params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // 1. Fetch Profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single();
  
  if (!profile) return <div className="p-10 font-bold">User not found</div>;

  // 2. Fetch Projects (Active)
  const { data: allProjects } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  
  // Logic: Leading vs Member
  const leadingProjects = allProjects?.filter(p => p.owner_id === profile.id) || [];
  // For now, simple logic for member projects. (In future, check squad array for user ID)
  const memberProjects = allProjects?.filter(p => p.squad?.some((m: any) => m.id === profile.id || m.email === profile.email)) || [];
  
  const hasActiveProjects = leadingProjects.length > 0 || memberProjects.length > 0;

  // 3. Fetch Portfolio (Trophies)
  const { data: portfolio } = await supabase.from("portfolio_items").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });

  // 4. Permission & Modals
  const isOwner = currentUser?.id === profile.id;
  const showEditModal = isOwner && searchParams.edit === "true";
  const showAddTrophyModal = isOwner && searchParams.add_trophy === "true";
  
  // Handle Edit Trophy Modal
  let trophyToEdit = null;
  if (isOwner && searchParams.edit_trophy) {
    trophyToEdit = portfolio?.find(p => p.id === searchParams.edit_trophy);
  }

  const roleLabel = profile.roles?.[0] ? 
    (profile.roles[0] === 'dev' ? '🛠️ Developer' : 
     profile.roles[0] === 'designer' ? '✨ Designer' : 
     profile.roles[0] === 'product' ? '🚀 Product Manager' : '📈 Marketer') 
    : 'New Builder';

  const link1 = getLinkDetails(profile.primary_link);
  const link2 = getLinkDetails(profile.secondary_link);

  return (
    <div className="bg-slate-50 text-slate-900 pb-24 font-['Plus_Jakarta_Sans',_sans-serif] min-h-screen">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm hover:bg-black transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </Link>
            <span className="text-xs font-bold text-slate-500 hidden md:block">Back to Dashboard</span>
          </div>
          {isOwner && (
            <Link href={`/dashboard/profile/${username}?edit=true`} scroll={false} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition">
              Edit Profile
            </Link>
          )}
        </div>
      </nav>

      {/* MODALS */}
      {showEditModal && <EditProfileModal profile={profile} />}
      {/* Re-use AddPortfolioModal for both Adding and Editing */}
      {(showAddTrophyModal || trophyToEdit) && (
        <AddPortfolioModal username={username} item={trophyToEdit} />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: IDENTITY (No changes here, keeping it clean) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 pb-2 flex items-start gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-slate-100 rounded-full border-2 border-slate-50 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 truncate">{profile.full_name}</h1>
                  <p className="text-xs text-slate-500 font-medium mb-1">@{profile.username}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{profile.university} • '{profile.grad_year || "Student"}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">{roleLabel}</span>
                <span className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700">{profile.experience_level || 'Beginner'}</span>
              </div>

              <div className="px-6 pb-6 pt-2">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.about || "This builder hasn't written a bio yet."}</p>
              </div>

              <div className="border-t border-slate-100"></div>

              <div className="px-6 py-4 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Connect</span>
                <div className="flex flex-wrap gap-2">
                  {link1 ? (
                    <a href={link1.url} target="_blank" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition shadow-sm flex items-center gap-2">
                      {link1.icon} {link1.name}
                    </a>
                  ) : <span className="text-xs text-slate-400 italic">No primary link.</span>}
                  
                  {link2 && (
                    <a href={link2.url} target="_blank" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition shadow-sm flex items-center gap-2">
                      {link2.icon} {link2.name}
                    </a>
                  )}
                </div>
              </div>

              <div className="px-6 py-4">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Expertise</span>
                 <div className="flex flex-wrap gap-2">
                   {profile.skills?.split(',').map((skill: string) => <span key={skill} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold shadow-sm">{skill.trim()}</span>)}
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT: WORK & PROJECTS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-6 border-b border-slate-200"><h2 className="pb-3 text-sm font-bold text-slate-900 border-b-2 border-slate-900">Projects</h2></div>

            {/* 1. ACTIVE PROJECTS */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active</h3>
              
              {hasActiveProjects ? (
                <>
                  {/* Leading Projects (Admin) */}
                  {leadingProjects.map((project: any) => (
                    <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-3 hover:border-purple-300 transition cursor-pointer border-l-4 border-l-purple-500 group">
                        <div className="flex justify-between items-start mb-2">
                            <div><h3 className="text-base font-bold text-slate-900">{project.name}</h3><p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.pitch}</p></div>
                            <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded border border-purple-100">👑 Leader</span>
                        </div>
                        <div className="mt-3 flex justify-end">
                            {/* IF OWNER: Manage Squad */}
                            <span className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg group-hover:bg-black transition">Manage Squad</span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* Member Projects (Joined) */}
                  {memberProjects.map((project: any) => (
                    <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-3 hover:border-blue-300 transition cursor-pointer border-l-4 border-l-blue-500 group">
                        <div className="flex justify-between items-start mb-2">
                            <div><h3 className="text-base font-bold text-slate-900">{project.name}</h3><p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.pitch}</p></div>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-100">🤝 Member</span>
                        </div>
                        <div className="mt-3 flex justify-end">
                            {/* IF MEMBER: View Workspace */}
                            <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg group-hover:bg-slate-50 transition">View Workspace</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                /* EMPTY STATE FOR ACTIVE PROJECTS */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Create Card */}
                    {isOwner && (
                        <Link href="/dashboard/projects/new" className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition group">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition"><Rocket size={20}/></div>
                            <h4 className="text-sm font-bold text-slate-900">Start a Project</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-3">Turn your idea into an MVP.</p>
                            <span className="text-[10px] font-bold text-purple-700 bg-white border border-purple-100 px-3 py-1.5 rounded-lg">Create Project &rarr;</span>
                        </Link>
                    )}
                    {/* Join Card */}
                    <Link href="/dashboard" className={`bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition group ${!isOwner ? 'col-span-2' : ''}`}>
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition"><Users size={20}/></div>
                        <h4 className="text-sm font-bold text-slate-900">Join a Squad</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-3">Find a team and start building.</p>
                        <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-100 px-3 py-1.5 rounded-lg">Explore Projects &rarr;</span>
                    </Link>
                </div>
              )}
            </div>

            {/* 2. TROPHY SHELF */}
            <div className="pt-4">
               <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3v18l7-3.18L19 21V3H5z"/></svg> Trophy Shelf
                  </h2>
                  {isOwner && (
                     <Link href={`/dashboard/profile/${username}?add_trophy=true`} scroll={false} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition flex items-center gap-1">
                        <Plus size={12}/> Add Work
                     </Link>
                  )}
               </div>

               {portfolio && portfolio.length > 0 ? (
                 <div className="space-y-3">
                    {portfolio.map((item: any) => (
                       <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm group relative">
                          {isOwner && (
                              <Link href={`/dashboard/profile/${username}?edit_trophy=${item.id}`} scroll={false} className="absolute top-4 right-4 text-slate-300 hover:text-blue-600 transition">
                                  <Edit2 size={14} />
                              </Link>
                          )}
                          <div className="flex justify-between items-start mb-2 pr-6">
                              <div><h4 className="text-sm font-bold text-slate-900">{item.title}</h4><p className="text-xs text-slate-500 mt-0.5">{item.description}</p></div>
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{item.role}</span>
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-slate-50 mt-2">
                             {item.readme_url && <a href={item.readme_url} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded hover:text-black transition">Readme / Proof</a>}
                             {item.demo_url && <a href={item.demo_url} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded hover:bg-blue-100 transition">Live Demo</a>}
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <p className="text-sm text-slate-500 font-medium italic mb-2">No shipped projects posted yet.</p>
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}