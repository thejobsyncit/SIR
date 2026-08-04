import React from 'react';
import { useCrm } from '../context/CrmContext';
import { UserCheck, Calendar, CheckSquare, Target, Award, Sparkles, Clock } from 'lucide-react';

export const CrmRecruiterWorkspace = () => {
  const { user } = useCrm();

  const dailyTasks = [
    { id: 1, task: 'Conduct HR Screening Interview for Alexander Wright', priority: 'High', due: '11:00 AM' },
    { id: 2, task: 'Submit 3 ICU Nurse Profiles to Saudi German Hospital', priority: 'Medium', due: '02:00 PM' },
    { id: 3, task: 'Follow up on Degree Attestation for Dr. Sarah', priority: 'Urgent', due: '04:30 PM' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Personal Productivity Hub</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Recruiter Personal Workspace</h1>
          <p className="text-slate-400">Welcome back, <strong className="text-white">{user.name}</strong>. Manage your daily tasks, targets, and follow-ups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Tasks */}
        <div className="lg:col-span-2 glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-gold-500" />
            Today's Priority Follow-ups & Tasks
          </h3>

          <div className="space-y-3">
            {dailyTasks.map(t => (
              <div key={t.id} className="p-3.5 bg-navy-950 rounded-xl border border-navy-800 flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">{t.task}</p>
                  <p className="text-[10px] text-slate-400">Due Today by {t.due}</p>
                </div>
                <span className={`px-2 py-1 rounded font-bold text-[10px] ${t.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-gold-500/20 text-gold-400'}`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Target vs Achievement */}
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4 text-center">
          <Target className="w-10 h-10 text-gold-500 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">Monthly Target Performance</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-navy-800 pb-1"><span>Target Placements:</span> <strong className="text-white">15 Placements</strong></div>
            <div className="flex justify-between border-b border-navy-800 pb-1"><span>Achieved to Date:</span> <strong className="text-emerald-400 font-bold">19 Placements</strong></div>
            <div className="flex justify-between border-b border-navy-800 pb-1"><span>Target Commission:</span> <strong className="text-gold-400">$18,400 USD</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
};
