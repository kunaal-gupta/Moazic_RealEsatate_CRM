import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  Trash2, 
  Edit2, 
  Copy,
  Clock,
  MessageSquare,
  CheckCircle2,
  Car,
  Home,
  Waves,
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Target,
  Key,
  ExternalLink,
  Zap,
  Info,
  Maximize2,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  User
} from 'lucide-react';
import { Lead, LeadStage, Contact, User as UserType, LeadNote, LeadHistory } from '../types';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../components/Modal';
import MultiSelect from '../components/MultiSelect';

const COMMUNITIES = [
  { id: 'keswick', name: 'Keswick' },
  { id: 'glenridding_heights', name: 'Glenridding Heights' },
  { id: 'glenridding_ravines', name: 'Glenridding Ravine' },
  { id: 'stillwater', name: 'Stillwater' },
  { id: 'edgemont', name: 'Edgemont' },
  { id: 'river_edge', name: 'River Edge' },
  { id: 'upland', name: 'Upland' },
  { id: 'rosenthal', name: 'Rosenthal' },
  { id: 'secord', name: 'Secord' },
  { id: 'kinglet', name: 'Kinglet Gardens' },
  { id: 'trumpeter', name: 'Trumpeter Area' },
  { id: 'starling', name: 'Starling' },
  { id: 'hawksridge', name: 'Hawks Ridge' },
  { id: 'alces', name: 'Alces' },
  { id: 'meltwater', name: 'Meltwater' },
  { id: 'mattson', name: 'Mattson' },
  { id: 'orchards', name: 'The Orchards At Ellerslie' },
  { id: 'walker', name: 'Walker' },
  { id: 'erin_ridge', name: 'Erin Ridge' },
  { id: 'nouveau', name: 'Nouveau' },
  { id: 'jensen_lakes', name: 'Jensen Lakes' },
  { id: 'cherot', name: 'Cherot' },
  { id: 'riverside', name: 'Riverside' },
  { id: 'cambrian', name: 'Cambrian' },
  { id: 'hearthstone', name: 'Hearthstone (Strathcona)' },
  { id: 'hillshire', name: 'Hillshire' },
];

const GARAGE_TYPES = [
  { id: 'double_attached', name: 'Double Garage Attached' },
  { id: 'double_detached', name: 'Double Garage Detached' },
  { id: 'single_attached', name: 'Single Garage Attached' },
  { id: 'single_detached', name: 'Single Garage Detached' },
  { id: 'triple_attached', name: 'Triple Garage Attached' },
  { id: 'triple_detached', name: 'Triple Garage Detached' },
  { id: 'no_garage_surface', name: 'No garage - Surface' },
  { id: 'no_garage_parking_pad', name: 'No garage - parking pad' },
];

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [history, setHistory] = useState<LeadHistory[]>([]);
  
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editData, setEditData] = useState({
    contactId: '',
    assignedAgentId: '',
    stageId: '',
    preferredCommunity: [] as string[],
    minBudget: '',
    maxBudget: '',
    minBeds: '',
    minBaths: '',
    minSize: '',
    preferredPropertyClass: '',
    preferredGarageType: [] as string[],
    preferredBuildingType: '',
    preferredPropertyStyle: '',
    wantsBasement: false,
    wantsSeparateEntrance: false,
    maxCondoFees: '',
    possessionTimeline: '',
    notes: '',
  });

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [l, c, s, u, n, h] = await Promise.all([
        api.leads.get(id).catch(() => null),
        api.contacts.list().catch(() => []),
        api.leadStages.list().catch(() => []),
        api.users.list().catch(() => []),
        api.leadNotes.list(id).catch(() => []),
        api.leadHistory.list(id).catch(() => [])
      ]);
      
      if (!l) {
        setLead(null);
        return;
      }

      setLead(l);
      setContacts(c);
      setStages(s);
      setUsers(u);
      setNotes(n.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setHistory(h.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()));
      setSelectedAgentId(l.assignedAgentId || '');
      
      setEditData({
        contactId: l.contactId,
        assignedAgentId: l.assignedAgentId || '',
        stageId: l.stageId,
        preferredCommunity: l.preferredCommunity || [],
        minBudget: l.minBudget?.toString() || '',
        maxBudget: l.maxBudget?.toString() || '',
        minBeds: l.minBeds?.toString() || '',
        minBaths: l.minBaths?.toString() || '',
        minSize: l.minSize?.toString() || '',
        preferredPropertyClass: l.preferredPropertyClass || '',
        preferredGarageType: l.preferredGarageType || [],
        preferredBuildingType: l.preferredBuildingType || '',
        preferredPropertyStyle: l.preferredPropertyStyle || '',
        wantsBasement: l.wantsBasement || false,
        wantsSeparateEntrance: l.wantsSeparateEntrance || false,
        maxCondoFees: l.maxCondoFees?.toString() || '',
        possessionTimeline: l.possessionTimeline || '',
        notes: l.notes || '',
      });
    } catch (err) {
      console.error("Error fetching lead data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignPrompt = () => {
    if (lead) {
      setSelectedAgentId(lead.assignedAgentId || '');
      setIsAssignModalOpen(true);
    }
  };

  const handleExecuteAssignment = async () => {
    if (!lead) return;
    setIsProcessing('assign');
    try {
      const updated = await api.leads.update(lead.id, { assignedAgentId: selectedAgentId || null });
      setLead(updated);
      setIsAssignModalOpen(false);
      fetchData(); // Refresh history
    } catch (err) {
      console.error(err);
      alert("Failed to synchronize assignment.");
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !lead) return;

    setIsSubmittingNote(true);
    try {
      const note = await api.leadNotes.create({
        leadId: lead.id,
        note: newNote,
        createdBy: 'u1', 
      });
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!lead || !confirm("Are you sure you want to terminate this lead? This action is irreversible.")) return;
    setIsProcessing('delete');
    try {
      await api.leads.delete(lead.id);
      navigate('/leads');
    } catch (err) {
      console.error(err);
      alert("Failed to terminate lead.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDuplicate = async () => {
    if (!lead) return;
    setIsProcessing('duplicate');
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...duplicateData } = lead;
      const created = await api.leads.create(duplicateData);
      navigate(`/leads/${created.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to clone lead.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConvertToDeal = async () => {
    if (!lead) return;
    setIsProcessing('convert');
    try {
      const [dealStages, allProperties] = await Promise.all([
        api.stages.list(),
        api.properties.list()
      ]);
      const initialStage = dealStages.sort((a, b) => a.order - b.order)[0];
      const defaultProperty = allProperties[0];
      
      if (!defaultProperty) {
        alert("No properties available to link. Transition failed.");
        return;
      }

      await api.deals.create({
        contactIds: [lead.contactId],
        value: lead.maxBudget || 0,
        stageId: initialStage.id,
        propertyIds: [defaultProperty.id],
      });

      await api.leads.delete(lead.id);
      navigate('/deals');
    } catch (err) {
      console.error(err);
      alert("Transition to deal failed.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setIsSubmittingEdit(true);
    try {
      const updated = await api.leads.update(lead.id, {
        contactId: editData.contactId,
        assignedAgentId: editData.assignedAgentId || undefined,
        stageId: editData.stageId,
        preferredCommunity: editData.preferredCommunity,
        minBudget: parseFloat(editData.minBudget) || undefined,
        maxBudget: parseFloat(editData.maxBudget) || undefined,
        minBeds: parseInt(editData.minBeds) || undefined,
        minBaths: parseFloat(editData.minBaths) || undefined,
        minSize: parseFloat(editData.minSize) || undefined,
        preferredPropertyClass: editData.preferredPropertyClass,
        preferredGarageType: editData.preferredGarageType,
        preferredBuildingType: editData.preferredBuildingType,
        preferredPropertyStyle: editData.preferredPropertyStyle,
        wantsBasement: editData.wantsBasement,
        wantsSeparateEntrance: editData.wantsSeparateEntrance,
        maxCondoFees: parseFloat(editData.maxCondoFees) || undefined,
        possessionTimeline: editData.possessionTimeline,
        notes: editData.notes,
      });
      setLead(updated);
      setIsEditModalOpen(false);
      fetchData(); // Refresh all data
    } catch (err) {
      console.error(err);
      alert("Failed to update lead.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 font-sans">
        <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Lead Data</span>
      </div>
    );
  }

  if (!lead) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950 p-8 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <Info size={32} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Lead Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-sm">The record you are looking for may have been moved or deleted from the pipeline.</p>
      <button onClick={() => navigate('/leads')} className="btn-secondary">
        <ArrowLeft size={18} /> Return to Pipeline
      </button>
    </div>
  );

  const contact = contacts.find(c => c.id === lead.contactId);
  const stage = stages.find(s => s.id === lead.stageId);
  const agent = users.find(u => u.id === lead.assignedAgentId);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* 1. Integrated Header Shell */}
      <header className="flex-none px-8 py-4 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/leads')}
              className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-500/50" />
                  <h1 className="text-xl font-bold text-white tracking-tight">{contact?.fullName}</h1>
                </div>
                <div className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                  stage?.name === 'Hot' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  stage?.name === 'Warm' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                  stage?.name === 'Cold' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {stage?.name || 'Lead'}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{contact?.type} Lead</span>
                <span className="text-slate-800">•</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={10} /> Active since {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => handleAssignPrompt()}
              disabled={!!isProcessing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-lg shadow-indigo-600/5 group disabled:opacity-50"
            >
              <UserCheck size={14} className={cn("group-hover:scale-110 transition-transform", isProcessing === 'assign' && "animate-pulse")} /> 
              <span className="hidden sm:inline">{isProcessing === 'assign' ? 'Assigning...' : 'Assign'}</span>
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              disabled={!!isProcessing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs font-bold text-slate-300 transition-all group disabled:opacity-50"
            >
              <Edit2 size={14} className="group-hover:rotate-12 transition-transform" /> <span className="hidden sm:inline">Edit</span>
            </button>
            <button 
              onClick={handleDuplicate}
              disabled={!!isProcessing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs font-bold text-slate-300 transition-all group disabled:opacity-50"
            >
              <Copy size={14} className={cn("group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform", isProcessing === 'duplicate' && "animate-spin")} /> 
              <span className="hidden sm:inline">{isProcessing === 'duplicate' ? 'Cloning...' : 'Duplicate'}</span>
            </button>
            <button 
              onClick={handleConvertToDeal}
              disabled={!!isProcessing}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-lg shadow-blue-600/20 group disabled:opacity-50"
            >
              <Zap size={14} className={cn("group-hover:scale-125 transition-transform fill-current", isProcessing === 'convert' && "animate-bounce")} /> 
              <span className="whitespace-nowrap">{isProcessing === 'convert' ? 'Processing...' : 'Convert'}</span>
            </button>
            <div className="hidden md:block w-px h-6 bg-white/10 mx-2" />
            <button 
              onClick={handleDelete}
              disabled={!!isProcessing}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all group disabled:opacity-50"
            >
              <Trash2 size={18} className={cn("group-hover:scale-110 transition-transform", isProcessing === 'delete' && "animate-pulse")} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto p-8 flex flex-col lg:flex-row gap-8">
          
          {/* 2. Main Content Grid (Left) */}
          <div className="flex-1 space-y-8">
            
            {/* Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Budget Range</p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-sm font-bold text-emerald-500">$</span>
                     <span className="text-xl font-black text-white">
                      {lead.minBudget?.toLocaleString()} - {lead.maxBudget?.toLocaleString()}
                     </span>
                  </div>
               </div>
               <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min. Living Space</p>
                  <p className="text-xl font-black text-white">
                    {lead.minSize?.toLocaleString() || '---'} 
                    <span className="text-[10px] font-bold text-slate-500 ml-1">SQFT</span>
                  </p>
               </div>
               <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Specs</p>
                  <p className="text-xl font-black text-white">{lead.minBeds || 0} Beds / {lead.minBaths || 0} Baths</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeline</p>
                  <p className="text-xl font-black text-amber-500 tracking-tight">{lead.possessionTimeline || 'Flexible'}</p>
               </div>
            </div>

            {/* Detailed Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900 shadow-xl border border-white/5 rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Target size={20} className="text-blue-500" />
                     </div>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Search Profile</h3>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Location Clusters</p>
                        <div className="flex flex-wrap gap-2.5">
                           {lead.preferredCommunity?.map(cid => (
                             <span key={cid} className="px-3 py-1.5 bg-slate-950 border border-white/10 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-2 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                                <MapPin size={12} className="opacity-50" />
                                {COMMUNITIES.find(c => c.id === cid)?.name}
                             </span>
                           )) || <span className="text-slate-600 italic text-sm">Flexible across regions</span>}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Property Mode</p>
                           <div className="flex items-center gap-2">
                              <Building size={14} className="text-slate-600" />
                              <p className="text-sm font-bold text-slate-200">{lead.preferredPropertyClass || 'Residential Specification'}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>                <div className="bg-card shadow-sm border border-border rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Home size={20} className="text-indigo-500" />
                     </div>
                     <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Asset Logistics</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="p-4 bg-muted border border-border rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                           <DollarSign size={16} className="text-muted-foreground" />
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">Condo Fees</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{lead.maxCondoFees ? `$${lead.maxCondoFees}/mo` : 'No Limit'}</p>
                     </div>
                     <div className="p-4 bg-muted border border-border rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                           <Key size={16} className="text-muted-foreground" />
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">Separate Entry</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{lead.wantsSeparateEntrance ? 'Yes' : 'Not Required'}</p>
                     </div>
                     <div className="p-4 bg-muted border border-border rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                           <Waves size={16} className="text-muted-foreground" />
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">Basement</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{lead.wantsBasement ? 'Developing Required' : 'No pref'}</p>
                     </div>
                     <div className="p-4 bg-muted border border-border rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                           <Car size={16} className="text-muted-foreground" />
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">Garage</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">
                           {lead.preferredGarageType && lead.preferredGarageType.length > 0 ? GARAGE_TYPES.find(gt => gt.id === lead.preferredGarageType?.[0])?.name : 'Any'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Interaction Stream & Notes */}
            <div className="bg-slate-900 shadow-xl border border-white/5 rounded-3xl overflow-hidden">
               <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <MessageSquare size={20} className="text-slate-500" />
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Intelligence Stream</h3>
                  </div>
               </div>
               
               <div className="p-8 space-y-10">
                  <form onSubmit={handleAddNote} className="relative">
                     <textarea 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Log internal update or memo..."
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[120px] resize-none transition-all placeholder:text-slate-700"
                     />
                     <div className="absolute bottom-4 right-4">
                        <button 
                           type="submit"
                           disabled={isSubmittingNote || !newNote.trim()}
                           className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                        >
                           {isSubmittingNote ? 'Saving' : 'Submit Log'}
                        </button>
                     </div>
                  </form>

                  <div className="space-y-8 relative">
                     <div className="absolute left-6 top-2 bottom-2 w-px bg-white/5" />
                     
                     {notes.length > 0 ? (
                        notes.map((n) => (
                           <div key={n.id} className="relative z-10 flex gap-6 group">
                              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all flex-shrink-0">
                                 {users.find(u => u.id === n.createdBy)?.fullName[0] || 'S'}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       {users.find(u => u.id === n.createdBy)?.fullName || 'Log System'}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-600 font-bold uppercase">
                                       {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                 </div>
                                 <div className="bg-white/5 p-5 rounded-2xl text-[13px] text-slate-400 font-light leading-relaxed group-hover:bg-white/[0.07] transition-all">
                                    {n.note}
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="text-center py-20 text-slate-800">
                           <MessageSquare size={48} className="mx-auto mb-4 opacity-5" />
                           <p className="text-xs font-bold uppercase tracking-[0.2em]">No engagement records logged.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>

          {/* 3. Contextual Sidebar (Right) */}
          <aside className="w-full lg:w-96 space-y-8">
             
             {/* Contact Focus Card */}
             <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-600/10 blur-[80px] pointer-events-none" />
                
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-2xl font-black text-blue-500 shadow-xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-all" />
                      <span className="relative">{contact?.fullName[0]}</span>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-white tracking-tight truncate">{contact?.fullName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border", contact?.type === 'buyer' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                          {contact?.type}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                   <a href={`mailto:${contact?.email}`} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group/item">
                      <Mail size={14} className="text-slate-500 group-hover/item:text-blue-400" />
                      <span className="text-xs text-slate-300 truncate">{contact?.email}</span>
                   </a>
                   <a href={`tel:${contact?.phoneNumber}`} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group/item">
                      <Phone size={14} className="text-slate-500 group-hover/item:text-blue-400" />
                      <span className="text-xs text-slate-300">{contact?.phoneNumber || 'No phone'}</span>
                   </a>
                   {contact?.company && (
                     <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-white/5">
                        <Briefcase size={14} className="text-slate-500" />
                        <span className="text-xs text-slate-300 truncate">{contact.company}</span>
                     </div>
                   )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-500">
                   <div className="space-y-1">
                      <p className="font-bold uppercase tracking-wider">Assigned</p>
                      <p className="text-slate-300 font-medium truncate">{users.find(u => u.id === contact?.assignedToId)?.fullName || 'Unassigned'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="font-bold uppercase tracking-wider">Created</p>
                      <p className="text-slate-300 font-medium">{contact?.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}</p>
                   </div>
                </div>

             </div>

             {/* Governance & Assignment */}
             <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl shadow-black/30 hover:border-indigo-500/20 transition-all duration-300">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck size={14} className="text-indigo-500" />
                   Accountability & Access
                </p>
                <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:bg-slate-950 transition-colors">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-sm font-black text-indigo-400 border border-indigo-500/10 shadow-inner">
                      <Briefcase size={18} />
                   </div>
                   <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate">{agent?.fullName || 'Pipeline Queue'}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Assigned Accountability</span>
                   </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-4 border-t border-white/5">
                   <span className="text-slate-500 inline-flex items-center gap-2 font-bold">
                     <CheckCircle2 size={14} className="text-emerald-500/70" /> 
                     Verified Access
                   </span>
                   <span className="text-emerald-500 font-black uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-md">Active</span>
                </div>
             </div>


          </aside>
        </div>
      </div>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Override Assignment"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10 space-y-2">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Target Personnel</p>
            <select
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">Unassigned (Queue)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteAssignment}
              className="px-8 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Sync Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Profile Engineering Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead"
      >
        <form onSubmit={handleUpdateLead} className="space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">Core Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Primary Contact</label>
                   <select
                     required
                     className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                     value={editData.contactId}
                     onChange={(e) => setEditData({ ...editData, contactId: e.target.value })}
                   >
                     {contacts.map(c => (
                       <option key={c.id} value={c.id}>{c.fullName}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Assigned Agent</label>
                   <select
                     className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                     value={editData.assignedAgentId}
                     onChange={(e) => setEditData({ ...editData, assignedAgentId: e.target.value })}
                   >
                     <option value="">Unassigned</option>
                     {users.map(u => (
                       <option key={u.id} value={u.id}>{u.fullName}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Lead Stage</label>
                   <select
                     required
                     className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                     value={editData.stageId}
                     onChange={(e) => setEditData({ ...editData, stageId: e.target.value })}
                   >
                     {stages.map(s => (
                       <option key={s.id} value={s.name}>{s.name}</option>
                     ))}
                   </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">Budget & Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Min Budget ($)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                      value={editData.minBudget}
                      onChange={(e) => setEditData({ ...editData, minBudget: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Max Budget ($)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                      value={editData.maxBudget}
                      onChange={(e) => setEditData({ ...editData, maxBudget: e.target.value })}
                    />
                </div>
              </div>
              <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Possession Timeline</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 3-6 months"
                      value={editData.possessionTimeline}
                      onChange={(e) => setEditData({ ...editData, possessionTimeline: e.target.value })}
                    />
              </div>
              <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Max Condo Fees ($)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max monthly fees"
                      value={editData.maxCondoFees}
                      onChange={(e) => setEditData({ ...editData, maxCondoFees: e.target.value })}
                    />
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">Property Preferences</h3>
              <MultiSelect 
                label="Preferred Communities"
                placeholder="Search communities..."
                options={COMMUNITIES}
                selectedIds={editData.preferredCommunity}
                onChange={(val) => setEditData({ ...editData, preferredCommunity: val })}
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Beds (Min)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                      value={editData.minBeds}
                      onChange={(e) => setEditData({ ...editData, minBeds: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Baths (Min)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                      value={editData.minBaths}
                      onChange={(e) => setEditData({ ...editData, minBaths: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Size (sqft)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                      value={editData.minSize}
                      onChange={(e) => setEditData({ ...editData, minSize: e.target.value })}
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Property Class</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.preferredPropertyClass}
                  onChange={(e) => setEditData({ ...editData, preferredPropertyClass: e.target.value })}
                >
                  <option value="">No preference</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Building Type</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Detached, Apartment"
                  value={editData.preferredBuildingType}
                  onChange={(e) => setEditData({ ...editData, preferredBuildingType: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight">Preferred Garage Types</label>
                    <MultiSelect 
                       label="Garage Types"
                       placeholder="Select garage options..."
                       options={GARAGE_TYPES}
                       selectedIds={editData.preferredGarageType}
                       onChange={(val) => setEditData({ ...editData, preferredGarageType: val })}
                    />
              </div>

              <div className="flex gap-6 pt-2">
                 <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <input type="checkbox" checked={editData.wantsBasement} onChange={(e) => setEditData({...editData, wantsBasement: e.target.checked})} />
                    Wants Basement
                 </label>
                 <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <input type="checkbox" checked={editData.wantsSeparateEntrance} onChange={(e) => setEditData({...editData, wantsSeparateEntrance: e.target.checked})} />
                    Wants Sep. Entrance
                 </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Enter any additional details about the lead's requirements..."
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900/95 py-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {isSubmittingEdit ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contact Intelligence Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Contact Intelligence"
      >
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 bg-slate-950 rounded-3xl border border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center text-3xl font-black text-blue-500 border border-blue-500/10">
              {contact?.fullName[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{contact?.fullName}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{contact?.type} Profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Digital Channel</p>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Mail size={14} className="text-blue-500/50" />
                <span className="font-medium">{contact?.email}</span>
              </div>
            </div>
            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Direct Line</p>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Phone size={14} className="text-blue-500/50" />
                <span className="font-medium">{contact?.phoneNumber || 'No mobile linked'}</span>
              </div>
            </div>
            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Organization</p>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Building size={14} className="text-blue-500/50" />
                <span className="font-medium">{contact?.company || 'Independently Operated'}</span>
              </div>
            </div>
            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">System Identity</p>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Info size={14} className="text-slate-700" />
                <span className="font-mono text-[10px]">UUID-{contact?.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl space-y-4">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> Data Stewardship
            </h4>
            <div className="grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <p className="text-slate-600 font-bold uppercase mb-1 tracking-tighter">Record Origin</p>
                <p className="text-slate-300">{contact?.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Historical Importer'}</p>
              </div>
              <div>
                <p className="text-slate-600 font-bold uppercase mb-1 tracking-tighter">Verification Profile</p>
                <p className="text-emerald-500 font-black uppercase">Standard Compliance</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="px-8 py-3 bg-slate-100 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
            >
              Acknowledge Records
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadDetail;
