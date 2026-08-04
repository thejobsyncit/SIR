import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Calendar, Video, Clock, UserCheck, Link, Plus, CheckCircle2 } from 'lucide-react';

export const CrmInterviews = () => {
  const { interviews } = useCrm();

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Video & Panel Scheduling</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Interview Management Center</h1>
          <p className="text-slate-400">Schedule Microsoft Teams, Google Meet & Zoom panel interviews with candidate reminders.</p>
        </div>
        <button className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
          + Schedule New Panel Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interviews.map((item) => (
          <div key={item.id} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-navy-800 pb-3">
              <div>
                <span className="bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded text-[10px]">{item.platform}</span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">{item.candidateName}</h3>
                <p className="text-slate-400 text-[11px]">{item.jobTitle} • {item.clientCompany}</p>
              </div>
              <span className="font-mono text-gold-400 font-bold">{item.id}</span>
            </div>

            <div className="p-3 bg-navy-950 rounded-xl space-y-1.5 text-[11px]">
              <p><strong className="text-slate-400">Date & Time:</strong> <span className="text-white">{item.date} at {item.time}</span></p>
              <p><strong className="text-slate-400">Panel Members:</strong> <span className="text-slate-200">{item.panelists.join(', ')}</span></p>
              <p><strong className="text-slate-400">Feedback:</strong> <span className="text-emerald-400 font-bold">{item.feedback}</span></p>
            </div>

            <a 
              href={item.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-gold-400 font-bold rounded-xl transition flex items-center justify-center space-x-2 border border-navy-800"
            >
              <Video className="w-4 h-4" />
              <span>Launch {item.platform} Meeting Link</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
