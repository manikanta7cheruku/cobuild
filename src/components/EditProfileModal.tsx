"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions";

// Change props: We just need the profile data
export default function EditProfileModal({ profile }: { profile: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // ... Keep all your existing state and addSkill/removeSkill logic ...
  // (I am not repeating the whole state block to save space, keep your existing logic)
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    username: profile.username || "",
    university: profile.university || "",
    grad_year: profile.grad_year || "",
    primary_role: profile.roles?.[0] || "developer", // Fixed default to match select value
    experience_level: profile.experience_level || "intermediate",
    availability: profile.availability || "weekend",
    about: profile.about || "",
    primary_link: profile.primary_link || "",
    secondary_link: profile.secondary_link || "",
  });
  
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(
    profile.skills ? profile.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s) : []
  );

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // NEW CLOSE FUNCTION
  const handleClose = () => {
    // This removes the ?edit=true param without reloading the page
    router.push(`/dashboard/profile/${profile.username}`); 
    router.refresh();
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...formData, skills: skills.join(", ") };
    const res = await updateProfile(payload);
    setLoading(false);
    
    if (res?.error) {
      alert("Error: " + res.error);
    } else {
      handleClose(); // Close on success
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar font-['Plus_Jakarta_Sans',_sans-serif]">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="px-6 h-14 flex items-center justify-between">
            <button onClick={handleClose} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Cancel
            </button>
            <h1 className="text-sm font-bold text-slate-900 hidden sm:block">Edit Profile</h1>
            <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition shadow-sm disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </nav>
        {/* ... Keep the rest of your FORM HTML exactly as it was ... */}
         <div className="px-4 md:px-6 py-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

            {/* SECTION 1: IDENTITY */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Identity</h2>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Display Name</label>
                      <input type="text" value={formData.full_name} onChange={e => handleChange("full_name", e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-sm font-medium">@</span>
                        <input type="text" value={formData.username} onChange={e => handleChange("username", e.target.value)} className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">University & Year</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input type="text" value={formData.university} onChange={e => handleChange("university", e.target.value)} placeholder="University" className="col-span-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
                      <input type="text" value={formData.grad_year} onChange={e => handleChange("grad_year", e.target.value)} placeholder="Year" className="col-span-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: VITALS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Vitals & Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Primary Role</label>
                  <select value={formData.primary_role} onChange={e => handleChange("primary_role", e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition">
                    <option value="developer">🛠️ Developer</option>
                    <option value="designer">✨ Designer</option>
                    <option value="product">🚀 Product Manager</option>
                    <option value="marketer">📈 Marketer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Experience</label>
                  <select value={formData.experience_level} onChange={e => handleChange("experience_level", e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition">
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">⭐ Intermediate</option>
                    <option value="advanced">🔥 Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Commitment</label>
                  <select value={formData.availability} onChange={e => handleChange("availability", e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition">
                    <option value="flexible">🌙 Flexible</option>
                    <option value="weekend">⏳ Weekend</option>
                    <option value="dedicated">🚀 Dedicated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: BIO & SKILLS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Details</h2>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">About You</label>
                <textarea value={formData.about} onChange={e => handleChange("about", e.target.value)} rows={4} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Expertise / Tech Stack</label>
                <div className="p-2 border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-600 transition">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1">
                        {skill} <button onClick={() => removeSkill(skill)} className="hover:text-red-500 cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type skill and hit enter..." 
                    className="w-full text-sm outline-none px-1" 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: LINKS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Connect Links</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                   <div className="w-32 flex-shrink-0 flex items-center px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">
                      Primary
                   </div>
                   <input type="text" value={formData.primary_link} onChange={e => handleChange("primary_link", e.target.value)} placeholder="GitHub / LinkedIn" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
                </div>
                <div className="flex gap-2">
                   <div className="w-32 flex-shrink-0 flex items-center px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">
                      Secondary
                   </div>
                   <input type="text" value={formData.secondary_link} onChange={e => handleChange("secondary_link", e.target.value)} placeholder="Portfolio / Website" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}