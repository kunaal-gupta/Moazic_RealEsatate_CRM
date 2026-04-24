import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  User as UserIcon,
  Briefcase,
  Trash2,
  Edit2,
  MapPin,
  Car,
  Home,
  UserCheck,
  Building,
  Zap,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../lib/api';
import { Lead, LeadStage, Contact, User as UserType } from '../types';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
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

const SortableLeadCard: React.FC<{ 
  lead: Lead, 
  contactName: string,
  stageName?: string,
  agentName?: string,
  onConvert: (lead: Lead) => void,
  onDelete: (id: string) => void,
  onEdit: (lead: Lead) => void,
  onDuplicate: (lead: Lead) => void,
  onAssign: (leadIds: string[]) => void,
  onClick: (id: string) => void,
  isSelected: boolean,
  onSelect: (id: string, selected: boolean) => void
}> = ({ lead, contactName, stageName, agentName, onConvert, onDelete, onEdit, onDuplicate, onAssign, onClick, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const communitiesLabel = lead.preferredCommunity?.length 
    ? (lead.preferredCommunity.length > 2 
        ? 'Multiple' 
        : lead.preferredCommunity.map(cid => COMMUNITIES.find(c => c.id === cid)?.name).join(', '))
    : 'Open';

  const leadProperties = (lead as any).propertyDetails || [];

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(lead.id)}>
      <div 
        className={cn(
          "bg-slate-900 border p-5 rounded-2xl mb-4 cursor-pointer transition-all group relative",
          isSelected ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/20"
        )}
        style={{ touchAction: 'none' }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                stageName === 'Hot' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                stageName === 'Warm' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                stageName === 'Cold' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-slate-800 text-slate-500 border-slate-700"
              )}>
                {stageName || 'Pipeline'}
              </span>
              <span className="text-[10px] font-mono text-slate-600">ID: {lead.id.slice(0, 4)}</span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
              {contactName}
            </h4>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div 
              className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                isSelected ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/30" : "bg-slate-950 border-white/10 group-hover:border-white/20"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(lead.id, !isSelected);
              }}
            >
              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <div className="relative">
              <button 
                className="text-slate-700 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-white/10 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden ring-1 ring-white/5 shadow-black/50" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-all"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConvert(lead); setShowMenu(false); }}
                  >
                    <Zap size={12} /> Activate
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-all"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(lead); setShowMenu(false); }}
                  >
                    <Edit2 size={12} /> Edit Detail
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-all"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAssign([lead.id]); setShowMenu(false); }}
                  >
                    <UserCheck size={12} /> Assign Agent
                  </button>
                  <div className="h-px bg-white/5 mx-2 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-3 transition-all"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(lead.id); setShowMenu(false); }}
                  >
                    <Trash2 size={12} /> Terminate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
 
        <div className="space-y-4">

           <div className="space-y-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="w-full flex items-center justify-between py-2 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
              >
                {isExpanded ? 'Hide Parameters' : 'View Parameters'}
                <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
              </button>

              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="grid grid-cols-2 gap-5 px-1 pb-2"
                >
                  <div className="col-span-2 space-y-1">
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Budget</p>
                     <div className="text-sm font-bold text-emerald-400 tracking-tight font-mono">
                        {lead.minBudget ? `$${(Number(lead.minBudget)/1000).toLocaleString()}k` : '$0'} 
                        <span className="mx-2 text-slate-700 font-sans font-normal">–</span> 
                        {lead.maxBudget ? `$${(Number(lead.maxBudget)/1000).toLocaleString()}k` : '--'}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Parameters</p>
                     <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                        <Home size={14} className="text-slate-700" />
                        <span>{lead.minBeds || 0} Beds / {lead.minBaths || 0} Baths</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Asset Category</p>
                     <div className="flex items-center gap-2 text-xs text-slate-200 font-medium truncate">
                        <Building size={14} className="text-slate-700" />
                        <span className="truncate">{lead.preferredPropertyClass || 'Standard'}</span>
                     </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Priority Regions</p>
                     <div className="flex items-center gap-2 text-xs text-blue-400/80 font-medium">
                        <MapPin size={14} className="text-blue-500/20" />
                        <span className="truncate">{communitiesLabel}</span>
                     </div>
                  </div>
                </motion.div>
              )}
           </div>

           {leadProperties.length > 0 && (
             <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Matched Properties</p>
                <div className="flex flex-col gap-2">
                  {leadProperties.map((p: any) => (
                    <div key={p.id} className="flex flex-col p-2.5 rounded-lg bg-slate-950/50 border border-white/5 hover:border-blue-500/30 transition-colors">
                      <div className="flex items-start justify-between">
                         <span className="text-xs font-bold text-slate-200">{p.address}</span>
                         <span className="text-[10px] font-mono text-emerald-400 font-bold">${p.price?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-white/5">
                           <Home size={10} />
                           <span>{p.beds || 0} Beds / {p.baths || 0} Baths</span>
                        </div>
                        <div className="px-1.5 py-0.5 rounded bg-white/5">
                          {p.community}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
 
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/10 flex items-center justify-center text-[11px] font-black text-blue-500 uppercase">
               {agentName ? agentName[0] : '?'}
             </div>
             <div className="flex flex-col">
               <span className="text-xs text-slate-300 font-bold tracking-tight">
                 {agentName || 'Queue'}
               </span>
               <span className="text-[9px] text-slate-600 uppercase font-medium tracking-widest leading-none">Assignment</span>
             </div>
           </div>
           <div className="flex items-center gap-1.5 text-slate-700 text-[10px] font-mono">
              <Calendar size={12} className="opacity-50" />
              <span>{new Date(lead.updatedAt).toLocaleDateString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const DroppableColumn: React.FC<{ id: string, children: React.ReactNode }> = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto custom-scrollbar min-h-[150px]">
      {children}
    </div>
  );
};

export default function Leads() {
  const navigate = useNavigate();
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  // ... (some state hooks)

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [assigningLeadIds, setAssigningLeadIds] = useState<string[]>([]);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [newLeadData, setNewLeadData] = useState({
    contactId: '',
    assignedAgentId: '',
    stageId: '',
    propertyIds: [] as string[],
    preferredCommunity: [] as string[],
    minBudget: '',
    maxBudget: '',
    minBeds: '',
    minBaths: '',
    minSize: '',
    preferredPropertyClass: '',
    preferredBuildingType: '',
    preferredPropertyStyle: '',
    preferredGarageType: [] as string[],
    wantsBasement: false,
    wantsSeparateEntrance: false,
    maxCondoFees: '',
    possessionTimeline: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, l, c, u, props] = await Promise.all([
          api.leadStages.list(), 
          api.leads.list(),
          api.contacts.list(),
          api.users.list(),
          api.properties.list()
        ]);
        setStages(s.sort((a, b) => a.order - b.order));
        setLeads(l);
        setContacts(c);
        setUsers(u);
        setProperties(props);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeLead = leads.find(l => l.id === activeId);
    if (!activeLead) return;

    const overStage = stages.find(s => s.id === overId);
    const overLead = leads.find(l => l.id === overId);
    const newStageId = overStage ? overStage.id : overLead?.stageId;

    if (newStageId && activeLead.stageId !== newStageId) {
      setLeads(prev => {
        const activeIndex = prev.findIndex(l => l.id === activeId);
        const updatedLeads = [...prev];
        updatedLeads[activeIndex] = { ...activeLead, stageId: newStageId };
        
        if (overLead) {
          const overIndex = updatedLeads.findIndex(l => l.id === overId);
          return arrayMove(updatedLeads, activeIndex, overIndex);
        }
        
        return updatedLeads;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeLead = leads.find(l => l.id === activeId);
    if (!activeLead) return;

    const overStage = stages.find(s => s.id === overId);
    const overLead = leads.find(l => l.id === overId);
    const newStageId = overStage ? overStage.id : overLead?.stageId;

    if (newStageId) {
      try {
        await api.leads.update(activeId, { stageId: newStageId });
      } catch (err) {
        console.error("Failed to update lead stage:", err);
      }
    }
  };

  const getLeadsInStage = (stageId: string) => leads.filter(l => l.stageId === stageId);
  const getContactName = (contactId: string) => contacts.find(c => c.id === contactId)?.fullName || "Unknown Contact";

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadData.contactId || !newLeadData.stageId) return;

    setIsSubmitting(true);
    try {
      const leadPayload = {
        contactId: newLeadData.contactId,
        assignedAgentId: newLeadData.assignedAgentId || undefined,
        stageId: newLeadData.stageId,
        preferredCommunity: newLeadData.preferredCommunity,
        minBudget: parseFloat(newLeadData.minBudget) || undefined,
        maxBudget: parseFloat(newLeadData.maxBudget) || undefined,
        minBeds: parseInt(newLeadData.minBeds) || undefined,
        minBaths: parseFloat(newLeadData.minBaths) || undefined,
        minSize: parseFloat(newLeadData.minSize) || undefined,
        preferredPropertyClass: newLeadData.preferredPropertyClass,
        preferredBuildingType: newLeadData.preferredBuildingType,
        preferredPropertyStyle: newLeadData.preferredPropertyStyle,
        preferredGarageType: newLeadData.preferredGarageType,
        wantsBasement: newLeadData.wantsBasement,
        wantsSeparateEntrance: newLeadData.wantsSeparateEntrance,
        maxCondoFees: parseFloat(newLeadData.maxCondoFees) || undefined,
        possessionTimeline: newLeadData.possessionTimeline,
        notes: newLeadData.notes,
      };

      if (editingLeadId) {
        const updated = await api.leads.update(editingLeadId, leadPayload);
        setLeads(prev => prev.map(l => l.id === editingLeadId ? updated : l));
        alert("Lead updated successfully!");
      } else {
        const created = await api.leads.create(leadPayload);
        setLeads(prev => [...prev, created]);
        alert("Lead created successfully!");
      }
      
      setIsNewLeadModalOpen(false);
      setEditingLeadId(null);
      setNewLeadData({
        contactId: '',
        assignedAgentId: '',
        stageId: '',
        preferredCommunity: [],
        minBudget: '',
        maxBudget: '',
        minBeds: '',
        minBaths: '',
        minSize: '',
        preferredPropertyClass: '',
        preferredBuildingType: '',
        preferredPropertyStyle: '',
        preferredGarageType: [],
        wantsBasement: false,
        wantsSeparateEntrance: false,
        maxCondoFees: '',
        possessionTimeline: '',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setNewLeadData({
      contactId: lead.contactId,
      assignedAgentId: lead.assignedAgentId || '',
      stageId: lead.stageId,
      preferredCommunity: lead.preferredCommunity || [],
      minBudget: lead.minBudget?.toString() || '',
      maxBudget: lead.maxBudget?.toString() || '',
      minBeds: lead.minBeds?.toString() || '',
      minBaths: lead.minBaths?.toString() || '',
      minSize: lead.minSize?.toString() || '',
      preferredPropertyClass: lead.preferredPropertyClass || '',
      preferredBuildingType: lead.preferredBuildingType || '',
      preferredPropertyStyle: lead.preferredPropertyStyle || '',
      preferredGarageType: lead.preferredGarageType || [],
      wantsBasement: lead.wantsBasement || false,
      wantsSeparateEntrance: lead.wantsSeparateEntrance || false,
      maxCondoFees: lead.maxCondoFees?.toString() || '',
      possessionTimeline: lead.possessionTimeline || '',
      notes: lead.notes || '',
    });
    setIsNewLeadModalOpen(true);
  };

  const handleDuplicateLead = async (lead: Lead) => {
    try {
      const { id, createdAt, updatedAt, ...duplicateData } = lead;
      const created = await api.leads.create(duplicateData);
      setLeads(prev => [...prev, created]);
      alert("Lead duplicated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to duplicate lead.");
    }
  };

  const handleConvertToDeal = async (lead: Lead) => {
    try {
      const [dealStages, allProperties] = await Promise.all([
        api.stages.list(),
        api.properties.list()
      ]);
      const initialStage = dealStages.sort((a, b) => a.order - b.order)[0];
      const defaultProperty = allProperties[0];
      
      if (!defaultProperty) {
        alert("No properties available to link the deal to. Please create a property first.");
        return;
      }

      // Create deal
      await api.deals.create({
        contactIds: [lead.contactId],
        value: lead.maxBudget || 0,
        stageId: initialStage.id,
        propertyIds: [defaultProperty.id],
      });

      // Delete lead
      await api.leads.delete(lead.id);

      // Update local state
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      
      alert("Lead converted to deal successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.leads.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      setSelectedLeadIds(prev => prev.filter(lid => lid !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPrompt = (leadIds: string[]) => {
    setAssigningLeadIds(leadIds);
    setIsAssignModalOpen(true);
  };

  const handleExecuteAssignment = async () => {
    if (!selectedAgentId && assigningLeadIds.length > 0) {
      // If none selected, we might want to allow unassigning
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        assigningLeadIds.map(id => api.leads.update(id, { assignedAgentId: selectedAgentId || null }))
      );
      
      const updatedLeads = await api.leads.list();
      setLeads(updatedLeads);
      setIsAssignModalOpen(false);
      setSelectedLeadIds([]);
      setAssigningLeadIds([]);
      setSelectedAgentId('');
      alert(`Successfully assigned ${assigningLeadIds.length} lead(s).`);
    } catch (err) {
      console.error(err);
      alert("Failed to assign leads.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectLead = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedLeadIds(prev => [...prev, id]);
    } else {
      setSelectedLeadIds(prev => prev.filter(lid => lid !== id));
    }
  };

  const toggleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLeadIds(leads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Leads Pipeline</h1>
          <p className="text-slate-400 mt-1">Manage and nurture potential acquisitions</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-slate-900 border border-white/5 rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => setView('kanban')}
              className={cn("p-1.5 rounded-lg transition-all", view === 'kanban' ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-1.5 rounded-lg transition-all", view === 'list' ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
            >
              <ListIcon size={16} />
            </button>
          </div>
          <button 
            onClick={() => {
              setNewLeadData(prev => ({ ...prev, stageId: stages[0]?.id || '' }));
              setIsNewLeadModalOpen(true);
            }}
            className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" 
            placeholder="Search within pipeline..." 
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-700"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
          <Filter size={14} /> Refine View
        </button>
      </div>

      {/* View Content */}
      {view === 'kanban' ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-6 h-full min-w-max">
              {stages.map(stage => (
                <div key={stage.id} className="w-80 flex flex-col bg-white/[0.01] border border-white/[0.04] rounded-3xl overflow-hidden self-stretch shadow-2xl">
                  <div className="p-5 flex justify-between items-center border-b border-white/5 bg-slate-900/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h3 className="font-bold text-slate-200">{stage.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-white/5 text-[10px] font-bold text-slate-500 tabular-nums">
                        {getLeadsInStage(stage.id).length}
                      </span>
                    </div>
                    <button 
                      className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      onClick={() => {
                        setNewLeadData(prev => ({ ...prev, stageId: stage.id }));
                        setIsNewLeadModalOpen(true);
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <SortableContext 
                    id={stage.id}
                    items={getLeadsInStage(stage.id).map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn id={stage.id}>
                      {getLeadsInStage(stage.id).map(lead => {
                        const leadStage = stages.find(s => s.id === lead.stageId);
                        const agent = users.find(u => u.id === lead.assignedAgentId);
                        const matchedProperties = properties.filter(p => lead.propertyIds?.includes(p.id));
                        return (
                          <SortableLeadCard 
                            key={lead.id} 
                            lead={{...lead, propertyDetails: matchedProperties} as any}
                            contactName={getContactName(lead.contactId)}
                            stageName={leadStage?.name}
                            agentName={agent?.fullName}
                            onConvert={handleConvertToDeal}
                            onDelete={handleDeleteLead}
                            onEdit={handleEditLead}
                            onDuplicate={handleDuplicateLead}
                            onAssign={handleAssignPrompt}
                            onClick={(id) => navigate(`/leads/${id}`)}
                            isSelected={selectedLeadIds.includes(lead.id)}
                            onSelect={toggleSelectLead}
                          />
                        );
                      })}
                      {getLeadsInStage(stage.id).length === 0 && (
                        <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm italic">
                          No leads here
                        </div>
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </div>
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeLead ? (
              <div className="bg-slate-900 border border-blue-500/50 p-5 rounded-2xl shadow-2xl w-80 opacity-90 rotate-2 scale-105 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                         {stages.find(s => s.id === activeLead.stageId)?.name || 'Pipeline'}
                       </span>
                       <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">#{activeLead.id.slice(0, 4)}</span>
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight leading-tight">
                      {getContactName(activeLead.contactId)}
                    </h4>
                  </div>
                </div>
                
                
                <div className="grid grid-cols-2 gap-4 px-1">
                   <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                      <Home size={12} className="text-slate-700" />
                      <span>{activeLead.minBeds || 0} Beds / {activeLead.minBaths || 0} Baths</span>
                   </div>
                   <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium truncate">
                      <Building size={12} className="text-slate-700" />
                      <span className="truncate">{activeLead.preferredPropertyClass || 'Open'}</span>
                   </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex-1 overflow-hidden bg-white/[0.01] rounded-3xl border border-white/5">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 bg-slate-950 z-10">
                <tr className="border-b border-white/5">
                  <th className="p-4 w-10">
                    <div 
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer",
                        selectedLeadIds.length === leads.length && leads.length > 0 ? "bg-blue-500 border-blue-500" : "bg-slate-950 border-white/10"
                      )}
                      onClick={() => toggleSelectAll(selectedLeadIds.length !== leads.length)}
                    >
                      {selectedLeadIds.length === leads.length && leads.length > 0 && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Budget Range</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Regions</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Specs</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Timeline</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Associate</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const stage = stages.find(s => s.id === lead.stageId);
                  const agent = users.find(u => u.id === lead.assignedAgentId);
                  const contactName = getContactName(lead.contactId);
                  const communitiesLabel = lead.preferredCommunity?.length 
                    ? (lead.preferredCommunity.length > 2 
                        ? 'Multiple' 
                        : lead.preferredCommunity.map(cid => COMMUNITIES.find(c => c.id === cid)?.name).join(', '))
                    : 'Flexible';

                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={lead.id} 
                      className={cn(
                        "border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group cursor-pointer",
                        selectedLeadIds.includes(lead.id) && "bg-blue-500/5"
                      )}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div 
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer",
                            selectedLeadIds.includes(lead.id) ? "bg-blue-500 border-blue-500" : "bg-slate-950 border-white/10"
                          )}
                          onClick={() => toggleSelectLead(lead.id, !selectedLeadIds.includes(lead.id))}
                        >
                          {selectedLeadIds.includes(lead.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-[10px] font-bold text-blue-500 border border-blue-500/10">
                            <UserIcon size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{contactName}</p>
                            <p className="text-xs font-mono text-slate-500">#{lead.id.slice(0, 4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-widest border inline-block ring-1 ring-inset ring-white/5",
                          stage?.name === 'Hot' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          stage?.name === 'Warm' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          stage?.name === 'Cold' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-slate-800 text-slate-500 border-slate-700"
                        )}>
                          {stage?.name || 'Lead'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-mono font-bold text-emerald-500">
                          {lead.minBudget ? `$${(lead.minBudget/1000).toFixed(0)}k` : '0'}–{lead.maxBudget ? `$${(lead.maxBudget/1000).toFixed(0)}k` : '--'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold text-slate-400">
                          {communitiesLabel}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-bold text-slate-300 whitespace-nowrap">{lead.minBeds || 0} Beds / {lead.minBaths || 0} Baths</span>
                           <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{lead.preferredPropertyClass || 'Resi'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{lead.possessionTimeline || 'Flexible'}</span>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/10">
                             <ShieldCheck size={10} />
                           </div>
                           <span className="text-[10px] text-slate-500 font-bold truncate max-w-[80px]">
                             {agent?.fullName || 'Unassigned'}
                           </span>
                         </div>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            onClick={() => handleAssignPrompt([lead.id])}
                            title="Assign Agent"
                          >
                            <UserCheck size={12} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            onClick={() => handleConvertToDeal(lead)}
                          >
                            <Zap size={12} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            onClick={() => handleEditLead(lead)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            onClick={() => handleDeleteLead(lead.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                      No leads found match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedLeadIds.length > 0 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-blue-500/30 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {selectedLeadIds.length}
            </div>
            <div>
              <p className="text-[11px] font-bold text-white uppercase tracking-widest">Leads Selected</p>
              <button 
                onClick={() => setSelectedLeadIds([])}
                className="text-[10px] text-slate-500 hover:text-blue-400 font-bold"
              >
                Clear Selection
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleAssignPrompt(selectedLeadIds)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <UserCheck size={14} /> Assign Agent
            </button>
            <button 
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) {
                  Promise.all(selectedLeadIds.map(id => api.leads.delete(id)))
                    .then(() => {
                      setLeads(prev => prev.filter(l => !selectedLeadIds.includes(l.id)));
                      setSelectedLeadIds([]);
                    });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 size={14} /> Bulk Delete
            </button>
          </div>
        </motion.div>
      )}

      {/* New/Edit Lead Modal */}
      <Modal
        isOpen={isNewLeadModalOpen}
        onClose={() => {
          setIsNewLeadModalOpen(false);
          setEditingLeadId(null);
        }}
        title={editingLeadId ? "Edit Lead" : "Create New Lead"}
      >
        <form onSubmit={handleCreateLead} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Essential Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Core Information</h3>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Primary Contact</label>
                <select
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeadData.contactId}
                  onChange={(e) => setNewLeadData({ ...newLeadData, contactId: e.target.value })}
                >
                  <option value="">Select a contact</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Assigned Agent</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeadData.assignedAgentId}
                  onChange={(e) => setNewLeadData({ ...newLeadData, assignedAgentId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Lead Stage</label>
                <select
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeadData.stageId}
                  onChange={(e) => setNewLeadData({ ...newLeadData, stageId: e.target.value })}
                >
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Budget & Timeline</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min Budget ($)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                    value={newLeadData.minBudget}
                    onChange={(e) => setNewLeadData({ ...newLeadData, minBudget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Max Budget ($)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Max"
                    value={newLeadData.maxBudget}
                    onChange={(e) => setNewLeadData({ ...newLeadData, maxBudget: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Possession Timeline</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 3-6 months"
                  value={newLeadData.possessionTimeline}
                  onChange={(e) => setNewLeadData({ ...newLeadData, possessionTimeline: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Max Condo Fees ($)</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max monthly fees"
                  value={newLeadData.maxCondoFees}
                  onChange={(e) => setNewLeadData({ ...newLeadData, maxCondoFees: e.target.value })}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Property Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <MultiSelect 
                  label="Preferred Communities"
                  placeholder="Search communities..."
                  options={COMMUNITIES}
                  selectedIds={newLeadData.preferredCommunity}
                  onChange={(ids) => setNewLeadData({ ...newLeadData, preferredCommunity: ids })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Beds</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                    value={newLeadData.minBeds}
                    onChange={(e) => setNewLeadData({ ...newLeadData, minBeds: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Baths</label>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                    value={newLeadData.minBaths}
                    onChange={(e) => setNewLeadData({ ...newLeadData, minBaths: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Size (sqft)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                    value={newLeadData.minSize}
                    onChange={(e) => setNewLeadData({ ...newLeadData, minSize: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Property Class</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLeadData.preferredPropertyClass}
                  onChange={(e) => setNewLeadData({ ...newLeadData, preferredPropertyClass: e.target.value })}
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
                  value={newLeadData.preferredBuildingType}
                  onChange={(e) => setNewLeadData({ ...newLeadData, preferredBuildingType: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect 
                label="Preferred Garage Types"
                placeholder="Select garage options..."
                options={GARAGE_TYPES}
                selectedIds={newLeadData.preferredGarageType}
                onChange={(ids) => setNewLeadData({ ...newLeadData, preferredGarageType: ids })}
              />
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  checked={newLeadData.wantsBasement}
                  onChange={(e) => setNewLeadData({ ...newLeadData, wantsBasement: e.target.checked })}
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Wants Basement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  checked={newLeadData.wantsSeparateEntrance}
                  onChange={(e) => setNewLeadData({ ...newLeadData, wantsSeparateEntrance: e.target.checked })}
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Wants Sep. Entrance</span>
              </label>
            </div>
          </div>

          <hr className="border-slate-800" />

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Enter any additional details about the lead's requirements..."
              value={newLeadData.notes}
              onChange={(e) => setNewLeadData({ ...newLeadData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900/95 py-4">
            <button
              type="button"
              onClick={() => setIsNewLeadModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? 'Processing...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Agent"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-400 mb-4">
              Select an agent to assign to {assigningLeadIds.length === 1 ? "the selected lead" : `${assigningLeadIds.length} selected leads`}.
            </p>
            <label className="block text-sm font-medium text-slate-400 mb-1">Associate Agent</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">Unassign / Pipeline Queue</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteAssignment}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              {isSubmitting ? "Assigning..." : <>Confirm Assignment</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
