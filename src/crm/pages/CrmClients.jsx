import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Building2, Phone, Mail, MessageSquare, Plus, FileText, CheckCircle2, 
  Search, Eye, Filter, X, Send, DollarSign, Calendar, Clock, UserCheck, 
  ShieldAlert, Trash2, Globe, GraduationCap, School, Award, RefreshCw, AlertCircle, Edit, Check
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmDeleteConfirmModal } from '../components/CrmDeleteConfirmModal';

export const CrmClients = () => {
  const { 
    clients, fetchClients, createOrganization, updateOrganization, 
    addContactToOrganization, removeClient, user 
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetailData, setClientDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'contacts' | 'enquiries' | 'activity' | 'followups'
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Superadmin Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      setIsDeletingClient(true);
      await deleteClient(clientToDelete.id, {
        company: clientToDelete.company,
        country: clientToDelete.country
      });
      setStatusNotice(`✓ Organization "${clientToDelete.company}" (${clientToDelete.id}) permanently deleted.`);
      setDeleteModalOpen(false);
      if (selectedClient && selectedClient.id === clientToDelete.id) {
        setSelectedClient(null);
        setClientDetailData(null);
      }
      setClientToDelete(null);
      setTimeout(() => setStatusNotice(''), 5000);
    } catch (err) {
      console.error('Delete error:', err);
      setStatusNotice(`⚠️ Error deleting organization: ${err.message}`);
    } finally {
      setIsDeletingClient(false);
    }
  };


  // New Organization Form State
  const [newOrg, setNewOrg] = useState({
    company: '',
    organizationType: 'University',
    industry: 'Higher Education & Research',
    country: 'United Arab Emirates',
    location: 'Dubai, UAE',
    website: '',
    contactPerson: '',
    designation: 'Director of International Admissions',
    email: '',
    phone: '',
    assignedEmployee: 'Dhanalakshimi',
    status: 'Active',
    associatedServices: 'International Consulting',
    notes: ''
  });

  // Log Interaction State
  const [newLogType, setNewLogType] = useState('Note');
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogText, setNewLogText] = useState('');
  const [loggingActivity, setLoggingActivity] = useState(false);

  // Add Contact State
  const [newContactName, setNewContactName] = useState('');
  const [newContactDesignation, setNewContactDesignation] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [addingContact, setAddingContact] = useState(false);

  // Schedule Follow-Up State
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpPurpose, setFollowUpPurpose] = useState('');
  const [followUpDueDate, setFollowUpDueDate] = useState('');
  const [followUpAssignedTo, setFollowUpAssignedTo] = useState('Dhanalakshimi');
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const typeFilterOptions = ['All', 'University', 'School', 'Company', 'Partner Institute'];

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || (c.organizationType || 'Company') === selectedType;

    return matchesSearch && matchesType;
  });

  // Fetch full live detail when an organization is selected
  const fetchLiveOrgDetail = async (orgId) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/clients/${orgId}`);
      const data = await res.json();
      if (data && data.success && data.data) {
        setClientDetailData(data.data);
        setEditFormData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch organization details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenClient = (cli) => {
    setSelectedClient(cli);
    setActiveTab('overview');
    setIsEditing(false);
    fetchLiveOrgDetail(cli.id);
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await createOrganization(newOrg);
      setModalOpen(false);
      setNewOrg({
        company: '',
        organizationType: 'University',
        industry: 'Higher Education & Research',
        country: 'United Arab Emirates',
        location: 'Dubai, UAE',
        website: '',
        contactPerson: '',
        designation: 'Director of International Admissions',
        email: '',
        phone: '',
        assignedEmployee: 'Dhanalakshimi',
        status: 'Active',
        associatedServices: 'International Consulting',
        notes: ''
      });
    } catch (err) {
      setFormError(err.message || 'Failed to create organization record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await updateOrganization(selectedClient.id, editFormData);
      setIsEditing(false);
      await fetchLiveOrgDetail(selectedClient.id);
    } catch (err) {
      alert('Failed to update organization: ' + err.message);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogTitle || !newLogText || !selectedClient) return;

    setLoggingActivity(true);
    try {
      // If client has an enquiry, link to it; otherwise log to organization
      const enquiryId = clientDetailData?.enquiries?.[0]?.id || null;
      const targetUrl = enquiryId ? `/api/leads/${enquiryId}/activities` : `/api/consulting/enquiries/${selectedClient.id}/activities`;

      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newLogType,
          title: newLogTitle.trim(),
          notes: newLogText.trim(),
          organizationId: selectedClient.id,
          createdBy: user?.name || 'Staff'
        })
      });

      setNewLogTitle('');
      setNewLogText('');
      await fetchLiveOrgDetail(selectedClient.id);
    } catch (err) {
      console.error('Failed to log activity:', err);
    } finally {
      setLoggingActivity(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactName || !selectedClient) return;

    setAddingContact(true);
    try {
      await addContactToOrganization(selectedClient.id, {
        name: newContactName.trim(),
        designation: newContactDesignation.trim(),
        email: newContactEmail.trim(),
        phone: newContactPhone.trim(),
        isPrimary: clientDetailData?.contacts?.length === 0 ? 1 : 0
      });

      setNewContactName('');
      setNewContactDesignation('');
      setNewContactEmail('');
      setNewContactPhone('');
      await fetchLiveOrgDetail(selectedClient.id);
    } catch (err) {
      alert('Failed to add contact: ' + err.message);
    } finally {
      setAddingContact(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpPurpose || !followUpDueDate || !selectedClient) return;

    setSchedulingFollowUp(true);
    try {
      const enquiryId = clientDetailData?.enquiries?.[0]?.id || null;
      const targetUrl = enquiryId ? `/api/leads/${enquiryId}/follow-ups` : `/api/consulting/enquiries/${selectedClient.id}/follow-ups`;

      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: followUpTitle || 'Client Organization Follow-Up',
          purpose: followUpPurpose.trim(),
          dueDateTime: followUpDueDate,
          assignedTo: followUpAssignedTo,
          organizationId: selectedClient.id,
          createdBy: user?.name || 'Staff'
        })
      });

      setFollowUpTitle('');
      setFollowUpPurpose('');
      setFollowUpDueDate('');
      await fetchLiveOrgDetail(selectedClient.id);
    } catch (err) {
      alert('Failed to schedule follow-up: ' + err.message);
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId) => {
    const notes = prompt('Enter follow-up completion notes:');
    if (notes === null) return;

    try {
      await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          completionNotes: notes || 'Completed successfully',
          updatedBy: user?.name || 'Staff'
        })
      });

      await fetchLiveOrgDetail(selectedClient.id);
    } catch (err) {
      alert('Failed to complete follow-up: ' + err.message);
    }
  };

  const getOrgTypeBadge = (type) => {
    switch (type) {
      case 'University':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-300 dark:border-purple-500/30';
      case 'School':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-500/30';
      case 'College':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30';
      case 'Partner Institute':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/30';
      case 'Company':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans text-slate-800 dark:text-slate-200">
      
      {/* Header Banner */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                Centralized Directory
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SQLite Backed
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Client & Organization Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Master registry of partner universities, schools, colleges, and corporate clients integrated with International Consulting.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchClients && fetchClients()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-navy-700 font-bold transition cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Organization</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Filter and Search Bar */}
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col md:flex-row justify-between gap-3 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by organization name, contact person, country, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {typeFilterOptions.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedType === type
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-slate-200 dark:border-navy-800'
                }`}
              >
                {type === 'All' ? `All (${clients.length})` : type}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Organization Grid Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((cli) => {
            const orgType = cli.organizationType || 'Company';
            return (
              <div 
                key={cli.id} 
                onClick={() => handleOpenClient(cli)}
                className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-4 hover:border-gold-500 transition cursor-pointer flex flex-col justify-between shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-navy-800 pb-3">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${getOrgTypeBadge(orgType)}`}>
                          {orgType}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-bold truncate">#{cli.id}</span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition truncate">
                        {cli.company}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{cli.location || cli.country || 'Dubai, UAE'}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {cli.status || 'Active'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl space-y-1.5 text-[11px] border border-slate-100 dark:border-navy-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Primary Contact:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {cli.contactPerson || 'Not Assigned'}
                      </span>
                    </div>
                    {cli.email && (
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium font-sans">Email:</span>
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{cli.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Consultant:</span>
                      <span className="text-gold-600 dark:text-gold-400 font-bold truncate max-w-[150px]">
                        {cli.assignedEmployee || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Associated Service</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {cli.associatedServices || 'International Consulting'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenClient(cli);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-navy-700 font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Workspace</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 font-bold italic border border-dashed border-slate-300 dark:border-navy-800 rounded-3xl space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p>No organization records match your filter criteria.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedType('All'); }}
                className="text-xs text-gold-500 underline font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* REGISTER NEW ORGANIZATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-luxury space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                  CRM Organization Onboarding
                </span>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-1">
                  Register Master Organization Record
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-gold-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrganization} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrg.company}
                    onChange={e => setNewOrg({ ...newOrg, company: e.target.value })}
                    placeholder="e.g. Heriot-Watt University Dubai / DIA"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">Organization Type *</label>
                  <select
                    value={newOrg.organizationType}
                    onChange={e => setNewOrg({ ...newOrg, organizationType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="University">University</option>
                    <option value="School">School / K-12</option>
                    <option value="College">College</option>
                    <option value="Partner Institute">Partner Institute</option>
                    <option value="Company">Corporate Company</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold">Country *</label>
                  <input
                    type="text"
                    required
                    value={newOrg.country}
                    onChange={e => setNewOrg({ ...newOrg, country: e.target.value })}
                    placeholder="e.g. United Arab Emirates"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">Location / Campus Address</label>
                  <input
                    type="text"
                    value={newOrg.location}
                    onChange={e => setNewOrg({ ...newOrg, location: e.target.value })}
                    placeholder="e.g. Dubai Knowledge Park, Dubai"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold">Official Website</label>
                  <input
                    type="url"
                    value={newOrg.website}
                    onChange={e => setNewOrg({ ...newOrg, website: e.target.value })}
                    placeholder="https://www.example.edu"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">Assigned Consultant / Staff</label>
                  <select
                    value={newOrg.assignedEmployee}
                    onChange={e => setNewOrg({ ...newOrg, assignedEmployee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Dhanalakshimi">Dhanalakshimi (Placement Coordinator)</option>
                    <option value="Sreeja">Sreeja (Placement Coordinator)</option>
                    <option value="chentamilselvi">chentamilselvi (DMS Specialist)</option>
                    <option value="Diviya">Diviya (Application Support)</option>
                    <option value="balavarshini">balavarshini (Application Support)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">Primary Contact Person</label>
                  <input
                    type="text"
                    value={newOrg.contactPerson}
                    onChange={e => setNewOrg({ ...newOrg, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. Fiona Campbell"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">Designation</label>
                  <input
                    type="text"
                    value={newOrg.designation}
                    onChange={e => setNewOrg({ ...newOrg, designation: e.target.value })}
                    placeholder="e.g. Admissions Director"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">Contact Email</label>
                  <input
                    type="email"
                    value={newOrg.email}
                    onChange={e => setNewOrg({ ...newOrg, email: e.target.value })}
                    placeholder="admissions@example.edu"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Associated Services</label>
                <input
                  type="text"
                  value={newOrg.associatedServices}
                  onChange={e => setNewOrg({ ...newOrg, associatedServices: e.target.value })}
                  placeholder="e.g. International Consulting, College Admission Assistance"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Relationship Notes</label>
                <textarea
                  rows={2}
                  value={newOrg.notes}
                  onChange={e => setNewOrg({ ...newOrg, notes: e.target.value })}
                  placeholder="e.g. Annual academic workshop partner; Direct progression memorandum in review."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering in SQLite...' : 'Save Organization Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED CLIENT / ORGANIZATION WORKSPACE MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-luxury space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${getOrgTypeBadge(clientDetailData?.organizationType || selectedClient.organizationType)}`}>
                    {clientDetailData?.organizationType || selectedClient.organizationType || 'Company'}
                  </span>
                  <span className="font-mono text-xs text-gold-600 dark:text-gold-400 font-bold">
                    #{selectedClient.id}
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                    {clientDetailData?.status || selectedClient.status || 'Active'}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {clientDetailData?.company || selectedClient.company}
                </h2>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {clientDetailData?.location || selectedClient.location || selectedClient.country} • Assigned Consultant: <strong className="text-gold-600 dark:text-gold-400">{clientDetailData?.assignedEmployee || selectedClient.assignedEmployee || 'Unassigned'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-navy-700 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
                <button 
                  onClick={() => { setSelectedClient(null); setClientDetailData(null); }} 
                  className="p-1.5 text-slate-400 hover:text-gold-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 font-bold text-xs overflow-x-auto whitespace-nowrap">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`pb-2.5 px-3 transition cursor-pointer ${activeTab === 'overview' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                Profile & Service Overview
              </button>
              <button 
                onClick={() => setActiveTab('contacts')} 
                className={`pb-2.5 px-3 transition cursor-pointer ${activeTab === 'contacts' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                Authorized Contacts ({clientDetailData?.contacts?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('enquiries')} 
                className={`pb-2.5 px-3 transition cursor-pointer ${activeTab === 'enquiries' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                Linked Enquiries ({clientDetailData?.enquiries?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('activity')} 
                className={`pb-2.5 px-3 transition cursor-pointer ${activeTab === 'activity' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                Activity Timeline ({clientDetailData?.activities?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('followups')} 
                className={`pb-2.5 px-3 transition cursor-pointer ${activeTab === 'followups' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                Follow-Ups ({clientDetailData?.followUps?.length || 0})
              </button>
            </div>

            {/* TAB 1: OVERVIEW / EDIT PROFILE */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-4">
                    <h4 className="font-bold text-navy-900 dark:text-white">Edit Organization Profile</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold">Organization Name</label>
                        <input
                          type="text"
                          value={editFormData.company || ''}
                          onChange={e => setEditFormData({ ...editFormData, company: e.target.value })}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold">Assigned Consultant</label>
                        <select
                          value={editFormData.assignedEmployee || 'Unassigned'}
                          onChange={e => setEditFormData({ ...editFormData, assignedEmployee: e.target.value })}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold"
                        >
                          <option value="Dhanalakshimi">Dhanalakshimi (Placement Coordinator)</option>
                          <option value="Sreeja">Sreeja (Placement Coordinator)</option>
                          <option value="chentamilselvi">chentamilselvi (DMS)</option>
                          <option value="Diviya">Diviya (Application Support)</option>
                          <option value="balavarshini">balavarshini (Application Support)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold">Location / Address</label>
                        <input
                          type="text"
                          value={editFormData.location || ''}
                          onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold">Website</label>
                        <input
                          type="text"
                          value={editFormData.website || ''}
                          onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold">Associated Services</label>
                        <input
                          type="text"
                          value={editFormData.associatedServices || ''}
                          onChange={e => setEditFormData({ ...editFormData, associatedServices: e.target.value })}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold">Status</label>
                        <select
                          value={editFormData.status || 'Active'}
                          onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold"
                        >
                          <option value="Active">Active</option>
                          <option value="Prospect">Prospect</option>
                          <option value="Partner">Partner</option>
                          <option value="Onboarding">Onboarding</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-gold-500 text-navy-950 font-bold rounded-lg shadow-gold-glow"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Organization Type:</span>
                        <p className="font-bold text-slate-900 dark:text-white">{clientDetailData?.organizationType || selectedClient.organizationType || 'Company'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Campus / Location:</span>
                        <p className="font-bold text-slate-900 dark:text-white">{clientDetailData?.location || selectedClient.location || selectedClient.address || 'Dubai, UAE'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Official Website:</span>
                        <p className="font-bold text-gold-600 dark:text-gold-400">
                          {clientDetailData?.website ? (
                            <a href={clientDetailData.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              <span>{clientDetailData.website}</span>
                              <Globe className="w-3 h-3" />
                            </a>
                          ) : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Consultant:</span>
                        <p className="font-bold text-slate-900 dark:text-white">{clientDetailData?.assignedEmployee || selectedClient.assignedEmployee || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1.5">
                      <h4 className="font-bold text-gold-600 dark:text-gold-400">Associated Educational & Advisory Services</h4>
                      <p className="text-slate-700 dark:text-slate-300">
                        {clientDetailData?.associatedServices || selectedClient.associatedServices || 'International Consulting'}
                      </p>
                      {clientDetailData?.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 italic">
                          Notes: {clientDetailData.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AUTHORIZED CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {/* Add Contact Form */}
                <form onSubmit={handleAddContact} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <h4 className="font-bold text-navy-900 dark:text-white">Add Authorized Representative</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={newContactName}
                      onChange={e => setNewContactName(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={newContactDesignation}
                      onChange={e => setNewContactDesignation(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newContactEmail}
                      onChange={e => setNewContactEmail(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={newContactPhone}
                        onChange={e => setNewContactPhone(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={addingContact}
                        className="px-3 bg-gold-500 text-navy-950 font-bold rounded-xl shrink-0 cursor-pointer shadow-gold-glow"
                      >
                        {addingContact ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Contacts List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Registered Organization Representatives:</h4>
                  {clientDetailData?.contacts && clientDetailData.contacts.length > 0 ? (
                    clientDetailData.contacts.map((cnt) => (
                      <div key={cnt.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{cnt.name}</span>
                            {cnt.isPrimary === 1 && (
                              <span className="text-[9px] bg-gold-500/20 text-gold-600 dark:text-gold-400 px-1.5 py-0.2 rounded font-mono font-bold">PRIMARY</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{cnt.designation || 'Representative'}</p>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <p className="text-slate-700 dark:text-slate-300">{cnt.email}</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold">{cnt.phone}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl text-center text-slate-500 italic">
                      Primary contact on master record: <strong>{selectedClient.contactPerson}</strong> ({selectedClient.email || 'No email'})
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: LINKED ENQUIRIES */}
            {activeTab === 'enquiries' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white">Associated International Consulting Enquiries:</h4>
                {clientDetailData?.enquiries && clientDetailData.enquiries.length > 0 ? (
                  clientDetailData.enquiries.map((enq) => (
                    <div key={enq.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-[10px] text-gold-600 dark:text-gold-400 font-bold">
                            {enq.referenceNumber || enq.id}
                          </span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{enq.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Destination: <strong className="text-slate-700 dark:text-slate-300">{enq.countryInterest || 'Global'}</strong> • Intake: {enq.intakeTerm || 'Fall 2026'}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                          {enq.status || 'New'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug line-clamp-2 pl-2 border-l-2 border-gold-500/50">
                        {enq.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-navy-950 rounded-xl border border-dashed border-slate-200 dark:border-navy-800">
                    No active student or parent inquiries directly linked to this institution yet. As students submit inquiries referencing this organization, they will automatically appear here.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {/* Log Interaction Form */}
                <form onSubmit={handleAddLog} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <h4 className="font-bold text-navy-900 dark:text-white">Log Discussion / Call / Meeting Note</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      value={newLogType}
                      onChange={e => setNewLogType(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-xs"
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Meeting">Meeting Note</option>
                      <option value="Email">Email Communication</option>
                      <option value="Note">Internal Note</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Title / Summary *"
                      value={newLogTitle}
                      onChange={e => setNewLogTitle(e.target.value)}
                      className="sm:col-span-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter discussion points, client decisions, or next milestones..."
                      value={newLogText}
                      onChange={e => setNewLogText(e.target.value)}
                      className="flex-1 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={loggingActivity}
                      className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow shrink-0 cursor-pointer"
                    >
                      {loggingActivity ? 'Saving...' : 'Add Log'}
                    </button>
                  </div>
                </form>

                {/* Timeline Feed */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Interaction History & Logs:</h4>
                  {clientDetailData?.activities && clientDetailData.activities.length > 0 ? (
                    clientDetailData.activities.map((act) => (
                      <div key={act.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                            [{act.type}] {act.title}
                          </span>
                          <span className="text-slate-400 font-mono">{act.createdAt} • by {act.createdBy}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{act.notes}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 italic bg-slate-50 dark:bg-navy-950 rounded-xl">
                      No interactions recorded yet. Use the form above to record discussions, calls, or meeting notes.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: FOLLOW-UPS */}
            {activeTab === 'followups' && (
              <div className="space-y-4">
                {/* Schedule Follow-Up Form */}
                <form onSubmit={handleScheduleFollowUp} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <h4 className="font-bold text-navy-900 dark:text-white">Schedule Client Follow-Up</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Follow-Up Title"
                      value={followUpTitle}
                      onChange={e => setFollowUpTitle(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="datetime-local"
                      required
                      value={followUpDueDate}
                      onChange={e => setFollowUpDueDate(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <select
                      value={followUpAssignedTo}
                      onChange={e => setFollowUpAssignedTo(e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-xs"
                    >
                      <option value="Dhanalakshimi">Dhanalakshimi</option>
                      <option value="Sreeja">Sreeja</option>
                      <option value="chentamilselvi">chentamilselvi</option>
                      <option value="Diviya">Diviya</option>
                      <option value="balavarshini">balavarshini</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Follow-Up Purpose / Objective (e.g. Discuss revised scholarship quotas, Review MoU draft)..."
                      value={followUpPurpose}
                      onChange={e => setFollowUpPurpose(e.target.value)}
                      className="flex-1 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={schedulingFollowUp}
                      className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow shrink-0 cursor-pointer"
                    >
                      {schedulingFollowUp ? 'Scheduling...' : 'Schedule'}
                    </button>
                  </div>
                </form>

                {/* Follow-ups List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Scheduled Follow-Ups:</h4>
                  {clientDetailData?.followUps && clientDetailData.followUps.length > 0 ? (
                    clientDetailData.followUps.map((flw) => (
                      <div key={flw.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 dark:text-white">{flw.title}</p>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              flw.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}>
                              {flw.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{flw.purpose}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Due: <strong className="text-slate-700 dark:text-slate-300">{flw.dueDateTime}</strong> • Assigned: {flw.assignedTo}</p>
                          {flw.completionNotes && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">Resolution: {flw.completionNotes}</p>
                          )}
                        </div>

                        {flw.status === 'Pending' && (
                          <button
                            onClick={() => handleCompleteFollowUp(flw.id)}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-xs transition border border-emerald-300 dark:border-emerald-700"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 italic bg-slate-50 dark:bg-navy-950 rounded-xl">
                      No follow-ups scheduled for this organization.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
