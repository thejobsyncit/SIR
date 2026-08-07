import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, Plus, Filter, X, CheckCircle2, Trash2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const CrmCalendar = () => {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent } = useCrm();
  const [filterType, setFilterType] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);


  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '10:00 AM GST',
    type: 'Interview',
    candidate: '',
    date: '2026-08-12'
  });

  const filteredEvents = calendarEvents.filter(e => filterType === 'All' || e.type === filterType);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    addCalendarEvent(newEvent);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Unified Executive Planner</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Master Schedule & Event Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400">Interviews, joining dates, visa milestones, client meetings, and recruiter leaves.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Calendar Event</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-wrap gap-2 items-center shadow-sm">
        <span className="font-bold text-slate-800 dark:text-slate-200 mr-2 text-xs">Filter Calendar View:</span>
        {['All', 'Interview', 'Meeting', 'Joining', 'Travel'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition ${
              filterType === type 
                ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold' 
                : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gold-600 dark:text-gold-500" />
          Scheduled Calendar Events
        </h3>

        <div className="space-y-3">
          {filteredEvents.map((e) => (
            <div key={e.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center hover:border-gold-500/50 transition shadow-sm">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{e.title}</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                  {e.date} at {e.time} • Candidate: <strong className="text-slate-900 dark:text-white font-bold">{e.candidate}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 border border-amber-300 dark:border-gold-500/30 font-bold px-3 py-1 rounded-full text-xs uppercase shadow-xs">
                  {e.type}
                </span>
                <button
                  onClick={() => removeCalendarEvent(e.id)}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer p-1"
                  title="Remove Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Add Master Calendar Event</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                  <input required type="text" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Candidate (Optional)</label>
                  <input type="text" value={newEvent.candidate} onChange={e=>setNewEvent({...newEvent, candidate: e.target.value})} placeholder="e.g. Kishore" className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Event Category</label>
                  <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500">
                    <option value="Interview">Interview</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Joining">Joining</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Date & Time</label>
                  <input required type="text" value={newEvent.date} onChange={e=>setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                Save Event to Master Calendar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
