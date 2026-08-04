import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Settings, ShieldCheck, KeyRound, Mail, MessageSquare, Database, Lock, CheckCircle2 } from 'lucide-react';
import { CRM_ROLES, ROLE_PERMISSIONS } from '../data/mockCrmData';

export const CrmSettings = () => {
  const { currentRole, switchRole } = useCrm();
  const [activeTab, setActiveTab] = useState('rbac'); // 'rbac' | 'api' | 'security' | 'backup'

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">System Administration</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Admin Control Center</h1>
          <p className="text-slate-400">Configure role permissions, security policies, API integrations, and system backups.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-navy-800 font-bold">
        <button onClick={() => setActiveTab('rbac')} className={`pb-3 px-4 transition ${activeTab === 'rbac' ? 'border-b-2 border-gold-500 text-gold-400' : 'text-slate-400'}`}>
          16-Role Access Matrix (RBAC)
        </button>
        <button onClick={() => setActiveTab('api')} className={`pb-3 px-4 transition ${activeTab === 'api' ? 'border-b-2 border-gold-500 text-gold-400' : 'text-slate-400'}`}>
          API & Gateway Config
        </button>
        <button onClick={() => setActiveTab('security')} className={`pb-3 px-4 transition ${activeTab === 'security' ? 'border-b-2 border-gold-500 text-gold-400' : 'text-slate-400'}`}>
          IP & Security Policies
        </button>
        <button onClick={() => setActiveTab('backup')} className={`pb-3 px-4 transition ${activeTab === 'backup' ? 'border-b-2 border-gold-500 text-gold-400' : 'text-slate-400'}`}>
          Database Backup & Restore
        </button>
      </div>

      {activeTab === 'rbac' && (
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-white">Role-Based Access Control (RBAC) Permissions</h3>
            <span className="text-gold-400 font-bold">Active Role Demo: {currentRole}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy-950 text-gold-400 font-serif border-b border-navy-800 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Role Name</th>
                  <th className="p-3">Permitted Modules</th>
                  <th className="p-3">Access Level</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 text-slate-300">
                {CRM_ROLES.map((r) => {
                  const perms = ROLE_PERMISSIONS[r] || [];
                  return (
                    <tr key={r} className="hover:bg-navy-950/60">
                      <td className="p-3 font-bold text-white">{r}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {perms.map(p => (
                            <span key={p} className="bg-navy-950 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-navy-800">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-gold-500/20 text-gold-400 font-bold px-2 py-0.5 rounded text-[10px]">
                          {perms.includes('all') ? 'Full Administrative' : 'Scoped Module Access'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => switchRole(r)}
                          className="px-3 py-1 bg-navy-950 text-gold-400 border border-navy-800 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-lg transition"
                        >
                          Switch to {r}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4 max-w-xl">
          <h3 className="font-serif text-lg font-bold text-white">SMTP & Integration Credentials</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">SMTP Gateway Host</label>
              <input type="text" defaultValue="smtp.sirrecruitment.com" className="w-full bg-navy-950 border border-navy-700 text-white rounded-lg p-2.5 text-xs font-mono" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">WhatsApp Business API Token</label>
              <input type="text" defaultValue="wa_biz_token_live_9812903810293" className="w-full bg-navy-950 border border-navy-700 text-white rounded-lg p-2.5 text-xs font-mono" />
            </div>
            <button className="w-full py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
              Save Integration Credentials
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-3 max-w-xl">
          <h3 className="font-serif text-lg font-bold text-white">Enterprise Security Enforcement</h3>
          <div className="p-3 bg-navy-950 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between"><span>JWT Token Expiry:</span> <strong className="text-gold-400">8 Hours</strong></div>
            <div className="flex justify-between"><span>IP Whitelisting:</span> <strong className="text-emerald-400">Enabled (Dubai HQ Range)</strong></div>
            <div className="flex justify-between"><span>Session Timeout:</span> <strong className="text-gold-400">15 Mins Inactivity</strong></div>
            <div className="flex justify-between"><span>Max Failed Logins:</span> <strong className="text-rose-400">3 Attempts (Lockout)</strong></div>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4 max-w-xl text-center">
          <Database className="w-10 h-10 text-gold-500 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">Automated Database Backups</h3>
          <p className="text-slate-400">Database snapshot taken daily at 02:00 AM GST. Last snapshot verified on Supabase PostgreSQL.</p>
          <button className="py-2.5 px-6 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
            Download Latest Database Snapshot (.SQL)
          </button>
        </div>
      )}

    </div>
  );
};
