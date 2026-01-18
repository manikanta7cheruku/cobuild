"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function DeleteProjectWrapper({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone. All applications and data will be lost.")) return;
    
    setLoading(true);
    const res = await deleteProject(projectId);
    
    if (res?.success) {
        router.push("/dashboard");
        router.refresh();
    } else {
        alert("Error deleting: " + res?.error);
        setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="w-full mt-2 py-2 border border-red-100 text-red-600 bg-red-50 rounded-lg text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="animate-spin w-3 h-3"/> : "Close Project"}
    </button>
  );
}