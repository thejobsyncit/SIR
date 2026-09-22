const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CandidatePortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const returnStart = content.indexOf('  return (');
const componentEnd = content.lastIndexOf('};');

if (returnStart === -1 || componentEnd === -1) {
  console.error('Could not find boundaries');
  process.exit(1);
}

const beforeReturn = content.slice(0, returnStart);
const afterComponent = content.slice(componentEnd);

const newReturn = `  return (
    <div className="font-serif min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-[#d4af37] selection:text-black">
      
      {/* Modals are kept outside the layout structure so they float correctly */}
      {/* AI RESUME SCREENING REPORT MODAL (Restyled for VIP) */}
      {screeningModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111] border border-[#d4af37]/30 p-6 sm:p-8 rounded-xl max-w-xl w-full space-y-6 shadow-2xl shadow-[#d4af37]/10 text-xs text-slate-300 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[#d4af37] border border-[#d4af37]/50 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-widest">Consultant Review</span>
                <h3 className="text-xl font-serif text-white mt-2">Executive Profile Assessment</h3>
                <p className="text-slate-400 font-medium mt-1">Mandate: {screeningModalApp.jobTitle} • Confidential Client</p>
              </div>
              <button onClick={() => setScreeningModalApp(null)} className="text-slate-500 hover:text-white p-1 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 bg-gradient-to-r from-[#1a1a1a] to-[#111] rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Alignment Score</span>
                <span className="text-3xl font-serif text-[#d4af37]">Top 5% Candidate</span>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Profile aligns with client mandate</p>
              </div>
              <Award className="w-12 h-12 text-[#d4af37]/20" />
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest">Representation Timeline:</h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-[#111] text-[#d4af37] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-[#d4af37]/30 bg-[#1a1a1a] shadow">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-[#d4af37] text-sm">Consultant Review</div>
                    </div>
                    <div className="text-slate-400 text-xs">Your dedicated consultant is mapping your profile against the client's core requirements.</div>
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-[#111] text-slate-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-800 bg-[#111] shadow opacity-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-400 text-sm">Client Presentation</div>
                    </div>
                    <div className="text-slate-500 text-xs">Awaiting green light to present your confidential dossier to the hiring committee.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO INTERVIEW MODAL */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111] border border-[#d4af37]/30 p-6 sm:p-8 rounded-xl max-w-2xl w-full space-y-6 shadow-2xl shadow-[#d4af37]/10 text-xs text-slate-300 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[#d4af37] border border-[#d4af37]/50 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
                <h3 className="text-xl font-serif text-white mt-2">Executive Interview Panel</h3>
                <p className="text-slate-400 font-medium mt-1">Mandate: {interviewModalApp.jobTitle} • Confidential Client</p>
              </div>
              <button onClick={() => { stopCameraStream(); setInterviewModalApp(null); }} className="text-slate-500 hover:text-white p-1 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-2 bg-[#0a0a0a] border border-slate-800 rounded-xl flex flex-col items-center gap-4">
               <div className="w-full h-56 rounded-lg bg-black flex items-center justify-center overflow-hidden relative">
                 {isCameraOff ? (
                   <div className="flex flex-col items-center opacity-50">
                     <VideoOff className="w-10 h-10 text-slate-600 mb-2" />
                     <span className="text-slate-500 tracking-widest uppercase text-[10px]">Camera Off</span>
                   </div>
                 ) : (
                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                 )}
                 {!isCameraOff && (
                   <div className="absolute top-4 left-4 flex items-center gap-2">
                     <span className="flex h-2 w-2 relative">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                     </span>
                     <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-md">LIVE SECURE FEED</span>
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-3 w-full justify-center pb-2">
                 <button onClick={() => setIsMicMuted(!isMicMuted)} className={\`p-3 rounded-full transition \${isMicMuted ? 'bg-red-900/30 text-red-500 border border-red-500/30' : 'bg-[#1a1a1a] text-white border border-slate-700 hover:bg-slate-800'}\`}><Mic className="w-4 h-4" /></button>
                 <button onClick={() => { if (isCameraOff) startCameraStream(); else stopCameraStream(); }} className={\`p-3 rounded-full transition \${isCameraOff ? 'bg-red-900/30 text-red-500 border border-red-500/30' : 'bg-[#1a1a1a] text-white border border-slate-700 hover:bg-slate-800'}\`}><Video className="w-4 h-4" /></button>
               </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:from-[#d4af37] hover:to-[#c5a059] text-black font-bold tracking-widest text-xs uppercase rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#d4af37]/20">
              <Globe className="w-4 h-4" /> Enter Secure Waiting Room
            </button>
          </div>
        </div>
      )}


      {/* Main Layout Switcher */}
      {activeTab === 'browse-jobs' ? (
        
        /* ------------- TOP NAVBAR LAYOUT (Exclusive Mandates) ------------- */
        <div className="min-h-screen bg-[#0a0a0a]">
          <header className="flex items-center justify-between px-6 sm:px-12 py-5 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#c5a059] to-[#d4af37] flex items-center justify-center text-black font-serif text-2xl font-black shadow-lg shadow-[#d4af37]/20">S</div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-wide text-white leading-tight">SIR PREMIER</span>
                <span className="text-[9px] text-[#d4af37] tracking-[0.3em] uppercase font-sans font-bold">Executive Search</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-10 font-sans">
              <button onClick={() => setActiveTab('browse-jobs')} className="font-bold text-xs tracking-widest uppercase text-[#d4af37]">Exclusive Mandates</button>
              <button onClick={() => setActiveTab('dashboard')} className="font-bold text-xs tracking-widest uppercase text-slate-500 hover:text-white transition">My Portfolio</button>
            </nav>
            <div className="flex items-center gap-5 font-sans">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-800 rounded-full">
                <div className="w-5 h-5 rounded-full bg-[#d4af37] text-black flex items-center justify-center font-bold text-[10px]">
                  {user.name ? user.name.charAt(0) : 'V'}
                </div>
                <span className="text-xs font-bold text-slate-300">{user.name ? user.name.split(' ')[0] : 'VIP'}</span>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-white text-xs font-bold tracking-widest uppercase transition flex items-center gap-2">
                 Logout <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          <main className="px-6 sm:px-12 pb-32">
            {/* Hero Section */}
            <div className="max-w-5xl mx-auto text-center mt-20 sm:mt-28 space-y-8">
              <span className="inline-flex items-center gap-2 px-5 py-2 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold font-sans uppercase tracking-[0.2em] bg-[#d4af37]/5">
                <Star className="w-3.5 h-3.5 fill-[#d4af37]" /> Elite Talent Network
              </span>
              <h1 className="text-4xl sm:text-6xl font-serif tracking-wide leading-tight text-white">
                Confidential Mandates for <br/>
                <span className="text-[#d4af37] italic">Exceptional Leaders.</span>
              </h1>
              <p className="text-slate-400 font-sans max-w-2xl mx-auto text-sm leading-relaxed">
                SIR Premier partners with the Middle East's most prestigious organizations. Review our current retained searches tailored for your executive profile.
              </p>
              
              {/* Search Bar - Luxury Styling */}
              <div className="mt-16 bg-[#111] border border-slate-800 p-2 flex flex-col sm:flex-row items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800 max-w-4xl mx-auto font-sans shadow-2xl shadow-black">
                <div className="flex-1 flex items-center gap-3 px-6 py-4 w-full">
                  <Search className="w-4 h-4 text-[#d4af37]" />
                  <input type="text" placeholder="Search mandates by title or sector" value={jobSearch} onChange={e => setJobSearch(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm font-semibold placeholder:text-slate-600 text-white" />
                </div>
                <div className="flex-[0.5] flex items-center gap-3 px-6 py-4 w-full">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  <select value={jobCountryFilter} onChange={e => setJobCountryFilter(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-300 appearance-none cursor-pointer">
                    <option value="All" className="bg-[#111]">All Locations</option>
                    <option value="UAE" className="bg-[#111]">Dubai, UAE</option>
                    <option value="Saudi Arabia" className="bg-[#111]">Riyadh, KSA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Listings - Exclusive Mandates */}
            <div className="max-w-4xl mx-auto mt-24 space-y-6 font-sans">
              {allJobs
                .filter(j => {
                  const matchesSearch = !jobSearch || 
                    j.title.toLowerCase().includes(jobSearch.toLowerCase()) || 
                    j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
                    (j.skills && j.skills.some(s => s.toLowerCase().includes(jobSearch.toLowerCase())));
                  const matchesCountry = jobCountryFilter === 'All' || j.country.toLowerCase().includes(jobCountryFilter.toLowerCase());
                  return matchesSearch && matchesCountry;
                })
                .map(job => {
                  const hasApplied = applications.some(a => a.jobId === job.id);
                  const isSaved = savedJobs.includes(job.id);

                  return (
                    <div key={job.id} className="bg-[#111] border border-slate-800 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition hover:border-[#d4af37]/50 group relative overflow-hidden">
                      {/* Luxury left accent line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4af37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex gap-6 items-start w-full z-10">
                        <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Confidential Client • {job.location || job.country}
                              </p>
                              <h4 className="font-serif text-2xl text-white">{job.title}</h4>
                            </div>
                            <button onClick={() => toggleSaveJob(job.id)} className={\`p-2 transition \${isSaved ? 'text-[#d4af37]' : 'text-slate-600 hover:text-white'}\`}>
                              <Bookmark className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <p className="text-slate-400 text-sm line-clamp-2 pr-8 leading-relaxed">{job.description}</p>

                          <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-500 uppercase tracking-widest font-bold pt-4">
                            <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-[#d4af37]" /> <span>Executive Search</span></div>
                            <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-[#d4af37]" /> <span>{job.salary || 'Highly Competitive'}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-4 md:mt-0 w-full md:w-auto self-stretch md:self-auto items-end md:items-center justify-end shrink-0 z-10">
                        {hasApplied ? (
                          <button className="w-full md:w-auto px-8 py-3.5 border border-[#d4af37]/30 text-[#d4af37] bg-[#d4af37]/5 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-default">
                            <CheckCircle2 className="w-4 h-4" /> Expressed Interest
                          </button>
                        ) : (
                          <button onClick={() => applyForJob(job)} className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:from-[#d4af37] hover:to-[#c5a059] text-black font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-lg shadow-[#d4af37]/20">
                            Express Interest <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </main>
        </div>

      ) : (

        /* ------------- SIDEBAR LAYOUT (VIP Consulting Portal) ------------- */
        <div className="flex h-screen overflow-hidden bg-[#0a0a0a] font-sans">
          {/* Sidebar - Executive Style */}
          <aside className="w-72 bg-[#050505] border-r border-slate-800/50 flex flex-col justify-between py-10 px-6 shrink-0 overflow-y-auto z-40 shadow-2xl">
            <div className="space-y-12">
              {/* Logo */}
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#c5a059] to-[#d4af37] flex items-center justify-center text-black font-serif text-2xl font-black shadow-lg shadow-[#d4af37]/20">S</div>
                <div className="flex flex-col">
                  <span className="font-serif font-black text-lg tracking-widest text-white leading-tight uppercase">SIR Premier</span>
                  <span className="text-[8px] text-slate-500 tracking-[0.4em] uppercase font-bold mt-0.5">Talent Network</span>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1">
                <button onClick={() => setActiveTab('dashboard')} className={\`w-full flex items-center gap-4 px-5 py-4 font-bold text-[11px] tracking-widest uppercase transition border-l-2 \${activeTab === 'dashboard' ? 'border-[#d4af37] text-[#d4af37] bg-gradient-to-r from-[#d4af37]/10 to-transparent' : 'border-transparent text-slate-500 hover:text-slate-300'}\`}>
                  <Globe className="w-4 h-4" /> Portfolio
                </button>
                <button onClick={() => setActiveTab('applications')} className={\`w-full flex items-center gap-4 px-5 py-4 font-bold text-[11px] tracking-widest uppercase transition border-l-2 \${activeTab === 'applications' ? 'border-[#d4af37] text-[#d4af37] bg-gradient-to-r from-[#d4af37]/10 to-transparent' : 'border-transparent text-slate-500 hover:text-slate-300'}\`}>
                  <Briefcase className="w-4 h-4" /> Active Mandates
                </button>
                <button onClick={() => setActiveTab('edit-profile')} className={\`w-full flex items-center gap-4 px-5 py-4 font-bold text-[11px] tracking-widest uppercase transition border-l-2 \${activeTab === 'edit-profile' ? 'border-[#d4af37] text-[#d4af37] bg-gradient-to-r from-[#d4af37]/10 to-transparent' : 'border-transparent text-slate-500 hover:text-slate-300'}\`}>
                  <User className="w-4 h-4" /> Executive Profile
                </button>
                <button onClick={() => setActiveTab('saved')} className={\`w-full flex items-center gap-4 px-5 py-4 font-bold text-[11px] tracking-widest uppercase transition border-l-2 \${activeTab === 'saved' ? 'border-[#d4af37] text-[#d4af37] bg-gradient-to-r from-[#d4af37]/10 to-transparent' : 'border-transparent text-slate-500 hover:text-slate-300'}\`}>
                  <Bookmark className="w-4 h-4" /> Watchlist
                </button>
                <button onClick={() => setActiveTab('browse-jobs')} className="w-full flex items-center gap-4 px-5 py-4 font-bold text-[11px] tracking-widest uppercase transition border-l-2 border-transparent text-slate-500 hover:text-slate-300">
                  <Search className="w-4 h-4" /> Explore Search
                </button>
              </nav>
            </div>

            <div className="space-y-6 pt-10 border-t border-slate-800/50">
              {/* Profile Card Bottom */}
              <div className="flex items-center gap-4 px-3 mb-8">
                {user.avatar ? (
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-[#d4af37]/30" />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-[#d4af37]/30 bg-[#111] flex items-center justify-center text-[#d4af37] font-bold text-lg">{user.name ? user.name[0] : 'V'}</div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest mt-1">VIP Member</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition">
                  Secure Sign Out <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#0a0a0a] to-[#0a0a0a]">
            <div className="p-8 sm:p-14 max-w-6xl mx-auto h-full">
              
              {/* VIP Dashboard View */}
              {activeTab === 'dashboard' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div>
                    <h2 className="text-4xl font-serif text-white tracking-wide">Executive Portfolio</h2>
                    <p className="text-slate-400 font-sans text-sm mt-3 leading-relaxed max-w-2xl">Welcome back to the SIR Premier Network. Your profile is currently active and visible to our senior consulting partners for confidential mandates.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Dedicated Consultant Card */}
                    <div className="bg-[#111] rounded-xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a059] to-[#d4af37]"></div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Your Assigned Partner</p>
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#d4af37]/30 flex items-center justify-center relative">
                          <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random&color=fff" alt="Consultant" className="w-full h-full rounded-full object-cover grayscale opacity-80" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#111] rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-serif text-xl text-white">Sarah Jenkins</h3>
                          <p className="text-xs text-[#d4af37] font-bold mt-1">Senior Partner, MENA</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic mb-6">"I am currently reviewing your dossier against three unadvertised leadership roles in the region. I will be in touch shortly."</p>
                      <button className="w-full py-3 border border-slate-700 text-white font-bold text-[10px] uppercase tracking-widest rounded hover:bg-slate-800 transition">Request Consultation</button>
                    </div>

                    {/* Representation Status */}
                    <div className="lg:col-span-2 bg-[#111] rounded-xl p-8 border border-slate-800 shadow-2xl flex flex-col justify-center relative overflow-hidden">
                       <div className="absolute -right-20 -top-20 opacity-5">
                          <Globe className="w-64 h-64 text-[#d4af37]" />
                       </div>
                       <div className="relative z-10">
                         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Active Representation Status</h3>
                         <div className="flex items-center justify-between relative mb-4">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -z-10 -translate-y-1/2"></div>
                            <div className="absolute top-1/2 left-0 w-1/3 h-0.5 bg-[#d4af37] -z-10 -translate-y-1/2 shadow-[0_0_10px_#d4af37]"></div>
                            
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center justify-center"><Check className="w-3 h-3 text-black" /></div>
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Profiling</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.5)] border-4 border-[#111]"></div>
                              <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Market Mapping</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700"></div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shortlisting</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700"></div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placement</span>
                            </div>
                         </div>
                         <div className="mt-10 p-4 bg-[#1a1a1a] border border-[#d4af37]/20 rounded-lg flex items-start gap-4">
                           <AlertCircle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                           <p className="text-xs text-slate-300 leading-relaxed">Your profile is currently being cross-referenced with confidential retained searches. Ensure your Executive Summary is up to date.</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kanban Applications View (Agency Workflow) */}
              {activeTab === 'applications' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
                  <div>
                    <h2 className="text-4xl font-serif text-white tracking-wide">Active Mandates</h2>
                    <p className="text-slate-400 font-sans text-sm mt-3">Monitor the status of your confidential submissions.</p>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
                    <div className="flex gap-8 min-w-max h-full">
                      {/* Consultant Review Column */}
                      <div className="w-[320px] flex flex-col gap-5">
                        <div className="flex justify-between items-center px-1 border-b border-slate-800 pb-3">
                           <h3 className="font-bold text-slate-300 text-xs tracking-widest uppercase flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> Internal Review</h3>
                           <span className="text-slate-500 text-[10px] font-bold">{applications.length}</span>
                        </div>
                        <div className="flex-1 space-y-4 min-h-[500px]">
                          {applications.map((app, idx) => (
                            <div key={app.id} onClick={() => setScreeningModalApp(app)} className="bg-[#111] p-6 rounded-xl border border-slate-800 hover:border-[#d4af37]/50 transition cursor-pointer relative overflow-hidden group">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700 group-hover:bg-[#d4af37] transition-colors"></div>
                               <div className="flex justify-between items-start mb-4">
                                 <span className="text-[9px] text-[#d4af37] font-bold uppercase tracking-widest border border-[#d4af37]/30 px-2 py-0.5 rounded">Confidential</span>
                               </div>
                               <h4 className="font-serif text-white text-lg leading-tight mb-2">{app.jobTitle}</h4>
                               <p className="text-xs text-slate-500 font-sans">Mandate REF: #SIR-{Math.floor(Math.random() * 9000) + 1000}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Submitted to Client Column */}
                      <div className="w-[320px] flex flex-col gap-5">
                        <div className="flex justify-between items-center px-1 border-b border-slate-800 pb-3">
                           <h3 className="font-bold text-slate-300 text-xs tracking-widest uppercase flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#ff8f00]"></div> Client Presentation</h3>
                           <span className="text-slate-500 text-[10px] font-bold">0</span>
                        </div>
                        <div className="flex-1 bg-[#111]/30 rounded-xl p-4 border border-slate-800/50 border-dashed flex items-center justify-center min-h-[500px]">
                           <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Awaiting Shortlist</span>
                        </div>
                      </div>

                      {/* Client Interview Column */}
                      <div className="w-[320px] flex flex-col gap-5">
                        <div className="flex justify-between items-center px-1 border-b border-slate-800 pb-3">
                           <h3 className="font-bold text-slate-300 text-xs tracking-widest uppercase flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div> Executive Interview</h3>
                           <span className="text-slate-500 text-[10px] font-bold">0</span>
                        </div>
                        <div className="flex-1 bg-[#111]/30 rounded-xl p-4 border border-slate-800/50 border-dashed flex items-center justify-center min-h-[500px]">
                           <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Awaiting Interview</span>
                        </div>
                      </div>

                      {/* Offer Column */}
                      <div className="w-[320px] flex flex-col gap-5">
                        <div className="flex justify-between items-center px-1 border-b border-slate-800 pb-3">
                           <h3 className="font-bold text-slate-300 text-xs tracking-widest uppercase flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div> Offer / Placement</h3>
                           <span className="text-slate-500 text-[10px] font-bold">0</span>
                        </div>
                        <div className="flex-1 bg-[#111]/30 rounded-xl p-4 border border-slate-800/50 border-dashed flex items-center justify-center min-h-[500px]">
                           <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Awaiting Offer</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* VIP Profile Settings */}
              {activeTab === 'edit-profile' && (
                <div className="space-y-10 animate-in fade-in pb-16">
                  <div>
                    <h2 className="text-4xl font-serif text-white tracking-wide">Executive Profile</h2>
                    <p className="text-slate-400 font-sans text-sm mt-3 max-w-2xl leading-relaxed">Ensure your dossier is fully updated. This information is strictly confidential and only presented to clients with your explicit consent.</p>
                  </div>
                  
                  <div className="bg-[#111] p-10 rounded-xl border border-slate-800 shadow-2xl">
                    {editSuccess && (
                      <div className="p-4 mb-8 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded flex items-center gap-3 text-xs uppercase tracking-widest font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Dossier Updated Successfully
                      </div>
                    )}
                    
                    <form onSubmit={handleSaveProfile} className="space-y-12">
                      {/* Avatar Upload */}
                      <div className="flex items-center gap-8">
                        <div className="relative group cursor-pointer">
                          {profileForm.avatar || user.avatar ? (
                            <img src={profileForm.avatar || user.avatar} className="w-28 h-28 rounded-full object-cover border-2 border-[#d4af37]/50 p-1" />
                          ) : (
                            <div className="w-28 h-28 rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-dashed border-slate-700 transition group-hover:border-[#d4af37]">
                              <User className="w-8 h-8 text-slate-500 group-hover:text-[#d4af37] transition" />
                            </div>
                          )}
                          <button type="button" className="absolute bottom-0 right-0 bg-[#d4af37] text-black p-2 rounded-full border-2 border-[#111] shadow-lg hover:scale-110 transition transform">
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h4 className="font-serif text-xl text-white">Professional Portrait</h4>
                          <p className="text-xs text-slate-500 mt-2 font-sans max-w-sm leading-relaxed">Please upload a high-resolution corporate headshot. Essential for board-level presentations.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 font-sans">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Full Legal Name</label>
                          <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded p-4 focus:outline-none focus:border-[#d4af37] text-sm text-white transition" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Private Email Address</label>
                          <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded p-4 focus:outline-none focus:border-[#d4af37] text-sm text-white transition" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Current Executive Title</label>
                          <input type="text" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded p-4 focus:outline-none focus:border-[#d4af37] text-sm text-white transition" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Primary Base (Location)</label>
                          <input type="text" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded p-4 focus:outline-none focus:border-[#d4af37] text-sm text-white transition" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Core Competencies (Comma separated)</label>
                          <div className="bg-[#1a1a1a] border border-slate-800 rounded p-4 focus-within:border-[#d4af37] transition flex flex-wrap gap-3">
                            {profileForm.skillsInput && profileForm.skillsInput.split(',').map((s, idx) => s.trim() ? (
                              <span key={idx} className="bg-[#111] border border-[#d4af37]/30 text-[#d4af37] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm rounded-sm">
                                {s.trim()} <X className="w-3 h-3 cursor-pointer text-[#d4af37]/50 hover:text-[#d4af37] transition" />
                              </span>
                            ) : null)}
                            <input type="text" placeholder="Add competency..." className="flex-1 min-w-[200px] bg-transparent focus:outline-none text-sm text-white p-1" onChange={e => setProfileForm({...profileForm, skillsInput: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <div className="pt-8 flex justify-end border-t border-slate-800">
                        <button type="submit" className="px-10 py-4 bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:from-[#d4af37] hover:to-[#c5a059] text-black font-bold text-[11px] uppercase tracking-widest rounded flex items-center gap-3 transition shadow-lg shadow-[#d4af37]/20">
                          Update Dossier <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Saved Jobs Fallback */}
              {activeTab === 'saved' && (
                <div className="space-y-10 animate-in fade-in">
                  <div>
                    <h2 className="text-4xl font-serif text-white tracking-wide">Watchlist</h2>
                    <p className="text-slate-400 font-sans text-sm mt-3">Mandates you are monitoring.</p>
                  </div>
                  <div className="bg-[#111] p-12 rounded-xl border border-slate-800 shadow-2xl flex flex-col items-center text-center justify-center min-h-[400px]">
                    <Bookmark className="w-16 h-16 text-slate-700 mb-6" />
                    <p className="font-serif text-white text-xl">You are monitoring {savedJobs.length} mandates.</p>
                    <button onClick={() => setActiveTab('browse-jobs')} className="mt-8 px-8 py-3.5 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-bold text-[10px] uppercase tracking-widest rounded transition">View Confidential Searches</button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

      )}
    </div>
  );
`;

const updatedContent = beforeReturn + newReturn + '\n' + afterComponent;
fs.writeFileSync(filePath, updatedContent);
console.log('Successfully updated CandidatePortal.jsx with VIP theme');
