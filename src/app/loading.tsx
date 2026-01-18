"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const QUOTES = [
  "Find your squad. Build your dream.",
  "Shipping is the only thing that matters.",
  "Great ideas need great teams.",
  "Don't build alone. Co-build.",
  "Turning campus projects into startups.",
  "Connecting builders, one commit at a time.",
  "Reviewing applications...",
  "Syncing with the database..."
];

export default function Loading() {
  const [quote, setQuote] = useState("Loading Cobuild...");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Pick Quote
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(random);

    // 2. FORCE the screen to stay for at least 800ms to prevent "flicker"
    // Even if data loads in 100ms, we wait 800ms.
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 800); 

    return () => clearTimeout(timer);
  }, []);

  // If we decided to hide it, return null (allow real content to show)
  // Note: In Next.js loading.tsx, the component automatically unmounts when data is ready.
  // This internal logic is just for visual smoothness if used as a component, 
  // but for the root loading.tsx, Next.js controls the unmount. 
  // The CSS animation is the best way to handle smoothness here.

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 font-['Plus_Jakarta_Sans',_sans-serif]">
      
      {/* 1. Logo Animation */}
      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl animate-bounce mb-8">
        <Zap className="text-white w-8 h-8" fill="currentColor" />
      </div>

      {/* 2. The "Quote" */}
      <h2 className="text-xl font-bold text-slate-900 animate-in fade-in zoom-in-95 duration-500 text-center px-4">
        {quote}
      </h2>

      {/* 3. Subtext */}
      <p className="text-slate-400 text-sm mt-2 font-medium animate-pulse">
        Syncing...
      </p>

    </div>
  );
}