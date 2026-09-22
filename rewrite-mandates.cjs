const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CandidatePortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "{/* Kanban Applications View (Agency Workflow) */}";
const endMarker = "{/* VIP Profile Settings */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find markers");
  process.exit(1);
}

const beforeBlock = content.slice(0, startIndex);
const afterBlock = content.slice(endIndex);

const newBlock = `{/* Active Mandates Timeline View (Executive Portfolio) */}
              {activeTab === 'applications' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
                  <div>
                    <h2 className="text-4xl font-serif text-slate-900 dark:text-white tracking-wide">Active Mandates</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-sans text-sm mt-3">Monitor the status of your confidential submissions.</p>
                  </div>
                  
                  <div className="space-y-8 max-w-4xl">
                    {applications.map((app) => {
                      const stages = ['Internal Review', 'Client Presentation', 'Executive Interview', 'Placement'];
                      
                      // Map the mock 'status' to a step index (1-4)
                      let currentStep = 1;
                      if (app.status.includes('Interview')) currentStep = 3;
                      else if (app.status.includes('Offer') || app.status.includes('Placement')) currentStep = 4;
                      else if (app.status.includes('Shortlist') || app.status.includes('Presentation')) currentStep = 2;

                      return (
                        <div key={app.id} className="bg-white dark:bg-[#111] p-8 sm:p-10 rounded-xl border border-[#d4af37]/20 shadow-xl relative overflow-hidden group">
                          {/* Luxury left accent line */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37]"></div>
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                            <div>
                              <span className="text-[10px] text-[#b89530] dark:text-[#d4af37] font-bold uppercase tracking-[0.2em] mb-3 inline-block bg-[#d4af37]/5 px-3 py-1 rounded border border-[#d4af37]/30">Confidential Client</span>
                              <h3 className="font-serif text-2xl text-slate-900 dark:text-white">{app.jobTitle}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-2">Mandate REF: #SIR-{Math.floor(Math.random() * 9000) + 1000} • {app.country}</p>
                            </div>
                            <button onClick={() => setScreeningModalApp(app)} className="px-6 py-3 border border-[#d4af37]/40 text-[#b89530] dark:text-[#d4af37] hover:bg-[#d4af37]/5 font-bold text-[10px] uppercase tracking-widest rounded transition shrink-0">
                              View Dossier Assessment
                            </button>
                          </div>

                          {/* Horizontal Timeline Tracker */}
                          <div className="relative mt-8 pt-4">
                            {/* Track line */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded z-0"></div>
                            <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#c5a059] to-[#d4af37] -translate-y-1/2 rounded z-0 transition-all duration-1000" style={{ width: \`\${(currentStep - 1) * (100 / 3)}%\` }}></div>
                            
                            <div className="relative z-10 flex justify-between">
                              {stages.map((stage, idx) => {
                                const stepNum = idx + 1;
                                const isCompleted = stepNum < currentStep;
                                const isActive = stepNum === currentStep;
                                const isPending = stepNum > currentStep;

                                return (
                                  <div key={idx} className="flex flex-col items-center gap-4 w-1/4">
                                    <div className={\`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 \${
                                      isCompleted ? 'bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' :
                                      isActive ? 'bg-white dark:bg-[#d4af37] border-4 border-[#d4af37] dark:border-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                                      'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700'
                                    }\`}>
                                      {isCompleted && <Check className="w-3 h-3 text-white dark:text-black" />}
                                    </div>
                                    <span className={\`text-[10px] font-bold uppercase tracking-wider text-center \${
                                      isActive ? 'text-[#b89530] dark:text-[#d4af37]' :
                                      isCompleted ? 'text-slate-900 dark:text-white' :
                                      'text-slate-400 dark:text-slate-500'
                                    }\`}>
                                      {stage}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              `;

fs.writeFileSync(filePath, beforeBlock + newBlock + afterBlock);
console.log('Successfully updated Active Mandates to Timeline View');
