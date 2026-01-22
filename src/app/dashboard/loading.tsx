export default function DashboardLoading() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans animate-pulse">
      
      {/* 1. Fake Navbar */}
      <nav className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-24 h-6 bg-slate-200 rounded hidden md:block"></div>
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* 2. Fake Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
            <div className="h-6 w-full bg-slate-200 rounded"></div>
            <div className="h-6 w-full bg-slate-200 rounded"></div>
            <div className="h-6 w-full bg-slate-200 rounded"></div>
          </div>
        </aside>

        {/* 3. Fake Project Grid */}
        <main className="flex-1">
          <div className="flex justify-between mb-8">
            <div className="h-8 w-48 bg-slate-200 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-64 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between mb-4">
                    <div className="h-5 w-20 bg-slate-200 rounded"></div>
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 w-full bg-slate-200 rounded mb-1"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                </div>
                <div className="h-8 w-full bg-slate-100 rounded mt-4"></div>
              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}