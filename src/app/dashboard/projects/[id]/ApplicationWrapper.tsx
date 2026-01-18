"use client";
import { useState } from "react";
import ApplicationModal from "@/components/ApplicationModal";

// Passing color styles to make buttons match the card style (Blue vs Gray)
export default function ApplicationWrapper({ project, role, btnStyle = "blue" }: { project: any, role: any, btnStyle?: "blue" | "white" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition ${
           btnStyle === 'blue' 
           ? 'bg-blue-600 text-white hover:bg-blue-700' 
           : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
        }`}
      >
        Apply
      </button>

      {isOpen && (
        <ApplicationModal 
          project={project} 
          role={role} 
          close={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}