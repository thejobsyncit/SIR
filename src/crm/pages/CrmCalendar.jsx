import React from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video } from 'lucide-react';

export const CrmCalendar = () => {
  const events = [
    { title: 'Alexander Wright MS Teams Panel Interview', time: '02:00 PM GST', type: 'Interview', candidate: 'Alexander Wright' },
    { title: 'MOHRE Visa Quota Review Meeting', time: '04:00 PM GST', type: 'Meeting', candidate: 'N/A' },
    { title: 'Elena Rostova Departure to Singapore', time: '09:30 PM GST', type: 'Travel', candidate: 'Elena Rostova' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Unified Planner</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Master Schedule Calendar</h1>
          <p className="text-slate-400">Interviews, joining dates, visa milestones, and recruiter leaves.</p>
        </div>
      </div>

      <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-white">Scheduled Events for Today</h3>
        <div className="space-y-3">
          {events.map((e, idx) => (
            <div key={idx} className="p-4 bg-navy-950 rounded-xl border border-navy-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-sm">{e.title}</p>
                <p className="text-slate-400 text-xs">{e.time} • Candidate: {e.candidate}</p>
              </div>
              <span className="bg-gold-500/20 text-gold-400 font-bold px-2.5 py-1 rounded text-xs">{e.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
