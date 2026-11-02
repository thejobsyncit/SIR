import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, MapPin, UserCheck, Plus, CheckCircle2,
  AlertCircle, X, ExternalLink, RefreshCw
} from 'lucide-react';
import { CLIENT_PORTAL_SERVICES_CATALOG } from '../../data/clientPortalWorkflows';

export const ClientAppointmentsManager = ({
  appointments = [],
  services = [],
  token,
  onBookAppointment,
  onUpdateAppointment,
  initialPreselectedService = null
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookModalOpen, setBookModalOpen] = useState(Boolean(initialPreselectedService));
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([
    'Morning (09:00 AM - 10:00 AM)',
    'Morning (10:00 AM - 11:00 AM)',
    'Late Morning (11:30 AM - 12:30 PM)',
    'Afternoon (02:00 PM - 03:00 PM)',
    'Afternoon (03:30 PM - 04:30 PM)',
    'Evening (05:00 PM - 06:00 PM)'
  ]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [form, setForm] = useState({
    enquiryId: initialPreselectedService?.id || (services[0]?.id || ''),
    serviceId: initialPreselectedService?.serviceId || (services[0]?.serviceId || 'intl-consult'),
    appointmentDate: tomorrow,
    appointmentTime: 'Morning (10:00 AM - 11:00 AM)',
    consultationMode: 'Online Video (Google Meet / Zoom)',
    notes: ''
  });

  // Check real consultant availability whenever date changes
  useEffect(() => {
    const targetDate = rescheduleTarget ? rescheduleTarget.appointmentDate : form.appointmentDate;
    if (!targetDate || !token) return;

    fetch(`/api/client-portal/appointments/availability?date=${encodeURIComponent(targetDate)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setAvailableSlots(data.availableSlots || []);
          setBookedSlots(data.bookedSlots || []);
        }
      })
      .catch(() => {});
  }, [form.appointmentDate, rescheduleTarget?.appointmentDate, token]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const matchedEnq = services.find((s) => s.id === form.enquiryId);
      const matchedCat = CLIENT_PORTAL_SERVICES_CATALOG.find((c) => c.id === form.serviceId);
      await onBookAppointment({
        ...form,
        serviceTitle: matchedEnq?.serviceTitle || matchedCat?.title || 'Consultation Session'
      });
      setBookModalOpen(false);
    } catch (err) {
      setError(err.message || 'Could not schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    setError('');
    setSubmitting(true);
    try {
      await onUpdateAppointment(rescheduleTarget.id, {
        appointmentDate: rescheduleTarget.appointmentDate,
        appointmentTime: rescheduleTarget.appointmentTime,
        consultationMode: rescheduleTarget.consultationMode,
        status: 'Scheduled'
      });
      setRescheduleTarget(null);
    } catch (err) {
      setError(err.message || 'Could not reschedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingList = appointments.filter((a) => a.status === 'Scheduled');
  const historyList = appointments.filter((a) => a.status !== 'Scheduled');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400">
            Live Advisor Calendar & Availability
          </span>
          <h2 className="font-serif text-2xl font-extrabold text-navy-900 dark:text-white">
            Consultations & Appointments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Schedule one-to-one sessions with your assigned Revival consultant or recruitment partner.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setError(''); setBookModalOpen(true); }}
          className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-xs shadow-gold-glow flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-extrabold text-navy-900 dark:text-white">
          Upcoming Scheduled Consultations ({upcomingList.length})
        </h3>

        {upcomingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingList.map((apt) => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Confirmed • {apt.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{apt.id}</span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                    {apt.serviceTitle || 'Advisory Consultation'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-500 shrink-0" />
                      <span className="font-semibold">{apt.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-500 shrink-0" />
                      <span>{apt.appointmentTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gold-500 shrink-0" />
                      <span>{apt.consultantName || 'Dhanalakshimi'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gold-500 shrink-0" />
                      <span className="truncate">{apt.consultationMode}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-navy-950 p-2.5 rounded-xl">
                      {apt.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {apt.meetingLink ? (
                    <a
                      href={apt.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 font-bold inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Join Meeting Link</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-500" /> {apt.location || 'Virtual Desk'}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setError(''); setRescheduleTarget({ ...apt }); }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateAppointment(apt.id, { status: 'Cancelled' })}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center space-y-2">
            <Calendar className="w-8 h-8 text-gold-500 mx-auto" />
            <p className="font-bold text-sm text-navy-900 dark:text-white">No Upcoming Appointments</p>
            <p className="text-xs text-slate-500">Click "Book New Consultation" above to schedule a session with your advisor.</p>
          </div>
        )}
      </div>

      {/* Completed & Past Appointments */}
      {historyList.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-serif text-lg font-extrabold text-navy-900 dark:text-white">
            Completed & Past Appointments
          </h3>
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Service</th>
                    <th className="p-3.5">Consultant</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {historyList.map((apt) => (
                    <tr key={apt.id}>
                      <td className="p-3.5 font-bold text-navy-900 dark:text-white">{apt.serviceTitle}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{apt.consultantName}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{apt.appointmentDate} • {apt.appointmentTime}</td>
                      <td className="p-3.5 text-slate-500">{apt.consultationMode}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Book New Consultation Modal */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setBookModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                Real-Time Consultant Availability
              </span>
              <h3 className="font-serif text-xl font-extrabold text-navy-900 dark:text-white">
                Book a Consultation Session
              </h3>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Related Service Enquiry
                </label>
                <select
                  value={form.enquiryId}
                  onChange={(e) => {
                    const enq = services.find((s) => s.id === e.target.value);
                    setForm({
                      ...form,
                      enquiryId: e.target.value,
                      serviceId: enq?.serviceId || form.serviceId
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option value="">General Advisory Consultation</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceTitle} (#{s.referenceNumber || s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.appointmentDate}
                    onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Available Time Slot *
                  </label>
                  <select
                    value={form.appointmentTime}
                    onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    {(availableSlots.length > 0 ? availableSlots : ['Morning (10:00 AM - 11:00 AM)']).map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {bookedSlots.length > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Note: {bookedSlots.length} slot(s) on {form.appointmentDate} are already reserved and filtered out to prevent double booking.
                </p>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Consultation Mode *
                </label>
                <select
                  value={form.consultationMode}
                  onChange={(e) => setForm({ ...form, consultationMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option>Online Video (Google Meet / Zoom)</option>
                  <option>Phone Call Consultation</option>
                  <option>WhatsApp Call / Advisory</option>
                  <option>In-Person Office Visit (Dubai / India HQ)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Agenda / Topics to Discuss
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Share any specific questions or agenda items for your advisor..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold shadow-gold-glow cursor-pointer"
                >
                  {submitting ? 'Confirming Slot...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-extrabold text-navy-900 dark:text-white">
              Reschedule Consultation
            </h3>
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                {error}
              </div>
            )}
            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleTarget.appointmentDate}
                  onChange={(e) => setRescheduleTarget({ ...rescheduleTarget, appointmentDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">New Time Slot *</label>
                <select
                  value={rescheduleTarget.appointmentTime}
                  onChange={(e) => setRescheduleTarget({ ...rescheduleTarget, appointmentTime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer"
                >
                  Save New Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

