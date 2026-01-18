"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X, Zap, Code, Palette, Megaphone, Trash2, Loader2 } from "lucide-react";

type RoleType = "dev" | "design" | "market" | "leader";

interface SquadMember {
  id: string;
  type: RoleType;
  title: string;
  skill: string;
  isFilled: boolean;
}

// NOTE: params is a Promise in Next.js 16 (Client Component version)
export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() or async logic
  const { id } = use(params); 
  
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Form State ---
  const [projectName, setProjectName] = useState("");
  const [projectPitch, setProjectPitch] = useState("");
  const [projectProblem, setProjectProblem] = useState("");
  const [projectSolution, setProjectSolution] = useState("");
  const [techStack, setTechStack] = useState("");
  const [limitToUni, setLimitToUni] = useState(false);
  const [discordLink, setDiscordLink] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [squad, setSquad] = useState<SquadMember[]>([]);

  // 1. FETCH EXISTING DATA
  useEffect(() => {
    const fetchProject = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return router.push("/login");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Project not found");
        return router.push("/dashboard");
      }

      if (data.owner_id !== user.id) {
        alert("You don't have permission to edit this.");
        return router.push("/dashboard");
      }

      // Pre-fill form
      setProjectName(data.name);
      setProjectPitch(data.pitch);
      setProjectProblem(data.problem || "");
      setProjectSolution(data.solution || "");
      setTechStack(data.tech_stack ? data.tech_stack.join(", ") : "");
      setLimitToUni(data.limit_to_uni);
      setDiscordLink(data.discord_link || "");
      setRepoLink(data.repo_link || "");
      setSquad(data.squad || []);
      setLoading(false);
    };

    fetchProject();
  }, [id, supabase, router]);

  // --- Squad Logic ---
  const addSlot = (type: RoleType) => {
    const titles = { dev: "Developer", design: "Designer", market: "Marketing", leader: "Leader" };
    const newSlot: SquadMember = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: titles[type],
      skill: "",
      isFilled: false,
    };
    setSquad([...squad, newSlot]);
  };

  const removeSlot = (slotId: string) => {
    setSquad(squad.filter(s => s.id !== slotId));
  };

  const updateSkill = (slotId: string, value: string) => {
    setSquad(squad.map(s => s.id === slotId ? { ...s, skill: value } : s));
  };

  // --- UPDATE LOGIC ---
  const handleUpdate = async () => {
    if (!projectName || !projectPitch) {
      alert("Please fill in at least the project name and one-liner.");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("projects").update({
      name: projectName,
      pitch: projectPitch,
      problem: projectProblem,
      solution: projectSolution,
      tech_stack: techStack.split(",").map(s => s.trim()).filter(s => s !== ""),
      squad: squad,
      discord_link: discordLink,
      repo_link: repoLink,
      limit_to_uni: limitToUni
    }).eq("id", id);

    if (!error) {
      router.push(`/dashboard/projects/${id}`);
      router.refresh();
    } else {
      alert("Database Error: " + error.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold">Loading Project...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-10 font-['Plus_Jakarta_Sans',_sans-serif]">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-500">Cancel</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4"/> : "Save Changes"}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN FORM CONTAINER */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Edit Project ✏️</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Update your pitch or manage your squad roles.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-12">

                    {/* SECTION 1: THE BASICS */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">The Basics</h2>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Project Name</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The One-Liner</label>
              <input type="text" value={projectPitch} onChange={(e) => setProjectPitch(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The Problem</label>
                <textarea rows={5} value={projectProblem} onChange={(e) => setProjectProblem(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none shadow-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The Solution</label>
                <textarea rows={5} value={projectSolution} onChange={(e) => setProjectSolution(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none shadow-sm"></textarea>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Tech Stack</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            {/* NEW: WORKSPACE LINKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Discord / Slack Link</label>
                <input type="url" value={discordLink} onChange={(e) => setDiscordLink(e.target.value)} placeholder="https://discord.gg/..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">GitHub Repo Link</label>
                <input type="url" value={repoLink} onChange={(e) => setRepoLink(e.target.value)} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
              </div>
            </div>
          </div>

          {/* SECTION 2: THE SQUAD BUILDER */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Squad Builder</h2>
              <p className="text-sm text-slate-500 font-medium">Add, remove, or update roles.</p>
            </div>

            <div className="space-y-3">
              {squad.map((member) => (
                <div key={member.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${member.isFilled ? 'bg-slate-100 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${member.type === 'leader' ? 'bg-slate-300 text-slate-500' : member.type === 'dev' ? 'bg-blue-50 text-blue-600' : member.type === 'design' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                    {member.type === 'leader' ? "YOU" : member.type === 'dev' ? <Code size={20}/> : member.type === 'design' ? <Palette size={20}/> : <Megaphone size={20}/>}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{member.title}</p>
                    {member.isFilled ? (
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Filled</p>
                    ) : (
                      <input 
                        type="text" 
                        value={member.skill} 
                        onChange={(e) => updateSkill(member.id, e.target.value)} 
                        placeholder={
                          member.type === 'design' ? "e.g. Figma / UI" : 
                          member.type === 'market' ? "e.g. SEO / Growth" : 
                          "e.g. React / Frontend"
                        } 
                        className="text-xs font-medium w-full mt-1 border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-transparent pb-0.5" 
                      />
                    )}
                  </div>

                  {member.isFilled ? (
                    <span className="text-xs font-bold text-slate-400 px-3">FILLED</span>
                  ) : (
                    member.type !== 'leader' && (
                      <button type="button" onClick={() => removeSlot(member.id)} className="text-slate-300 hover:text-red-500 transition px-2">
                        <Trash2 size={20} />
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <button type="button" onClick={() => addSlot('dev')} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition">+ Add Developer</button>
              <button type="button" onClick={() => addSlot('design')} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition">+ Add Designer</button>
              <button type="button" onClick={() => addSlot('market')} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition">+ Add Marketing</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}   