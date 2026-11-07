import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  CalendarCheck, Clock, CheckCircle2, Calendar, 
  Settings2, RefreshCw, Plus, Trash2, Globe 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerAvailability = () => {
  const [activeDays, setActiveDays] = useState({
    Mon: { enabled: true, slots: ['10:00 AM - 12:00 PM', '03:00 PM - 05:00 PM'] },
    Tue: { enabled: true, slots: ['02:00 PM - 04:00 PM', '05:00 PM - 06:30 PM'] },
    Wed: { enabled: true, slots: ['11:00 AM - 01:00 PM', '03:30 PM - 05:30 PM'] },
    Thu: { enabled: true, slots: ['02:00 PM - 06:00 PM'] },
    Fri: { enabled: true, slots: ['10:00 AM - 12:00 PM'] },
    Sat: { enabled: false, slots: [] }
  });

  const [maxPerDay, setMaxPerDay] = useState(3);
  const [bufferTime, setBufferTime] = useState('15 mins');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleToggleDay = (day) => {
    setActiveDays(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast('✓ Interview availability slots & calendar synchronization saved successfully.');
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #11
              </span>
              <span className="text-[10px] font-mono text-slate-400">PANEL CAPACITY & ROSTER MANAGEMENT</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Availability and Calendar Synchronization
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Configure your interview windows, daily capacity limits, break buffers, and bidirectional calendar synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Google Calendar Connected
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Weekly Open Slots</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">14 Slots</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ 5 Active Days / Week</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Max Capacity / Day</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{maxPerDay} Panels</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Fatigue Protection Active</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Inter-Session Buffer</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{bufferTime}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Rest & Note Writing Window</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Timezone</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">IST (UTC+5:30)</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Auto-converts to candidate zone</span>
          </div>
        </div>

        {/* Weekly Day Schedule Config */}
        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Recurring Weekly Availability Slots</h3>
                <p className="text-[10px] text-slate-400">Placement coordinators will only auto-assign candidate interviews within these slots</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-navy-800 space-y-4">
              {Object.entries(activeDays).map(([day, val]) => (
                <div key={day} className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        val.enabled ? 'bg-gold-500' : 'bg-slate-200 dark:bg-navy-800'
                      }`}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        val.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="font-serif font-bold text-sm text-slate-900 dark:text-white w-24">
                      {day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : 'Saturday'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {val.enabled ? (
                      val.slots.map((slot, si) => (
                        <span key={si} className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-gold-300 border border-amber-200/70 font-mono text-[11px] font-bold">
                          🕒 {slot}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Unavailable / Focused Coding Time</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Threshold Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-navy-800">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Maximum Interviews per Day
                </label>
                <select
                  value={maxPerDay}
                  onChange={e => setMaxPerDay(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value={1}>1 Interview / day</option>
                  <option value={2}>2 Interviews / day</option>
                  <option value={3}>3 Interviews / day (Recommended)</option>
                  <option value={4}>4 Interviews / day</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Buffer Window Between Sessions
                </label>
                <select
                  value={bufferTime}
                  onChange={e => setBufferTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="10 mins">10 Minutes</option>
                  <option value="15 mins">15 Minutes</option>
                  <option value="30 mins">30 Minutes</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-navy-800">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <CalendarCheck className="w-4 h-4" />
                Save Availability Preferences
              </button>
            </div>

          </div>
        </form>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerAvailability;

