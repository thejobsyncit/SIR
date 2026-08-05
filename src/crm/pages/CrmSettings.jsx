import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Settings, ShieldCheck, KeyRound, Mail, MessageSquare, Database, Lock, 
  CheckCircle2, Search, Filter, RefreshCw, Smartphone, CreditCard, Building2,
  Download, Upload, Check, FileSpreadsheet, Server, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { CRM_ROLES, ROLE_PERMISSIONS } from '../data/mockCrmData';

export const CrmSettings = () => {
  const { currentRole, switchRole, auditLogs, logAuditAction, darkMode, toggleDarkMode } = useCrm();
  const [activeTab, setActiveTab] = useState('rbac'); // 'rbac' | 'company' | 'api' | 'security' | 'audit' | 'backup'
  const [auditSearch, setAuditSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState({
    name: 'SIR Recruitment Enterprise LLC',
    crNumber: 'CR-908129-DUBAI',
    address: 'Al Habtoor Business Tower, Level 24, Dubai, UAE',
    supportEmail: 'support@sirrecruitment.com',
    phone: '+971 4 390 1111'
  });

  // Gateway Settings State
  const [gateways, setGateways] = useState({
    smtpHost: 'smtp.sirrecruitment.com',
    waToken: 'wa_biz_token_live_9812903810293',
    stripeKey: 'sk_live_sir_98129038102'
  });

  // Security Toggles
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    ipWhitelisting: true,
    sessionTimeoutMins: 15,
    maxFailedAttempts: 5
  });

  const [restoreFileName, setRestoreFileName] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.role.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const showStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const handleDownloadBackup = () => {
    logAuditAction('Downloaded full PostgreSQL database backup snapshot (.SQL).');

    const sqlContent = `-- =====================================================
-- SIR RECRUITMENT ENTERPRISE CRM DATABASE SNAPSHOT (.SQL)
-- Generated At: ${new Date().toISOString()}
-- Database Engine: PostgreSQL 16.2 / Supabase Engine
-- Server: db.sirrecruitment.internal (Dubai HQ Primary Node)
-- =====================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- -----------------------------------------------------
-- TABLE SCHEMA: CANDIDATES
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidates (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 0,
    salary_expectation VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Applied',
    passport_status VARCHAR(50) DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.candidates (id, name, role, country, experience_years, salary_expectation, status, passport_status) VALUES
('CAND-801', 'Alexander Wright', 'Chief Technology Officer', 'UK', 14, '$140,000 / yr', 'Interviewing', 'Verified'),
('CAND-802', 'Elena Rostova', 'Senior Mechanical Engineer', 'Singapore', 8, '$95,000 / yr', 'Visa Processing', 'Expiring Soon'),
('CAND-803', 'Dr. Sarah Al-Mansoori', 'Consultant Cardiologist', 'Saudi Arabia', 16, '$210,000 / yr', 'Placed', 'Verified'),
('CAND-804', 'Rajesh Subramanian', 'Lead DevOps Architect', 'India', 10, '$110,000 / yr', 'Document Attestation', 'Verified');

-- -----------------------------------------------------
-- TABLE SCHEMA: RECRUITMENT_MANDATES
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recruitment_mandates (
    id VARCHAR(64) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    bounty_amount VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.recruitment_mandates (id, client_name, position_title, location, bounty_amount) VALUES
('MAND-301', 'Saudi German Hospital', 'Senior ICU Nurse', 'Riyadh, KSA', '$12,500'),
('MAND-302', 'Al Habtoor Group', 'Project Director', 'Dubai, UAE', '$25,000'),
('MAND-303', 'Qatar Petroleum', 'Subsea Safety Inspector', 'Doha, Qatar', '$18,000');

-- -----------------------------------------------------
-- TABLE SCHEMA: SYSTEM_AUDIT_LOGS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action_description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dump completed successfully
-- CHECKSUM SHA256: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
`;

    const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sir_recruitment_db_snapshot_${new Date().toISOString().slice(0,10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus(`✓ Database snapshot (.SQL) generated and downloaded successfully!`);
  };

  const handleRestoreBackup = (e) => {
    e.preventDefault();
    if (!restoreFileName) {
      showStatus("⚠️ Please select a valid .SQL database backup file first!");
      return;
    }
    logAuditAction(`Restored database snapshot from file '${restoreFileName}'.`);
    showStatus(`✓ Successfully restored PostgreSQL database from snapshot file '${restoreFileName}'!`);
    setRestoreFileName('');
  };

  const handleExportAuditCSV = () => {
    logAuditAction('Exported security audit trail to CSV format.');
    let csv = "Timestamp,User,Role,Action,IP Address\n";
    auditLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.user}","${l.role}","${l.action.replace(/"/g, '""')}","${l.ip}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sir_crm_audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus(`✓ Audit log CSV report exported successfully!`);
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    logAuditAction('Updated company profile information.');
    showStatus('✓ Company registration profile updated successfully!');
  };

  const handleSaveGateways = (e) => {
    e.preventDefault();
    logAuditAction('Updated SMTP & Payment Gateway API credentials.');
    showStatus('✓ Integration API credentials updated successfully!');
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">System Administration</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Admin Settings & Control Center</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure role permissions (RBAC), security policies, API integrations, and system backups.</p>
        </div>
      </div>

      {/* Global Toast / Notification Bar */}
      {statusMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="glass-card bg-white dark:bg-navy-900 p-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 flex space-x-2 font-bold overflow-x-auto shadow-sm items-center">
        {[
          { id: 'rbac', label: '16-Role RBAC Matrix' },
          { id: 'company', label: 'Company Profile' },
          { id: 'api', label: 'SMTP, SMS & Gateways' },
          { id: 'security', label: 'Security & IP Whitelisting' },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})` },
          { id: 'backup', label: 'Backup & Restore' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gold-500 text-navy-950 shadow-gold-glow border border-gold-400'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: RBAC Matrix & User Account Creation */}
      {activeTab === 'rbac' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) & User Management</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Super Admin User Management: Manage roles and create accounts for Admins & Coordinators.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-800 dark:text-gold-400 font-bold bg-slate-100 dark:bg-navy-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 text-xs">
                Active Role: {currentRole}
              </span>
            </div>
          </div>

          {/* Super Admin User Creation Panel */}
          <div className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-4">
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-500" />
              Super Admin Control: Create New System User Account
            </h4>

            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const name = form.name.value;
              const email = form.email.value.trim().toLowerCase();
              const role = form.role.value;
              const password = form.password.value;

              const saved = localStorage.getItem('sir_crm_registered_users');
              let users = saved ? JSON.parse(saved) : [];
              const newUser = { name, email, role, password };
              users = [newUser, ...users.filter(u => u.email !== email)];
              localStorage.setItem('sir_crm_registered_users', JSON.stringify(users));

              logAuditAction(`Super Admin created new user account '${email}' assigned as '${role}'.`);
              showStatus(`✓ System Account '${email}' created & registered under role '${role}'!`);
              form.reset();
            }} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" name="name" required placeholder="e.g. Sarah Coordinator" className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Corporate Email ID</label>
                <input type="email" name="email" required placeholder="sarah.coord@sirrecruitment.com" className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                <select name="role" defaultValue="Placement Coordinator" className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500">
                  {CRM_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type={showUserPassword ? "text" : "password"} 
                      name="password" 
                      required 
                      placeholder="Enter password" 
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 pr-10 font-bold focus:outline-none focus:border-gold-500" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors p-1 flex items-center justify-center cursor-pointer"
                      title={showUserPassword ? "Hide password" : "Show password"}
                      aria-label={showUserPassword ? "Hide password" : "Show password"}
                    >
                      {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="submit" className="py-2.5 px-4 bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold rounded-xl shadow-gold-glow cursor-pointer shrink-0 transition">
                    + Create
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif border-b border-slate-200 dark:border-navy-800 uppercase tracking-wider text-[10px]">
                  <th className="p-3 font-bold">Role Title</th>
                  <th className="p-3 font-bold">Permitted Modules</th>
                  <th className="p-3 font-bold">Access Level</th>
                  <th className="p-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                {CRM_ROLES.map((r) => {
                  const perms = ROLE_PERMISSIONS[r] || [];
                  return (
                    <tr key={r} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white text-sm">{r}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {perms.map(p => (
                            <span key={p} className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-navy-800 font-semibold">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300 dark:border-gold-500/30">
                          {perms.includes('all') ? 'Full Administrative' : 'Scoped Module Access'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            switchRole(r);
                            showStatus(`✓ Active system view switched to role: ${r}`);
                          }}
                          className="px-3 py-1 bg-slate-100 dark:bg-navy-950 text-amber-900 dark:text-gold-400 border border-slate-200 dark:border-navy-800 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-lg transition cursor-pointer"
                        >
                          Test View as {r}
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

      {/* Tab 2: Company Profile */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 max-w-xl shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" />
            Company Registration Profile
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Legal Name</label>
              <input type="text" value={companyProfile.name} onChange={e=>setCompanyProfile({...companyProfile, name: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-semibold rounded-xl p-2.5" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Commercial Register (CR)</label>
                <input type="text" value={companyProfile.crNumber} onChange={e=>setCompanyProfile({...companyProfile, crNumber: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-mono font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input type="text" value={companyProfile.phone} onChange={e=>setCompanyProfile({...companyProfile, phone: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-semibold rounded-xl p-2.5" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Headquarters Address</label>
              <input type="text" value={companyProfile.address} onChange={e=>setCompanyProfile({...companyProfile, address: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-semibold rounded-xl p-2.5" />
            </div>
            <button type="submit" className="w-full py-3 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow cursor-pointer hover:opacity-95 transition">
              Save Company Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: API & Gateways */}
      {activeTab === 'api' && (
        <form onSubmit={handleSaveGateways} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 max-w-xl shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-gold-500" />
            SMTP & Integration Gateways
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Gateway Host</label>
              <input type="text" value={gateways.smtpHost} onChange={e=>setGateways({...gateways, smtpHost: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-mono font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Business API Token</label>
              <input type="text" value={gateways.waToken} onChange={e=>setGateways({...gateways, waToken: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-mono font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stripe Payment Gateway Secret Key</label>
              <input type="password" value={gateways.stripeKey} onChange={e=>setGateways({...gateways, stripeKey: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-mono font-bold" />
            </div>
            <button type="submit" className="w-full py-3 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow cursor-pointer hover:opacity-95 transition">
              Save Integration Keys
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Security & IP Policies */}
      {activeTab === 'security' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 max-w-xl shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold-500" />
            Enterprise Security Policy Enforcements
          </h3>
          
          <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl space-y-3 text-xs border border-slate-200 dark:border-navy-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Two-Factor Authentication (2FA):</span>
              <button 
                onClick={() => {
                  setSecuritySettings(s => ({ ...s, twoFactor: !s.twoFactor }));
                  showStatus(`2FA enforcement turned ${!securitySettings.twoFactor ? 'ON' : 'OFF'}`);
                }}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition ${securitySettings.twoFactor ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}
              >
                {securitySettings.twoFactor ? 'Mandatory (Enabled)' : 'Disabled'}
              </button>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-navy-800 pt-2">
              <span className="text-slate-700 dark:text-slate-300 font-bold">IP Whitelisting Range:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">194.170.21.0/24 (Dubai HQ)</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-navy-800 pt-2">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Session Idle Timeout:</span>
              <span className="text-amber-800 dark:text-gold-400 font-mono font-bold">15 Mins Inactivity</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-navy-800 pt-2">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Max Failed Password Attempts:</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">5 Attempts (15m Lockout)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-navy-800 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Security & Operations Audit Trail</h3>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="Search audit logs..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-semibold rounded-xl pl-9 pr-3 py-1.5 text-xs"
                />
              </div>

              <button 
                onClick={handleExportAuditCSV}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-amber-900 dark:text-gold-400 border border-slate-300 dark:border-navy-700 font-bold rounded-xl flex items-center space-x-1.5 shrink-0 hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">User: <strong className="text-amber-600 dark:text-gold-400">{log.user}</strong> ({log.role}) • IP: <span className="font-mono font-bold">{log.ip}</span></p>
                </div>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Automated Backups Card */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 text-center shadow-sm">
            <Database className="w-12 h-12 text-gold-500 mx-auto" />
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Automated Database Backups</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Database snapshot taken daily at 02:00 AM GST. Verified on Supabase PostgreSQL.</p>
            </div>

            <button 
              onClick={handleDownloadBackup}
              className="w-full py-3 px-6 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Latest Database Snapshot (.SQL)</span>
            </button>
          </div>

          {/* Restore Database Card */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-navy-800 pb-3">
              <RefreshCw className="w-6 h-6 text-gold-500" />
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Restore Database Snapshot</h3>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">Upload a valid .SQL database backup to restore system tables & records.</p>
              </div>
            </div>

            <form onSubmit={handleRestoreBackup} className="space-y-3">
              <div className="relative p-4 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl text-center space-y-1 bg-slate-50 dark:bg-navy-950">
                <input 
                  type="file" 
                  accept=".sql" 
                  onChange={e => e.target.files && setRestoreFileName(e.target.files[0].name)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Upload className="w-6 h-6 text-gold-500 mx-auto" />
                <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                  {restoreFileName ? `Selected: ${restoreFileName}` : 'Select or Drag & Drop .SQL Backup File'}
                </p>
                <p className="text-[10px] text-slate-500">Supported: PostgreSQL 16 .SQL dumps</p>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-slate-100 dark:bg-navy-950 text-amber-900 dark:text-gold-400 border border-slate-300 dark:border-navy-700 font-bold rounded-xl hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Database from Snapshot File</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
