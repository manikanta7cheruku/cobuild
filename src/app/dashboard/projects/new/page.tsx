"use client";

export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X, Zap, Code, Palette, Megaphone, Trash2, Plus } from "lucide-react";

// --- Types ---
type RoleType = "dev" | "design" | "market" | "leader";

interface SquadMember {
  id: string;
  type: RoleType;
  title: string;
  skill: string;
  isFilled: boolean;
}

// --- Idea Spark Data ---
const IDEAS = [
  {
    title: "Tinder for Roommates",
    pitch: "Find the perfect roommate based on sleep schedule.",
    problem: "Living with strangers is hard. People lie about their cleanliness and sleep schedule, leading to conflict later.",
    solution: "An app that matches students based on lifestyle habits: Sleep time, Guest policy, and Social battery level."
  },
  {
    title: "Leftover Food Marketplace",
    pitch: "Connect campus events with extra food to hungry students.",
    problem: "Club events always have leftover pizza that goes to waste, while students in dorms are hungry and broke.",
    solution: "A real-time notification app where clubs post 'Free Pizza at Room 304' and students can claim it."
  }
];

export default function StartProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [projectName, setProjectName] = useState("");
  const [projectPitch, setProjectPitch] = useState("");
  const [projectProblem, setProjectProblem] = useState("");
  const [projectSolution, setProjectSolution] = useState("");
  const [techStack, setTechStack] = useState("");
  const [limitToStanford, setLimitToStanford] = useState(false);

  // --- Squad Builder State ---
  const [squad, setSquad] = useState<SquadMember[]>([
    { id: "1", type: "leader", title: "Project Leader", skill: "Admin", isFilled: true },
    { id: "2", type: "dev", title: "Developer", skill: "", isFilled: false },
  ]);

  // --- Idea Spark Logic ---
  const sparkIdea = () => {
    const randomIdea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
    setProjectName(randomIdea.title);
    setProjectPitch(randomIdea.pitch);
    setProjectProblem(randomIdea.problem);
    setProjectSolution(randomIdea.solution);
  };

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

  const removeSlot = (id: string) => {
    setSquad(squad.filter((s) => s.id !== id || s.type !== "leader"));
  };

  const updateSkill = (id: string, value: string) => {
    setSquad(squad.map(s => s.id === id ? { ...s, skill: value } : s));
  };

  // --- DATABASE PUBLISH LOGIC ---
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

    const { error } = await supabase.from("projects").insert({
      owner_id: user.id,
      name: projectName,
      pitch: projectPitch,
      problem: projectProblem,
      solution: projectSolution,
      tech_stack: techStack.split(",").map(s => s.trim()).filter(s => s !== ""),
      squad: squad,
      limit_to_uni: limitToStanford
    });

    if (!error) {
      router.push("/dashboard?success=true");
      router.refresh();
    } else {
      alert("Database Error: " + error.message);
    }
    setLoading(false);
  };

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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Draft saved</span>
            <button 
              onClick={handlePublish}
              disabled={loading}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Project"}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN FORM CONTAINER */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Kickstart your idea. 🚀</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Describe what you want to build and who you need.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-12">

          {/* SECTION 1: THE BASICS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">The Basics</h2>
              <button type="button" onClick={sparkIdea} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100 transition shadow-sm">
                <Zap className="w-4 h-4 fill-yellow-600" />
                Need an idea?
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Project Name</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Campus Event Tracker" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            {/* One Liner */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The One-Liner</label>
              <input type="text" value={projectPitch} onChange={(e) => setProjectPitch(e.target.value)} placeholder="A short pitch. What does it do?" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
            </div>

            {/* Problem & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The Problem</label>
                <textarea rows={5} value={projectProblem} onChange={(e) => setProjectProblem(e.target.value)} placeholder="What is broken? Why does this need to exist?" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none shadow-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">The Solution</label>
                <textarea rows={5} value={projectSolution} onChange={(e) => setProjectSolution(e.target.value)} placeholder="What are you building to fix it?" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none shadow-sm"></textarea>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Tech Stack (Separate by comma)</label>
              <div className="relative group">
                <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Python, Figma..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm" />
                <div className="absolute right-3 top-3.5 flex gap-1">
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">React</span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Node</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* SECTION 2: THE SQUAD BUILDER */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Squad Builder</h2>
              <p className="text-sm text-slate-500 font-medium">Who do you need to make this happen?</p>
            </div>

            <div className="space-y-3">
              {squad.map((member) => (
                <div key={member.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${member.isFilled ? 'bg-slate-100 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-sm'}`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${member.type === 'leader' ? 'bg-slate-300 text-slate-500' : member.type === 'dev' ? 'bg-blue-50 text-blue-600' : member.type === 'design' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                    {member.type === 'leader' ? "YOU" : member.type === 'dev' ? <Code size={20}/> : member.type === 'design' ? <Palette size={20}/> : <Megaphone size={20}/>}
                  </div>

                  {/* Role Info */}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{member.title}</p>
                    {member.isFilled ? (
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Admin</p>
                    ) : (
                      <input type="text" value={member.skill} onChange={(e) => updateSkill(member.id, e.target.value)} placeholder="e.g. React / Frontend" className="text-xs font-medium w-full mt-1 border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-transparent pb-0.5" />
                    )}
                  </div>

                  {/* Actions */}
                  {member.isFilled ? (
                    <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-widest">Filled</span>
                  ) : (
                    <button type="button" onClick={() => removeSlot(member.id)} className="text-slate-300 hover:text-red-500 transition px-2">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ADD BUTTONS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <button type="button" onClick={() => addSlot('dev')} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition">+ Add Developer</button>
              <button type="button" onClick={() => addSlot('design')} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition">+ Add Designer</button>
              <button type="button" onClick={() => addSlot('market')} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition">+ Add Marketing</button>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* SECTION 3: PRIVACY / UNIVERSITY FILTER */}
          <div 
            onClick={() => setLimitToStanford(!limitToStanford)}
            className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4 cursor-pointer hover:bg-blue-100 transition shadow-sm"
          >
            <div className="mt-1">
              <input type="checkbox" checked={limitToStanford} readOnly className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-blue-900 leading-none">Limit to Stanford University students</p>
              <p className="text-xs text-blue-700/80 mt-2 leading-relaxed font-medium">
                If checked, this project will <strong className="text-blue-900 underline">only</strong> be visible to users with a verified <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-bold text-[11px]">@stanford.edu</code> email address.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}