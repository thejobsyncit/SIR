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
    <div className="font-sans min-h-screen bg-white dark:bg-navy-950 text-slate-900 dark:text-white">
      
      {/* Modals are kept outside the layout structure so they float correctly */}
      {/* AI RESUME SCREENING REPORT MODAL */}
      {screeningModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-6 shadow-xl text-xs text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="bg-cyan-100 text-cyan-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">ATS Screening Report</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">AI Resume Screening Breakdown</h3>
                <p className="text-slate-600 font-semibold">{screeningModalApp.jobTitle} • {screeningModalApp.company}</p>
              </div>
              <button onClick={() => setScreeningModalApp(null)} className="text-slate-500 hover:text-slate-900 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Compatibility Score</span>
                <span className="text-3xl font-black text-[#08a2c2]">94% Match</span>
                <p className="text-[11px] text-slate-600 font-medium">Keywords aligned with Mandate</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Live 4-Stage Screening Timeline:</h4>
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700">Stage 1: Application</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Completed</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700">Stage 2: AI ATS Analysis</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">94% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO INTERVIEW MODAL */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-xl text-xs text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed Interview
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Video Interview Invitation</h3>
                <p className="text-slate-600 font-semibold">{interviewModalApp.jobTitle} • {interviewModalApp.company}</p>
              </div>
              <button onClick={() => { stopCameraStream(); setInterviewModalApp(null); }} className="text-slate-500 hover:text-slate-900 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-800 rounded-2xl flex flex-col items-center gap-4">
               <div className="w-full h-48 rounded-xl bg-black flex items-center justify-center overflow-hidden">
                 {isCameraOff ? <span className="text-white">Camera Off</span> : <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => setIsMicMuted(!isMicMuted)} className="p-3 bg-slate-700 text-white rounded-xl"><Mic className="w-4 h-4" /></button>
                 <button onClick={() => { if (isCameraOff) startCameraStream(); else stopCameraStream(); }} className="p-3 bg-slate-700 text-white rounded-xl"><Video className="w-4 h-4" /></button>
               </div>
            </div>

            <a href="#" className="w-full py-4 bg-emerald-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2">
              <Globe className="w-5 h-5" /> Join MS Teams Call
            </a>
          </div>
        </div>
      )}


      {/* Main Layout Switcher */}
      {activeTab === 'dashboard' || activeTab === 'browse-jobs' ? (
        
        /* ------------- TOP NAVBAR LAYOUT (Explore Jobs) ------------- */
        <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
          <header className="flex items-center justify-between px-6 sm:px-12 py-4 bg-white dark:bg-navy-950 border-b border-slate-100 dark:border-navy-800 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#08a2c2] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl italic shadow-md">S</div>
              <span className="font-sans font-black text-xl tracking-tight">The JobSync</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => setActiveTab('browse-jobs')} className="font-bold text-sm text-[#08a2c2]">Explore Jobs</button>
              <button onClick={() => setActiveTab('applications')} className="font-bold text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">My Applications</button>
            </nav>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2"><Moon className="w-5 h-5" /></button>
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-navy-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-navy-700">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-bold">{user.name ? user.name.split(' ')[0] : 'User'}</span>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-sm border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </header>

          <main className="px-6 sm:px-12 pb-24">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center mt-12 sm:mt-20 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold shadow-sm uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#08a2c2]" /> The New Standard in Tech Recruitment
              </span>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight">
                Sync Your Skills With <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c6ff] to-[#0072ff]">Your Dream Career</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">
                The jobsync connects elite talent with top-tier companies seamlessly. Discover {allJobs.length}+ opportunities tailored to your expertise.
              </p>
              
              {/* Search Bar matching screenshot */}
              <div className="mt-12 bg-white dark:bg-navy-900 rounded-full border border-slate-200 dark:border-navy-700 shadow-xl shadow-[#08a2c2]/5 p-2 flex flex-col sm:flex-row items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-navy-800 max-w-3xl mx-auto">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Job title, skill, or company" value={jobSearch} onChange={e => setJobSearch(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm font-semibold placeholder:text-slate-400" />
                </div>
                <div className="flex-[0.7] flex items-center gap-3 px-4 py-3 w-full">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <select value={jobCountryFilter} onChange={e => setJobCountryFilter(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm font-semibold">
                    <option value="All">Locality / Area</option>
                    <option value="UAE">UAE</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                  </select>
                </div>
                <div className="flex-[0.7] flex items-center px-4 py-3 w-full">
                  <select className="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-500">
                    <option>All Departments</option>
                  </select>
                </div>
                <button className="w-full sm:w-auto px-8 py-3.5 bg-[#08a2c2] hover:bg-[#0686a0] text-white font-bold rounded-full transition shadow-md whitespace-nowrap m-1">
                  Sync Jobs
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="max-w-4xl mx-auto mt-20 space-y-4">
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
                    <div key={job.id} className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-700 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition hover:shadow-lg">
                      <div className="flex gap-5 items-start w-full">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-navy-950 flex items-center justify-center text-[#08a2c2] text-2xl font-black shrink-0 border border-slate-100 dark:border-navy-800 shadow-sm">
                          {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg leading-tight">{job.title}</h4>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{job.company}</p>
                            </div>
                            <button onClick={() => toggleSaveJob(job.id)} className={\`p-2 rounded-full border transition \${isSaved ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-navy-950 dark:border-navy-800 hover:text-cyan-600'}\`}>
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-slate-500 text-sm line-clamp-2 pr-4">{job.description}</p>

                          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2">
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span>{job.location || job.country}</span></div>
                            <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> <span>{job.salary || 'Competitive'}</span></div>
                            <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> <span>{job.experience || '3+ Years'}</span></div>
                            <div className="flex items-center gap-1.5 text-slate-400"><Clock className="w-3.5 h-3.5" /> <span>Posted {job.postedDate || 'recently'}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-auto self-stretch md:self-auto items-end md:items-center justify-end shrink-0">
                        {hasApplied ? (
                          <button className="w-full md:w-auto px-8 py-3 rounded-full border border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 font-bold text-sm flex items-center justify-center gap-1.5 cursor-default">
                            <CheckCircle2 className="w-4 h-4" /> Applied
                          </button>
                        ) : (
                          <button onClick={() => applyForJob(job)} className="w-full md:w-auto px-8 py-3 rounded-full border border-[#08a2c2] text-white bg-[#08a2c2] hover:bg-[#0686a0] font-bold text-sm flex items-center justify-center gap-1.5 transition shadow-md">
                            <Zap className="w-4 h-4" /> Sync Job
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

        /* ------------- SIDEBAR LAYOUT (My Applications, Profile, etc.) ------------- */
        <div className="flex h-screen overflow-hidden bg-white dark:bg-navy-950">
          {/* Sidebar */}
          <aside className="w-64 bg-white dark:bg-navy-950 border-r border-slate-100 dark:border-navy-800 flex flex-col justify-between py-8 px-5 shrink-0 overflow-y-auto z-40">
            <div className="space-y-10">
              {/* Logo */}
              <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#08a2c2] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl italic shadow-md">S</div>
                <span className="font-sans font-black text-[22px] tracking-tight">The JobSync</span>
              </div>

              {/* Nav Links */}
              <nav className="space-y-2">
                <button onClick={() => setActiveTab('edit-profile')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] transition \${activeTab === 'edit-profile' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-[#08a2c2]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white'}\`}>
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] text-slate-400 cursor-not-allowed">
                  <Globe className="w-4 h-4" /> Portfolio <span className="ml-auto opacity-50"><X className="w-3 h-3"/></span>
                </button>
                <button onClick={() => setActiveTab('saved')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] transition \${activeTab === 'saved' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-[#08a2c2]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white'}\`}>
                  <Bookmark className="w-4 h-4" /> Saved Jobs
                </button>
                <button onClick={() => setActiveTab('applications')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] transition \${activeTab === 'applications' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-[#08a2c2]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white'}\`}>
                  <Briefcase className="w-4 h-4" /> Applications
                </button>
                <button onClick={() => setActiveTab('interviews')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] transition \${activeTab === 'interviews' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-[#08a2c2]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white'}\`}>
                  <Video className="w-4 h-4" /> Interviews
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] text-slate-400 cursor-not-allowed">
                  <Sparkles className="w-4 h-4" /> AI Mock Interview <span className="ml-auto opacity-50"><X className="w-3 h-3"/></span>
                </button>
              </nav>
            </div>

            <div className="space-y-4 pt-8">
              {/* Profile Card Bottom */}
              <div className="flex items-center gap-3 px-2 mb-6">
                {user.avatar ? (
                  <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#08a2c2] flex items-center justify-center text-white font-bold text-lg shadow-sm">{user.name ? user.name[0] : 'U'}</div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-100 dark:border-navy-800 transition">
                  <Moon className="w-4 h-4" /> Dark Mode
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-100 dark:border-navy-800 transition">
                  <Bell className="w-4 h-4" /> Notifications
                </button>
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-rose-50 dark:border-rose-900/30 transition">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#0a1128]">
            <div className="p-8 sm:p-12 max-w-6xl mx-auto">
              
              {activeTab === 'applications' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">My Applications</h2>
                    <p className="text-slate-500 font-medium mt-1">Track the status of all your job applications in real-time.</p>
                  </div>
                  
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-700 rounded-3xl p-8 flex flex-col items-center shadow-sm">
                       <span className="text-5xl font-black text-[#08a2c2] mb-3">{applications.length}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applied</span>
                    </div>
                    <div className="bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-700 rounded-3xl p-8 flex flex-col items-center shadow-sm">
                       <span className="text-5xl font-black text-[#ff8f00] mb-3">{applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Under AI Resume Screening').length}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
                    </div>
                    <div className="bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-700 rounded-3xl p-8 flex flex-col items-center shadow-sm">
                       <span className="text-5xl font-black text-[#03b879] mb-3">{applications.filter(a => a.status === 'Placed').length}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected / Offered</span>
                    </div>
                    <div className="bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-700 rounded-3xl p-8 flex flex-col items-center shadow-sm">
                       <span className="text-5xl font-black text-[#0a66c2] mb-3">{applications.filter(a => a.status === 'Under AI Resume Screening').length}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
                    </div>
                  </div>

                  {/* List of Applications */}
                  <div className="space-y-4">
                     {applications.map((app, idx) => (
                       <div key={app.id} onClick={() => setScreeningModalApp(app)} className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/60 dark:border-navy-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition cursor-pointer">
                         <div className="flex items-center gap-5">
                           <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-sm \${['bg-slate-800', 'bg-blue-800', 'bg-purple-800'][idx % 3]}\`}>
                             {app.company ? app.company[0].toUpperCase() : 'C'}
                           </div>
                           <div>
                             <h4 className="font-bold text-lg leading-tight">{app.jobTitle || 'General Application'}</h4>
                             <p className="text-sm text-slate-500 font-semibold mt-0.5">{app.company || 'Confidential Company'}</p>
                             <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                               <Clock className="w-3.5 h-3.5" /> Applied on {app.appliedDate || 'August 5, 2026'}
                             </div>
                           </div>
                         </div>
                         <button className="px-6 py-2.5 rounded-full border border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-900/10 text-cyan-600 dark:text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                           <Clock className="w-4 h-4" /> Applied
                         </button>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {/* Edit Profile Fallback inside sidebar layout */}
              {activeTab === 'edit-profile' && (
                <div className="space-y-8 animate-in fade-in">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Edit Profile</h2>
                    <p className="text-slate-500 font-medium mt-1">Update your professional details to match with the best opportunities.</p>
                  </div>
                  <div className="bg-white dark:bg-navy-900 p-8 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-sm">
                    {editSuccess && (
                      <div className="p-4 mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Profile Saved Successfully!
                      </div>
                    )}
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">Full Name</label>
                          <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">Email</label>
                          <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">Designation</label>
                          <input type="text" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">Skills (comma separated)</label>
                          <input type="text" value={profileForm.skillsInput} onChange={e => setProfileForm({...profileForm, skillsInput: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                        </div>
                      </div>
                      <button type="submit" className="px-8 py-3.5 bg-[#08a2c2] hover:bg-[#0686a0] text-white font-bold rounded-xl transition shadow-md w-full sm:w-auto">
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Saved Jobs Fallback */}
              {activeTab === 'saved' && (
                <div className="space-y-8 animate-in fade-in">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Saved Jobs</h2>
                    <p className="text-slate-500 font-medium mt-1">Review the {savedJobs.length} opportunities you have bookmarked.</p>
                  </div>
                  <div className="bg-white dark:bg-navy-900 p-8 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col items-center text-center justify-center min-h-[300px]">
                    <Bookmark className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">You have {savedJobs.length} saved jobs</p>
                    <button onClick={() => setActiveTab('browse-jobs')} className="mt-4 px-6 py-3 bg-[#08a2c2] hover:bg-[#0686a0] text-white font-bold rounded-full">Explore More Jobs</button>
                  </div>
                </div>
              )}

              {/* Interviews Fallback */}
              {activeTab === 'interviews' && (
                <div className="space-y-8 animate-in fade-in">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Upcoming Interviews</h2>
                    <p className="text-slate-500 font-medium mt-1">Your scheduled video panel interviews.</p>
                  </div>
                  {applications.filter(a => a.status === 'Interview Scheduled').length > 0 ? (
                    <div className="space-y-4">
                      {applications.filter(a => a.status === 'Interview Scheduled').map(app => (
                        <div key={app.id} className="bg-white dark:bg-navy-900 p-8 rounded-3xl border border-emerald-200 shadow-lg flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Confirmed</span>
                            <h4 className="text-xl font-bold mt-3">{app.jobTitle}</h4>
                            <p className="font-medium text-slate-500 mt-1">{app.company}</p>
                          </div>
                          <button onClick={() => { setInterviewModalApp(app); startCameraStream(); }} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-md flex items-center gap-2 hover:bg-emerald-700">
                            <Video className="w-4 h-4" /> Join Video Call
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-navy-900 p-8 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col items-center text-center justify-center min-h-[300px]">
                      <Video className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">No upcoming interviews</p>
                    </div>
                  )}
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
console.log('Successfully updated CandidatePortal.jsx');
