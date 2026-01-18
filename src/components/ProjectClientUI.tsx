"use client";
import { useState } from "react";
import { postComment } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function ProjectClientUI({ 
  overviewContent, 
  discussionContent, 
  projectId 
}: { 
  overviewContent: React.ReactNode; 
  discussionContent: React.ReactNode; 
  projectId: string;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "discussion">("overview");
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if(!comment.trim()) return;
    setPosting(true);
    await postComment(projectId, comment);
    setComment("");
    setPosting(false);
  };

  return (
    <div className="lg:col-span-2 space-y-8">
      {/* TABS */}
      <div className="border-b border-slate-200 flex gap-8">
        <button 
          onClick={() => setActiveTab("overview")} 
          className={`pb-3 border-b-2 text-sm font-bold transition ${activeTab === "overview" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("discussion")} 
          className={`pb-3 border-b-2 text-sm font-bold transition ${activeTab === "discussion" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Discussion
        </button>
      </div>

      {/* CONTENT */}
      <div className={activeTab === "overview" ? "block" : "hidden"}>
        {overviewContent}
      </div>

      <div className={activeTab === "discussion" ? "block space-y-6" : "hidden"}>
        {/* Comment Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">YOU</div>
          <div className="flex-1">
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2} 
              placeholder="Ask a question about this project..." 
              className="w-full bg-slate-50 border-0 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 resize-none outline-none"
            ></textarea>
            <div className="flex justify-end mt-2">
              <button onClick={handlePost} disabled={posting} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition flex items-center gap-2">
                {posting ? <Loader2 className="animate-spin w-3 h-3"/> : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
        {/* Comments List */}
        {discussionContent}
      </div>
    </div>
  );
}