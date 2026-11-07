import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Tag, Star, MessageSquare, CheckSquare, Plus, Clock, 
  Trash2, UserCheck, Sparkles, Filter, Search 
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmCandidateNotesTags = () => {
  const { candidates = [], user } = useCrm();

  const [selectedCandId, setSelectedCandId] = useState(candidates[0]?.id || 'REV-CAN-101');
  const [newTagInput, setNewTagInput] = useState('');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-11-10');
  const [notification, setNotification] = useState('');

  // Local candidate tags state (pre-populated)
  const [candidateTags, setCandidateTags] = useState({
    'REV-CAN-101': ['#ImmediateJoiner', '#GCC-Ready', '#FIDIC-Certified', '#HighPriority'],
    'REV-CAN-102': ['#PrometricPassed', '#ConsultantLevel', '#SaudiEligible'],
    'REV-CAN-103': ['#DevOpsGuru', '#AWS-Certified', '#Singapore-EP-Ready'],
    'REV-CAN-104': ['#5StarLuxury', '#VIPProtocols', '#Immediate']
  });

  // Candidate ratings (1-5 stars)
  const [candidateRatings, setCandidateRatings] = useState({
    'REV-CAN-101': 5,
    'REV-CAN-102': 5,
    'REV-CAN-103': 4,
    'REV-CAN-104': 4
  });

  // Candidate internal notes history
  const [candidateNotes, setCandidateNotes] = useState({
    'REV-CAN-101': [
      { id: 1, text: 'Spoke with Alexander regarding Dubai mega tower project. Notice period confirmed at 30 days. Ready for technical round.', author: 'Kishore Kumar', time: 'Today at 10:45 AM', rating: 5 },
      { id: 2, text: 'Verified educational credentials and UAE civil defense approvals. Verified genuine.', author: 'Fatima Al-Zahra', time: 'Yesterday at 03:20 PM', rating: 5 }
    ],
    'REV-CAN-102': [
      { id: 3, text: 'Cardiologist candidate cleared Saudi MOH verification. Available for Riyadh in-person final round.', author: 'Dr. Rajesh Kannan', time: '2 days ago', rating: 5 }
    ]
  });

  // Follow-up actions per candidate
  const [candidateTasks, setCandidateTasks] = useState({
    'REV-CAN-101': [
      { id: 101, text: 'Call candidate to confirm final salary expectations (AED 25,000 target)', due: '2026-11-08', completed: false, priority: 'High' },
      { id: 102, text: 'Collect updated attested engineering degree copy', due: '2026-11-10', completed: true, priority: 'Normal' }
    ],
    'REV-CAN-102': [
      { id: 103, text: 'Schedule hospital director interview via Zoom', due: '2026-11-09', completed: false, priority: 'Urgent' }
    ]
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandId) || candidates[0] || {
    id: 'REV-CAN-101',
    name: 'Alexander Wright',
    currentRole: 'Senior Civil Project Manager',
    email: 'alexander.wright@gmail.com'
  };

  const currentTags = candidateTags[selectedCandId] || ['#Screened', '#TalentPool'];
  const currentRating = candidateRatings[selectedCandId] || 4;
  const currentNotes = candidateNotes[selectedCandId] || [];
  const currentTasks = candidateTasks[selectedCandId] || [];

  const handleAddTag = (tagToAdd) => {
    const cleanTag = tagToAdd.startsWith('#') ? tagToAdd : `#${tagToAdd}`;
    if (!cleanTag.trim() || currentTags.includes(cleanTag)) return;
    setCandidateTags(prev => ({
      ...prev,
      [selectedCandId]: [...(prev[selectedCandId] || []), cleanTag]
    }));
    setNewTagInput('');
    showToast(`✓ Tag "${cleanTag}" attached to ${selectedCandidate.name}`);
  };

  const handleRemoveTag = (tagToRemove) => {
    setCandidateTags(prev => ({
      ...prev,
      [selectedCandId]: (prev[selectedCandId] || []).filter(t => t !== tagToRemove)
    }));
    showToast(`✓ Tag removed`);
  };

  const handleSetRating = (newRating) => {
    setCandidateRatings(prev => ({
      ...prev,
      [selectedCandId]: newRating
    }));
    showToast(`✓ Rating updated to ${newRating} Stars`);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    const noteObj = {
      id: Date.now(),
      text: newNoteInput.trim(),
      author: user?.name || 'Recruiter',
      time: 'Just now',
      rating: currentRating
    };
    setCandidateNotes(prev => ({
      ...prev,
      [selectedCandId]: [noteObj, ...(prev[selectedCandId] || [])]
    }));
    setNewNoteInput('');
    showToast(`✓ Internal recruiter note recorded`);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const taskObj = {
      id: Date.now(),
      text: newTaskInput.trim(),
      due: taskDueDate || '2026-11-15',
      completed: false,
      priority: 'Normal'
    };
    setCandidateTasks(prev => ({
      ...prev,
      [selectedCandId]: [...(prev[selectedCandId] || []), taskObj]
    }));
    setNewTaskInput('');
    showToast(`✓ Follow-up action scheduled`);
  };

  const toggleTaskCompletion = (taskId) => {
    setCandidateTasks(prev => ({
      ...prev,
      [selectedCandId]: (prev[selectedCandId] || []).map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const quickTagPresets = [
    '#ImmediateJoiner', '#GCC-Ready', '#TopMatch', 
    '#Executive', '#VisaReady', '#SalaryNegotiable', '#PrometricPassed'
  ];

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
              Recruiter Feature #7
            </span>
            <span className="text-xs text-slate-400 font-mono">ASSESSMENT-TAGGING</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Candidate Notes and Tags
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Add internal notes, labels, ratings and follow-up actions.
          </p>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Candidate Selector Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Select Candidate:</span>
            <select
              value={selectedCandId}
              onChange={e => setSelectedCandId(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer text-xs"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.currentRole || 'Candidate'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Candidate Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleSetRating(star)}
                  className="p-1 hover:scale-125 transition cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${star <= currentRating ? 'fill-gold-500 text-gold-500' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              ))}
            </div>
            <span className="font-mono font-bold text-gold-600 dark:text-gold-400 ml-1">({currentRating}/5)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 6 COLS: LABELS & TAGS MANAGEMENT */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tag & Label Management Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gold-500" />
                  <span>Candidate Labels & Skill Badges</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{currentTags.length} Active Tags</span>
              </div>

              {/* Active Tags Pills */}
              <div className="flex flex-wrap gap-2">
                {currentTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 rounded-xl font-bold text-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 font-extrabold cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Tag */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Create custom tag (e.g. #ImmediateOffer)"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-semibold text-xs focus:outline-none focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              {/* Preset Quick Tags */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Preset Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickTagPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddTag(preset)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-Up Action Items Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <span>Scheduled Follow-Up Actions</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{currentTasks.filter(t => !t.completed).length} Pending</span>
              </div>

              {/* Task list */}
              <div className="space-y-2">
                {currentTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      task.completed 
                        ? 'bg-slate-50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800/40 text-slate-400 line-through' 
                        : 'bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="w-4 h-4 rounded text-gold-500 cursor-pointer"
                      />
                      <span className="font-semibold text-xs">{task.text}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {task.due}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                        task.priority === 'Urgent' 
                          ? 'bg-rose-500/20 text-rose-600' 
                          : task.priority === 'High' 
                          ? 'bg-amber-500/20 text-amber-600' 
                          : 'bg-blue-500/20 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule new action form */}
              <form onSubmit={handleAddTask} className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <input
                  type="text"
                  required
                  placeholder="New action item (e.g. Call for salary negotiation, request passport copy)..."
                  value={newTaskInput}
                  onChange={e => setNewTaskInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-semibold text-xs focus:outline-none focus:border-gold-500"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold"
                  />
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    Schedule Action
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT 6 COLS: INTERNAL CANDIDATE NOTES HISTORY */}
          <div className="lg:col-span-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Internal Recruiter Notes & Evaluation Log</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{currentNotes.length} Logged Entries</span>
            </div>

            {/* Add note textarea */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                required
                placeholder={`Record internal notes for ${selectedCandidate.name} (e.g. telephonic screening feedback, client remarks, expected CTC)...`}
                value={newNoteInput}
                onChange={e => setNewNoteInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl font-medium text-xs focus:outline-none focus:border-gold-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  Record Internal Note
                </button>
              </div>
            </form>

            {/* Notes timeline feed */}
            <div className="space-y-3 pt-2">
              {currentNotes.map(n => (
                <div 
                  key={n.id}
                  className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{n.author}</span>
                    <span>{n.time}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
                    {n.text}
                  </p>
                </div>
              ))}

              {currentNotes.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <p>No internal notes recorded yet for this candidate.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </ScrollReveal>
  );
};

