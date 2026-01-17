"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPortfolioItem, updatePortfolioItem, deletePortfolioItem } from "@/app/actions";
import { Trash2 } from "lucide-react";

interface PortfolioModalProps {
  username: string;
  item?: any; // If item exists, we are in EDIT mode
}

export default function AddPortfolioModal({ username, item }: PortfolioModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!item;

  const handleClose = () => {
    router.push(`/dashboard/profile/${username}`);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (isEdit) {
      res = await updatePortfolioItem(formData, item.id, username);
    } else {
      res = await addPortfolioItem(formData, username);
    }

    setLoading(false);

    if (res?.success) {
      handleClose();
    } else {
      alert("Error: " + res?.error);
    }
  };

  const handleDelete = async () => {
    if(!confirm("Are you sure you want to remove this trophy?")) return;
    setLoading(true);
    await deletePortfolioItem(item.id, username);
    setLoading(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200 font-['Plus_Jakarta_Sans',_sans-serif]">
        
        <div className="flex justify-between items-start mb-1">
            <h2 className="text-xl font-bold text-slate-900">{isEdit ? "Edit Trophy 🏆" : "Add to Trophy Shelf 🏆"}</h2>
            {isEdit && (
                <button onClick={handleDelete} type="button" className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={16}/></button>
            )}
        </div>
        <p className="text-sm text-slate-500 mb-6">Showcase a project you've shipped.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Title</label>
            <input name="title" defaultValue={item?.title} required placeholder="e.g. Campus Food App" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">What did you do?</label>
            <div className="flex gap-2">
               <select name="role" defaultValue={item?.role || "Developer"} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none">
                 <option value="Developer">Developer</option>
                 <option value="Designer">Designer</option>
                 <option value="Founder">Founder</option>
                 <option value="Marketer">Marketer</option>
               </select>
               <input name="description" defaultValue={item?.description} required placeholder="Short one-liner..." className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Proof & Demo</label>
             <div className="space-y-2">
               <input name="readme_url" defaultValue={item?.readme_url} type="url" placeholder="Link to Readme / Repo / Proof (Required)" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
               <input name="demo_url" defaultValue={item?.demo_url} type="url" placeholder="Live Demo Link (Optional)" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition">
              {loading ? "Saving..." : (isEdit ? "Update Trophy" : "Add Trophy")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}