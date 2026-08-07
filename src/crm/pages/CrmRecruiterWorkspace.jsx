import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  UserCheck, Calendar, CheckSquare, Target, Award, Sparkles, Clock, 
  Plus, CheckCircle2, MessageSquare, Flame, BookOpen, AlertCircle, Trash2 
} from 'lucide-react';
import { RECRUITER_LEADERBOARD } from '../data/mockCrmData';

export const CrmRecruiterWorkspace = () => {
  const { user, candidates, setAiDrawerOpen, recruiterTasks, addRecruiterTask, removeRecruiterTask, toggleRecruiterTask, recruiterNotes, setRecruiterNotes } = useCrm();

  const [newTaskText, setNewTaskText] = useState('');

  const [attendanceStatus, setAttendanceStatus] = useState('Checked In (Dubai HQ)');

  const toggleTask = (id) => toggleRecruiterTask(id);
  const removeTask = (id) => removeRecruiterTask(id);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText) return;
    addRecruiterTask({ id: Date.now(), text: newTaskText, priority: 'Normal', due: '05:00 PM', completed: false });
    setNewTaskText('');
  };

  const recruiterCandidates = candidates.filter(c => c.assignedRecruiter === user.name || c.assignedRecruiter === 'Fatima Al-Zahra');

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Personal Productivity Desk</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Recruiter Personal Workspace</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back, <strong className="text-slate-900 dark:text-white font-bold">{user.name}</strong>. Manage your daily tasks, target achievements & candidate pipelines.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setAttendanceStatus(attendanceStatus.includes('Checked In') ? 'Checked Out' : 'Checked In (Dubai HQ)')}
            className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{attendanceStatus}</span>
          </button>
          
          <button 
            onClick={() => setAiDrawerOpen(true)}
            className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Target Achievement Gauge & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Monthly Placements Goal</span>
          <p className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">19 / 15</p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">126.6% Target Achieved</p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Revenue Billed (USD)</span>
          <p className="font-serif text-2xl font-extrabold text-amber-700 dark:text-gold-400">$184,000</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Commission Earned: $18,400</p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Assigned Candidates</span>
          <p className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">{recruiterCandidates.length}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Active in Workflow</p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Leaderboard Rank</span>
          <p className="font-serif text-2xl font-extrabold text-amber-700 dark:text-gold-400">#1 Top Headhunter</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Enterprise Wide</p>
        </div>
      </div>

      {/* Main Grid: Tasks + Candidates + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Tasks Checklist & Add Task */}
        <div className="lg:col-span-7 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gold-500" /> Daily Follow-up Tasks Checklist
            </h3>
            <span className="text-xs font-bold text-gold-600 dark:text-gold-400">
              {recruiterTasks.filter(t => t.completed).length} / {recruiterTasks.length} Completed
            </span>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add a new candidate follow-up or client task..."
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-semibold rounded-xl p-2.5 text-xs focus:outline-none focus:border-gold-500"
            />
            <button type="submit" className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
              Add Task
            </button>
          </form>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {recruiterTasks.map(task => (
              <div key={task.id} className="group flex items-start gap-3 p-3 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl hover:border-gold-500/30 transition shadow-sm">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => toggleTask(task.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200 font-semibold'}`}>
                  {task.text}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  task.priority === 'Urgent' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
                  task.priority === 'High' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                  'bg-slate-100 text-slate-600 border-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:border-navy-700'
                }`}>
                  {task.priority}
                </span>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Notes & Notepad */}
        <div className="lg:col-span-5 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-500" />
            Quick Scratchpad Notes
          </h3>
          <textarea 
            rows={8}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-slate-200 font-medium rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-gold-500 font-mono shadow-xs resize-none"
            value={recruiterNotes}
            onChange={(e) => setRecruiterNotes(e.target.value)}
            placeholder="Jot down quick candidate interview thoughts, client salary notes..."
          />
        </div>

      </div>

    </div>
  );
};
