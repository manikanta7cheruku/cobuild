"use client";
import { useState } from "react";
import { manageApplication, removeMember } from "@/app/actions";
import { Loader2, ArrowLeft, Check, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReviewAppsClient({ 
  applications, 
  project 
}: { 
  applications: any[]; 
  project: any; 
}) {
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Remove Modal State
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");

  const router = useRouter();

  // Helper for mobile view toggling
  const openDetail = (app: any) => setSelectedApp(app);
  const closeDetail = () => setSelectedApp(null);

  const handleDecision = async (status: 'accepted' | 'declined') => {
    if (!selectedApp) return;
    // Basic confirm for safety
    if (!confirm(`Are you sure you want to ${status} this applicant?`)) return;

    setLoading(true);
    
    const res = await manageApplication(
      selectedApp.id, 
      project.id, 
      status, 
      selectedApp.role_id,
      selectedApp.profiles 
    );

    setLoading(false);

    if (res?.success) {
      // Don't close immediately, update local state or just refresh
      alert(`Applicant ${status}!`);
      setSelectedApp(null); 
      router.refresh(); 
    } else {
      alert("Error: " + res?.error);
    }
  };

  const handleRemove = async () => {
    if (!selectedApp) return;
    setLoading(true);
    // Call Server Action
    const res = await removeMember(selectedApp.id, project.id, selectedApp.role_id, removeReason);
    setLoading(false);
    
    if (res?.success) {
        setShowRemoveModal(false);
        setRemoveReason("");
        alert("Member removed from squad.");
        setSelectedApp(null);
        router.refresh();
    } else {
        alert("Error removing member: " + res?.error);
    }
  };

  // Filter apps? For now show all so we can see Accepted ones too.
  // We sort them so Pending is at top.
    // Filter apps? For now show all so we can see Accepted ones too.
  const sortedApps = [...applications].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto md:px-6 py-0 md:py-6 flex flex-col md:flex-row gap-6 overflow-hidden relative h-[calc(100vh-120px)]">

      {/* LEFT SIDEBAR: LIST */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col bg-slate-50 md:bg-transparent h-full ${selectedApp ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-0 overflow-y-auto no-scrollbar space-y-3 pb-24">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider md:mb-1 px-1">Applicants ({sortedApps.length})</h2>
          
          {sortedApps.length === 0 && (
             <div className="p-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">No applications yet.</div>
          )}

          {sortedApps.map((app) => (
            <div 
              key={app.id} 
              onClick={() => openDetail(app)} 
              className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition relative ${selectedApp?.id === app.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.profiles.username}`} alt="Avatar"/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{app.profiles.full_name}</h3>
                  <p className="text-xs text-slate-500">@{app.profiles.username}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{app.role_title}</span>
                {app.status === 'accepted' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Joined</span>}
                {app.status === 'declined' && <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded">Passed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN: DETAIL VIEW */}
      {selectedApp ? (
        <div className="fixed inset-0 md:static z-50 md:z-auto bg-white md:rounded-2xl border-l md:border border-slate-200 shadow-sm flex flex-col h-full w-full">
            
            {/* MOBILE HEADER */}
            <div className="md:hidden flex-shrink-0 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between">
                <button onClick={closeDetail} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-sm font-bold">
                    <ArrowLeft size={18} /> Back
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant</span>
            </div>

            {/* HEADER */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApp.profiles.username}`} className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">{selectedApp.profiles.full_name}</h2>
                        <p className="text-sm text-slate-500 font-medium mb-2">@{selectedApp.profiles.username} • <span>{selectedApp.profiles.university}</span></p>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold border border-blue-200">{selectedApp.role_title}</span>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Pitch</h3>
                    <div className="relative pl-6 border-l-2 border-slate-200 italic text-slate-700 leading-relaxed text-sm md:text-base">
                        "{selectedApp.note}"
                    </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Details</h3>
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-xs font-medium text-green-700 bg-white px-2 py-1 rounded border border-green-200">Availability: {selectedApp.availability || "Unknown"}</span>
                        <span className="text-xs font-medium text-green-700 bg-white px-2 py-1 rounded border border-green-200">Exp: {selectedApp.profiles.experience_level || "N/A"}</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Proof of Work</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href={`/dashboard/profile/${selectedApp.profiles.username}`} target="_blank" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-300 transition">View Profile</Link>
                        {selectedApp.portfolio_link && (
                          <a href={selectedApp.portfolio_link} target="_blank" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-300 transition">View Portfolio Link</a>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex-shrink-0 p-4 md:p-6 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex gap-4">
                
                {selectedApp.status === 'accepted' ? (
                    // ALREADY ACCEPTED STATE
                    <div className="w-full flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-xl">
                         <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                             <CheckCircle2 size={18} />
                             <span>Already on the Squad</span>
                         </div>
                         <button 
                            onClick={() => setShowRemoveModal(true)}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 text-xs transition"
                         >
                            Remove from Squad
                         </button>
                    </div>
                ) : (
                    // PENDING STATE
                    <>
                        <button onClick={() => handleDecision('declined')} disabled={loading} className="flex-1 py-3.5 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition text-sm flex items-center justify-center gap-2">
                            <X size={18}/> Pass
                        </button>
                        <button onClick={() => handleDecision('accepted')} disabled={loading} className="flex-[2] py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-lg transition flex items-center justify-center gap-2 text-sm">
                            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Check size={18} className="text-green-400"/> Accept to Squad</>}
                        </button>
                    </>
                )}
            </div>
        </div>
      ) : (
        /* EMPTY STATE (Desktop) */
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-bold">
            Select an applicant to review details.
        </div>
      )}

      {/* REMOVE MODAL */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Remove Applicant?</h2>
                <p className="text-sm text-slate-500 mb-4">This will remove them from the squad list and open the slot again for new applicants.</p>
                
                <label className="block text-xs font-bold text-slate-700 mb-2">Reason (Optional)</label>
                <textarea 
                    value={removeReason} 
                    onChange={(e) => setRemoveReason(e.target.value)}
                    placeholder="e.g. Changed direction..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-red-100"
                />
                
                <div className="flex gap-3">
                    <button onClick={() => setShowRemoveModal(false)} className="flex-1 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                    <button onClick={handleRemove} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex justify-center gap-2">
                       {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Confirm Remove"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}