"use client";

export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X, Zap, Code, Palette, Megaphone, Trash2, Plus, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
//import { sendProjectCreatedEmail } from "@/app/actions"; // Ensure this import exists

// --- Types ---
type RoleType = "dev" | "design" | "market" | "leader";

interface SquadMember {
  id: string;
  type: RoleType;
  title: string;
  skill: string;
  isFilled: boolean;
}

const IDEAS = [
  { title: "Tinder for Roommates", pitch: "Find the perfect roommate based on sleep schedule.", problem: "Living with strangers is hard.", solution: "An app that matches students based on lifestyle." },
  { title: "Leftover Food Marketplace", pitch: "Connect campus events with extra food to hungry students.", problem: "Food waste vs hungry students.", solution: "Real-time notifications for free food." }
];

export default function StartProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // --- Success State ---
  const [success, setSuccess] = useState(false);
  const [newProjectId, setNewProjectId] = useState("");

  // --- Form State ---
  const [projectName, setProjectName] = useState("");
  const [projectPitch, setProjectPitch] = useState("");
  const [projectProblem, setProjectProblem] = useState("");
  const [projectSolution, setProjectSolution] = useState("");
  const [techStack, setTechStack] = useState("");
  const [limitToStanford, setLimitToStanford] = useState(false);
  
  // --- New Links State ---
  const [discordLink, setDiscordLink] = useState("");
  const [repoLink, setRepoLink] = useState("");

  const [squad, setSquad] = useState<SquadMember[]>([
    { id: "1", type: "leader", title: "Project Leader", skill: "Admin", isFilled: true },
    { id: "2", type: "dev", title: "Developer", skill: "", isFilled: false },
  ]);

  // --- Logic ---
  const sparkIdea = () => {
    const randomIdea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
    setProjectName(randomIdea.title);
    setProjectPitch(randomIdea.pitch);
    setProjectProblem(randomIdea.problem);
    setProjectSolution(randomIdea.solution);
  };

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

  const removeSlot = (id: string) => setSquad((prev) => prev.filter((s) => s.id !== id));

  const updateSkill = (id: string, value: string) => {
    setSquad(squad.map(s => s.id === id ? { ...s, skill: value } : s));
  };

  const handlePublish = async () => {
    if (!projectName || !projectPitch) {
      alert("Please fill in at least the project name and one-liner.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    // Insert and select the ID immediately
    const { data: newProject, error } = await supabase.from("projects").insert({
      owner_id: user.id,
      name: projectName,
      pitch: projectPitch,
      problem: projectProblem,
      solution: projectSolution,
      tech_stack: techStack.split(",").map(s => s.trim()).filter(s => s !== ""),
      squad: squad,
      limit_to_uni: limitToStanford,
      discord_link: discordLink,
      repo_link: repoLink
    }).select().single();

    setLoading(false);

    if (!error && newProject) {
      // Send Email Background
      //sendProjectCreatedEmail(newProject.id, newProject.name);
      
      // Show Success Screen
      setNewProjectId(newProject.id);
      setSuccess(true);
    } else {
      alert("Database Error: " + error?.message);
    }
  };

  // --- SUCCESS VIEW ---
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',_sans-serif]">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-slate-200 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
            <CheckCircle2 size={40} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Project Launched! 🚀</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Your project <strong>"{projectName}"</strong> is now live. Builders can see it on the dashboard and apply to join your squad.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push(`/dashboard/projects/${newProjectId}`)}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition flex items-center justify-center gap-2"
            >
              View Project <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
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
              onClick={handlePublish}
              disabled={loading}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Publish Project"}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN FORM */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Kickstart your idea. 🚀</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Describe what you want to build and who you need.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-12">
          
          {/* SECTION 1 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">The Basics</h2>
              <button type="button" onClick={sparkIdea} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100 transition shadow-sm">
                <Zap className="w-4 h-4 fill-yellow-600" /> Need an idea?
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Project Name</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Campus Event Tracker" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The One-Liner</label>
              <input type="text" value={projectPitch} onChange={(e) => setProjectPitch(e.target.value)} placeholder="A short pitch. What does it do?" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The Problem</label>
                <textarea rows={5} value={projectProblem} onChange={(e) => setProjectProblem(e.target.value)} placeholder="What is broken?" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none shadow-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The Solution</label>
                <textarea rows={5} value={projectSolution} onChange={(e) => setProjectSolution(e.target.value)} placeholder="How do you fix it?" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none shadow-sm"></textarea>
              </div>
            </div>

            {/* LINKS SECTION (ADDED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Discord / Chat Link</label>
                <input type="url" value={discordLink} onChange={(e) => setDiscordLink(e.target.value)} placeholder="https://discord.gg/..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">GitHub / Repo Link</label>
                <input type="url" value={repoLink} onChange={(e) => setRepoLink(e.target.value)} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Tech Stack</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Python..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* SECTION 2 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Squad Builder</h2>
              <p className="text-sm text-slate-500 font-medium">Who do you need to make this happen?</p>
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
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Admin</p>
                    ) : (
                      <input type="text" value={member.skill} onChange={(e) => updateSkill(member.id, e.target.value)} placeholder={member.type === 'design' ? "e.g. Figma" : member.type === 'market' ? "e.g. SEO" : "e.g. React"} className="text-xs font-medium w-full mt-1 border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-transparent pb-0.5" />
                    )}
                  </div>
                  {member.type !== 'leader' && (
                    <button type="button" onClick={() => removeSlot(member.id)} className="text-slate-300 hover:text-red-500 transition px-2">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <button type="button" onClick={() => addSlot('dev')} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition">+ Add Dev</button>
              <button type="button" onClick={() => addSlot('design')} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition">+ Add Design</button>
              <button type="button" onClick={() => addSlot('market')} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition">+ Add Market</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}