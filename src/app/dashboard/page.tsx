"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  X, 
  Zap, 
  Plus, 
  Star, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  LayoutGrid, 
  ArrowRight,
  Clock,
  Compass
} from "lucide-react";

//export default function DashboardPage() {
  function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // --- UI STATES ---
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [projectsAccordionOpen, setProjectsAccordionOpen] = useState(true); 
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(searchParams.get("success") === "true");

  // --- FILTER & SEARCH STATES ---
  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [lookingFor, setLookingFor] = useState("Any");

  // --- DATA STATES ---
  const [projects, setProjects] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // --- HELPERS ---
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const getOpenSpotsCount = (squad: any[]) => {
    if (!squad) return 0;
    return squad.filter((m: any) => m.type !== 'leader' && !m.isFilled).length;
  };

  // 1. FETCH DATA (Joined with Profiles for Unified Search)
  useEffect(() => {
    async function getData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // Fetch current user's profile
        const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, username")
            .eq("id", authUser.id)
            .single();
        setProfile(profileData);

        // Fetch Projects + Owner Profile Data for Search
        const { data: projData, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles:owner_id (
              full_name,
              username
            )
          `)
          .order("created_at", { ascending: false });
        
        // Fetch User Favorites
        const { data: favData } = await supabase
          .from("favorites")
          .select("project_id")
          .eq("user_id", authUser.id);

        if (projData) setProjects(projData);
        if (favData) setFavorites(favData.map(f => f.project_id));
      }
      setLoading(false);
    }
    getData();
  }, [supabase]);

  // 2. SEARCH & FILTER LOGIC
  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    
    // A. Unified Search (Project Name, Pitch, Full Name, Username)
    const matchesSearch = p.name.toLowerCase().includes(q) || 
                          p.pitch.toLowerCase().includes(q) ||
                          p.profiles?.full_name?.toLowerCase().includes(q) ||
                          p.profiles?.username?.toLowerCase().includes(q);

    // B. Stage Sidebar Filter
    const matchesStage = activeFilter === "All Projects" ||
                         (activeFilter === "Favorites" && favorites.includes(p.id)) ||
                         (activeFilter === "Idea Phase" && !p.limit_to_uni) ||
                         (activeFilter === "Leading" && p.owner_id === user?.id);

    // C. Looking For Filter
    const matchesLookingFor = lookingFor === "Any" || 
                              p.squad?.some((m: any) => m.title === lookingFor && !m.isFilled);

    return matchesSearch && matchesStage && matchesLookingFor;
  });

  // 3. UI HANDLERS
  const toggleMobileFilters = () => setMobileFiltersOpen(!mobileFiltersOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleMyProjects = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectsAccordionOpen(!projectsAccordionOpen);
  };
  const goToStartProject = () => {
    setUserMenuOpen(false);
    router.push("/dashboard/projects/new");
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleFavorite = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!user) return;
    if (favorites.includes(projectId)) {
      setFavorites(favorites.filter(id => id !== projectId));
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("project_id", projectId);
    } else {
      setFavorites([...favorites, projectId]);
      await supabase.from("favorites").insert({ user_id: user.id, project_id: projectId });
    }
  };

  // Close notice
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-24 md:pb-0 font-['Plus_Jakarta_Sans',_sans-serif]">
      
      {/* ========================= */}
      {/* NAVBAR                    */}
      {/* ========================= */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between text-left">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setActiveFilter("All Projects"); setSearchQuery("");}}>
            <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 hidden md:block">Cobuild</span>
          </div>

          {/* SEARCH BAR (Unified: Projects + Profiles) */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><Search size={18} /></span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, builders, or usernames..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-inner" 
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition cursor-pointer">
                <Bell size={20} className="md:w-6 md:h-6" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <button onClick={goToStartProject} className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-bold shadow-md transform active:scale-95 transition cursor-pointer">
                <Plus size={16} /> Start Project
            </button>
            
            {/* USER MENU */}
            <div ref={userMenuRef} className="relative border-l border-slate-200 pl-3 md:pl-6">
                <button onClick={toggleUserMenu} className="flex items-center focus:outline-none cursor-pointer">
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white border-2 border-white shadow-sm hover:shadow-md transition">
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                </button>

                {userMenuOpen && (
                    <div className="absolute right-0 top-11 md:top-12 w-64 md:w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform origin-top-right transition-all z-50">
                        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
                            {/* Header */}
                            <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 text-left">
                                <p className="text-[15px] font-bold text-slate-900 leading-tight">{displayName}</p>
                                <p className="text-[11px] text-slate-400 truncate font-medium">{user?.email}</p>
                            </div>

                            <button className="w-full flex items-center gap-3 px-5 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer">
                                <User size={18} className="text-slate-400" /> View Profile
                            </button>

                            <div className="border-t border-slate-50"></div>

                            {/* Section: My Projects (Simplified) */}
                            <div>
                                <button onClick={toggleMyProjects} className="w-full flex items-center justify-between px-5 py-3 text-[13px] font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Briefcase size={16} className="text-blue-600" /> My Projects
                                    </div>
                                    {projectsAccordionOpen ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
                                </button>

                                {projectsAccordionOpen && (
                                    <div className="bg-[#F8FAFC] pb-3 px-5 space-y-4 animate-in fade-in duration-200">
                                        {/* LEADING */}
                                        <div className="pt-2 text-left">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Leading</p>
                                            {projects.filter(p => p.owner_id === user?.id).length > 0 ? (
                                                projects.filter(p => p.owner_id === user?.id).map(p => (
                                                    <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm mb-2 group">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[13px] font-bold text-slate-800 truncate">{p.name}</span>
                                                            <span className="text-[9px] bg-red-50 text-red-500 px-1.5 rounded-full font-bold">OWNER</span>
                                                        </div>
                                                        <button onClick={() => {setActiveFilter("Leading"); setUserMenuOpen(false);}} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Manage Squad & Status →</button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-1">
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">Ready to lead? Create your idea.</p>
                                                    <button onClick={goToStartProject} className="text-[11px] text-blue-600 font-bold mt-1 hover:underline">+ Start a Project</button>
                                                </div>
                                            )}
                                        </div>
                                        {/* MEMBER OF */}
                                        <div className="text-left pb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Member Of</p>
                                            <p className="text-[11px] text-slate-500 font-medium italic">Find your next squad. Join a project.</p>
                                            <button onClick={() => {setActiveFilter("All Projects"); setUserMenuOpen(false);}} className="text-[11px] text-blue-600 font-bold mt-1 hover:underline">Explore Projects →</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-50" />

                            <div className="py-1">
                                <button className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer text-left"><Settings size={18} className="text-slate-400"/> Account Settings</button>
                                <button className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer text-left"><HelpCircle size={18} className="text-slate-400"/> Help & Feedback</button>
                            </div>

                            <div className="border-t border-slate-50" />
                            
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-[13px] font-bold text-red-600 hover:bg-red-50 transition text-left cursor-pointer">
                                <LogOut size={18} /> Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* MOBILE BAR (COMPACT) */}
        <div className="md:hidden px-4 py-2 border-t border-slate-100 bg-white">
            <div className="flex gap-2 text-left">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-slate-400"><Search size={14} /></span>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none" />
                </div>
                <button onClick={toggleMobileFilters} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 cursor-pointer shadow-sm active:bg-slate-50 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </button>
            </div>
        </div>

        {/* MOBILE FILTERS DRAWER (SCROLLABLE) */}
        <div className={`md:hidden bg-slate-50 border-b border-slate-200 overflow-y-auto transition-all duration-300 ${mobileFiltersOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 space-y-6 text-left">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Project Stage</h3>
                    <div className="flex flex-wrap gap-2">
                        {["All Projects", "Idea Phase", "Favorites"].map(f => (
                           <button key={f} onClick={() => {setActiveFilter(f); setMobileFiltersOpen(false)}} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${activeFilter === f ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white border-slate-200'}`}>{f}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Looking For</h3>
                    <div className="flex flex-wrap gap-2">
                        {["Any", "Developer", "Designer", "Marketing"].map(r => (
                           <button key={r} onClick={() => {setLookingFor(r); setMobileFiltersOpen(false)}} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${lookingFor === r ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white border-slate-200'}`}>{r}</button>
                        ))}
                    </div>
                </div>
                <button onClick={toggleMobileFilters} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer">Apply Filters</button>
            </div>
        </div>
      </nav>

      {/* ========================= */}
      {/* MAIN LAYOUT AREA          */}
      {/* ========================= */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR (Desktop Filters) */}
        <aside className="hidden md:block w-60 flex-shrink-0 text-left">
            <div className="sticky top-24 space-y-8">
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-5">Project Stage</h3>
                    <div className="space-y-3">
                        {["All Projects", "Idea Phase", "Leading", "Favorites"].map((stage) => (
                          <label key={stage} className="flex items-center gap-3 cursor-pointer group">
                              <input type="radio" name="stage" checked={activeFilter === stage} onChange={() => setActiveFilter(stage)} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              <span className={`text-[14px] font-semibold ${activeFilter === stage ? 'text-blue-600' : 'text-slate-500'} group-hover:text-slate-900 transition`}>{stage}</span>
                          </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-5">Looking For</h3>
                    <div className="space-y-3">
                        {["Any", "Developer", "Designer", "Marketing"].map((role) => (
                          <label key={role} className="flex items-center gap-3 cursor-pointer group">
                              <input type="radio" name="looking" checked={lookingFor === role} onChange={() => setLookingFor(role)} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              <span className={`text-[14px] font-semibold ${lookingFor === role ? 'text-blue-600' : 'text-slate-500'} group-hover:text-slate-900 transition`}>{role}</span>
                          </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>

        {/* FEED AREA */}
        <main className="flex-1 text-left">

          {/* SUCCESS BANNER */}
          {visible && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 p-3 md:p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">✓</div>
                <p className="text-[13px] md:text-sm font-bold text-emerald-900">Project published successfully!</p>
              </div>
              <button onClick={() => setVisible(false)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer transition p-1"><X size={18}/></button>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{activeFilter}</h1>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 hidden md:block tracking-widest uppercase">Sort by:</span>
                <select className="bg-white border border-slate-200 text-[11px] md:text-xs rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-slate-100 transition shadow-sm">
                    <option>Newest First</option>
                    <option>Most Popular</option>
                </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-bold text-slate-400 animate-pulse text-xs tracking-widest uppercase italic">Gathering Data...</div>
          ) : filteredProjects.length > 0 ? (
            /* PROJECT LIST (DYNAMIC) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 pb-20">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition duration-300 cursor-pointer group flex flex-col h-full shadow-sm">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${project.limit_to_uni ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        {project.limit_to_uni ? "Campus Only" : "Idea Phase"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium tracking-tight flex items-center gap-1"><Clock size={10} /> {getRelativeTime(project.created_at)}</span>
                    </div>
                    <button 
                      onClick={(e) => toggleFavorite(e, project.id)}
                      className={`transition-all transform active:scale-125 cursor-pointer ${favorites.includes(project.id) ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
                    >
                      <Star size={18} fill={favorites.includes(project.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <div className="mb-auto">
                    <h2 className="text-[17px] md:text-[18px] font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition tracking-tight">{project.name}</h2>
                    <p className="text-[13px] md:text-[14px] text-slate-500 mb-5 line-clamp-2 leading-relaxed font-medium">{project.pitch}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech_stack?.map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-tight transition-colors group-hover:bg-blue-50">#{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                        {project.owner_id === user?.id ? "YOU" : (project.profiles?.full_name?.substring(0,2).toUpperCase() || "MK")}
                      </div> 
                      <span className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">Lead</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-green-700 tracking-tight">{getOpenSpotsCount(project.squad)} spots open</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 md:p-24 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-8 shadow-xl">
                    <Plus size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-tight font-sans">No projects found</h2>
                <p className="text-slate-500 max-w-sm mb-10 text-[14px] md:text-[16px] font-medium leading-relaxed font-sans">Try searching for something else or start your own idea to find the perfect teammates.</p>
                <button onClick={goToStartProject} className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg transition active:scale-95 cursor-pointer font-sans tracking-tight">
                  Start your first project
                </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button onClick={goToStartProject} className="bg-slate-900 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center active:scale-105 transition shadow-blue-900/30 cursor-pointer">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}


//suspense boundary for searchparams
// This is the new default export that wraps your UI in a Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">
        Loading Cobuild...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}