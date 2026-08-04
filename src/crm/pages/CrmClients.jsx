import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Building2, Phone, Mail, MessageSquare, Plus, FileText, CheckCircle2, 
  Search, Eye, Filter, X, Send, DollarSign, Calendar, Clock, UserCheck, ShieldAlert, Trash2 
} from 'lucide-react';

export const CrmClients = () => {
  const { clients, addClient, removeClient } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requirements' | 'coordinator'
  const [modalOpen, setModalOpen] = useState(false);

  // Client Coordinator State
  const [newLogType, setNewLogType] = useState('Email');
  const [newLogText, setNewLogText] = useState('');

  // Add Client Form
  const [newCompany, setNewCompany] = useState({
    company: '',
    industry: 'Construction & Infrastructure',
    country: 'UAE (Dubai)',
    address: 'Business Bay, Dubai',
    contactPerson: '',
    designation: 'Director of HR',
    email: '',
    phone: '',
    activeMandates: 2
  });

  const filteredClients = clients.filter(c => 
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = (e) => {
    e.preventDefault();
    addClient(newCompany);
    setModalOpen(false);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLogText || !selectedClient) return;

    const newLog = {
      type: newLogType,
      date: new Date().toISOString().split('T')[0],
      text: newLogText
    };

    selectedClient.communications = [newLog, ...(selectedClient.communications || [])];
    setNewLogText('');
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Corporate Accounts Management</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Client Company Directory & Coordinator Hub</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage enterprise employer SLAs, active mandates, requirements approval & communication logs.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Client Account</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search corporate client by company name, industry, or GCC country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
          />
        </div>
      </div>

      {/* Client Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClients.map((cli) => (
          <div 
            key={cli.id} 
            onClick={() => { setSelectedClient(cli); setActiveTab('overview'); }}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="text-2xl font-bold">{cli.logo}</span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{cli.company}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{cli.industry} • {cli.country}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold px-2.5 py-1 rounded text-[10px]">{cli.agreementStatus}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to remove client account '${cli.company}'?`)) {
                        removeClient(cli.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Remove / Delete Client Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-1.5 text-[11px]">
                <p><strong className="text-slate-500 dark:text-slate-400">Key Contact:</strong> <span className="text-slate-900 dark:text-white font-semibold">{cli.contactPerson} ({cli.designation})</span></p>
                <p><strong className="text-slate-500 dark:text-slate-400">Email:</strong> <span className="text-slate-700 dark:text-slate-300">{cli.email}</span></p>
                <p><strong className="text-slate-500 dark:text-slate-400">Phone:</strong> <span className="text-slate-700 dark:text-slate-300">{cli.phone}</span></p>
                <p><strong className="text-slate-500 dark:text-slate-400">Assigned Coordinator:</strong> <span className="text-gold-600 dark:text-gold-400 font-bold">{cli.coordinator}</span></p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-xs">
              <div><p className="text-[10px] text-slate-400">Active Mandates</p><p className="font-bold text-slate-900 dark:text-white">{cli.activeMandates} Open Roles</p></div>
              <div><p className="text-[10px] text-slate-400">Total Placements</p><p className="font-bold text-gold-600 dark:text-gold-400">{cli.totalPlacements} Placed</p></div>
              <div><p className="text-[10px] text-slate-400">Pending Invoices</p><p className="font-bold text-emerald-600 dark:text-emerald-400">${cli.pendingInvoiceUSD ? cli.pendingInvoiceUSD.toLocaleString() : '0'} USD</p></div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-500 dark:text-slate-400 font-bold italic border border-dashed border-slate-300 dark:border-navy-800 rounded-2xl">
            No client accounts match your search. Register a new corporate client above!
          </div>
        )}
      </div>

      {/* Selected Client Workspace Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="text-gold-600 dark:text-gold-400 font-bold text-[10px] uppercase font-mono">{selectedClient.id}</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{selectedClient.company}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedClient.industry} • {selectedClient.country} • Coordinator: {selectedClient.coordinator}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-gold-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 font-bold text-xs">
              <button onClick={() => setActiveTab('overview')} className={`pb-2 px-3 transition cursor-pointer ${activeTab === 'overview' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}>
                Company & SLA Overview
              </button>
              <button onClick={() => setActiveTab('requirements')} className={`pb-2 px-3 transition cursor-pointer ${activeTab === 'requirements' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}>
                Open Requirements ({selectedClient.requirements ? selectedClient.requirements.length : 0})
              </button>
              <button onClick={() => setActiveTab('coordinator')} className={`pb-2 px-3 transition cursor-pointer ${activeTab === 'coordinator' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}>
                Client Coordinator Workspace (Logs & Feedback)
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                  <div><span className="text-slate-500 dark:text-slate-400">Headquarters Address:</span> <p className="font-bold text-slate-900 dark:text-white">{selectedClient.address}</p></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Primary Contact Person:</span> <p className="font-bold text-slate-900 dark:text-white">{selectedClient.contactPerson} ({selectedClient.designation})</p></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Direct Telephone:</span> <p className="font-bold text-slate-800 dark:text-slate-200">{selectedClient.phone}</p></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Email Address:</span> <p className="font-bold text-slate-800 dark:text-slate-200">{selectedClient.email}</p></div>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-navy-950 rounded-xl border border-gold-500/30 space-y-2">
                  <h4 className="font-bold text-gold-600 dark:text-gold-400">Master SLA Agreement Details</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Signed Executive Recruitment SLA under 15% placement fee model. 90-day replacement guarantee active across UAE & KSA jurisdictions.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Requirements */}
            {activeTab === 'requirements' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Active Requirements Collected:</h4>
                {selectedClient.requirements && selectedClient.requirements.map(req => (
                  <div key={req.id} className="p-3.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{req.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{req.id} • Vacancies: {req.count} Openings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{req.salary}</p>
                      <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{req.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Client Coordinator Workspace */}
            {activeTab === 'coordinator' && (
              <div className="space-y-4 text-xs">
                {/* Communication Log Form */}
                <form onSubmit={handleAddLog} className="p-4 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <h4 className="font-bold text-gold-600 dark:text-gold-400 text-xs">Log Client Interaction (Email / WhatsApp / Meeting Note)</h4>
                  <div className="flex gap-2">
                    <select value={newLogType} onChange={e=>setNewLogType(e.target.value)} className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs font-bold">
                      <option value="Email">Email Log</option>
                      <option value="WhatsApp">WhatsApp Log</option>
                      <option value="Meeting">Meeting Note</option>
                      <option value="Submission">Candidate Submission</option>
                    </select>
                    <input 
                      type="text"
                      required
                      placeholder="Enter communication details, candidate submission notes or client feedback..."
                      value={newLogText}
                      onChange={e=>setNewLogText(e.target.value)}
                      className="flex-1 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs"
                    />
                    <button type="submit" className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-lg shadow-gold-glow cursor-pointer">
                      Add Log
                    </button>
                  </div>
                </form>

                {/* Timeline Feed */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Communication Timeline & Logs:</h4>
                  {selectedClient.communications && selectedClient.communications.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-bold text-gold-600 dark:text-gold-400">[{c.type}]</span>
                        <span className="text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center">
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove corporate client '${selectedClient.company}'?`)) {
                    removeClient(selectedClient.id);
                    setSelectedClient(null);
                  }
                }}
                className="px-4 py-2 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-500/40 font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Client Account</span>
              </button>

              <button onClick={() => setSelectedClient(null)} className="px-6 py-2 bg-slate-200 dark:bg-navy-800 text-slate-900 dark:text-white font-bold rounded-xl cursor-pointer">Close</button>
            </div>

          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4 text-slate-900 dark:text-white">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Register Corporate Client</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-gold-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Company Name</label>
                <input required type="text" value={newCompany.company} onChange={e=>setNewCompany({...newCompany, company: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Industry</label>
                  <input required type="text" value={newCompany.industry} onChange={e=>setNewCompany({...newCompany, industry: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Country / Jurisdiction</label>
                  <input required type="text" value={newCompany.country} onChange={e=>setNewCompany({...newCompany, country: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Key Contact Person</label>
                  <input required type="text" value={newCompany.contactPerson} onChange={e=>setNewCompany({...newCompany, contactPerson: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                  <input required type="email" value={newCompany.email} onChange={e=>setNewCompany({...newCompany, email: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow">
                Save Client Account to Enterprise CRM
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
