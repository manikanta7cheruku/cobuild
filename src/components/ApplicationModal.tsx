"use client";
import { useState } from "react";
import { applyToProject } from "@/app/actions";
import { Loader2, X } from "lucide-react";

interface Props {
  project: { id: string; name: string };
  role: { id: string; title: string };
  close: () => void;
}

export default function ApplicationModal({ project, role, close }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await applyToProject(project.id, role.id, role.title, formData);
    setLoading(false);

    if (res?.success) {
      alert("Application sent! Good luck. 🚀");
      close();
    } else {
      alert("Error: " + res?.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div onClick={close} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
      
      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-screen px-4 font-['Plus_Jakarta_Sans',_sans-serif]">
        <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>

          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Application</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{role.title}</h2>
            <p className="text-sm text-slate-500">Applying to join <span className="font-bold text-slate-700">{project.name}</span></p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">Why are you a good fit?</label>
              <textarea name="note" required rows={3} placeholder="I have experience with React and I love AI projects because..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"></textarea>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio / GitHub Link</label>
              <input name="portfolio_link" required type="url" placeholder="https://github.com/username" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Weekly Availability</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <input type="radio" name="availability" value="5-10 hrs" required className="text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-600">5-10 hrs</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <input type="radio" name="availability" value="10+ hrs" required className="text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-600">10+ hrs</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={close} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition transform active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Send Request"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}