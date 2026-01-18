"use client";
import { useState } from "react";
import { leaveProject } from "@/app/actions";
import { Loader2, LogOut } from "lucide-react";

export default function LeaveSquadWrapper({ projectId, roleId }: { projectId: string, roleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    if (!reason.trim()) return alert("Please provide a reason.");
    
    setLoading(true);
    const res = await leaveProject(projectId, roleId, reason);
    setLoading(false);

    if (res?.success) {
      setIsOpen(false);
      // Optional: Redirect to dashboard or just refresh
      window.location.reload(); 
    } else {
      alert("Error: " + res?.error);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold text-red-400 bg-white border border-red-100 px-2 py-1 rounded hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1"
      >
        <LogOut size={10} /> Leave
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',_sans-serif]">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="p-2 bg-red-50 rounded-full"><LogOut size={20}/></div>
                <h2 className="text-lg font-bold text-slate-900">Step down from squad?</h2>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
              This will remove you from the project immediately. The Admin will see your reason.
            </p>

            <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2">Why are you leaving?</label>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-100 outline-none resize-none"
                    rows={3}
                    placeholder="e.g. Too busy with exams, different direction..."
                ></textarea>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)} 
                className="flex-1 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleLeave} 
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Confirm Leave"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}