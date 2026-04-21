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
  MapPin,
  Car
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
import { Lead, LeadStage, Contact, User } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
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
  onConvert: (lead: Lead) => void,
  onDelete: (id: string) => void
}> = ({ lead, contactName, onConvert, onDelete }) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div 
        className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl mb-4 cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-all group relative shadow-lg shadow-black/20"
        style={{ touchAction: 'none' }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
              #{lead.id.slice(0, 4)}
            </span>
            {lead.preferredCommunity && lead.preferredCommunity.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50">
                {COMMUNITIES.find(c => c.id === lead.preferredCommunity?.[0])?.name}
                {lead.preferredCommunity.length > 1 && ` +${lead.preferredCommunity.length - 1}`}
              </span>
            )}
          </div>
          <div className="relative">
            <button 
              className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors" 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-20 py-1.5 backdrop-blur-xl bg-opacity-95 overflow-hidden">
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 flex items-center gap-2 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onConvert(lead);
                    setShowMenu(false);
                  }}
                >
                  <Briefcase size={14} />
                  Convert to Deal
                </button>
                <div className="h-px bg-slate-800 mx-2 my-1" />
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(lead.id);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 size={14} />
                  Delete Lead
                </button>
              </div>
            )}
          </div>
        </div>

        <h4 className="text-base font-bold text-white mb-3 group-hover:text-blue-400 transition-all">
          {contactName}
        </h4>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Budget Range</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
              <DollarSign size={12} className="opacity-70" />
              <span>
                {lead.maxBudget ? `$${(lead.maxBudget / 1000).toFixed(0)}k` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Timeline</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar size={12} className="opacity-70" />
              <span className="truncate">{lead.possessionTimeline || 'Flexible'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Property Specs</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="text-white font-bold">{lead.minBeds || 0}</span>B
              <span className="opacity-30">•</span>
              <span className="text-white font-bold">{lead.minBaths || 0}</span>Ba
              <span className="opacity-30">•</span>
              <span className="text-white font-bold">{lead.minSize ? `${(lead.minSize / 1000).toFixed(1)}k` : '0'}</span>sqft
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Garage Req.</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Car size={12} className="opacity-70" />
              <span className="truncate">
                {lead.preferredGarageType && lead.preferredGarageType.length > 0 
                  ? GARAGE_TYPES.find(gt => gt.id === lead.preferredGarageType?.[0])?.name.split(' ')[0] 
                  : 'Any'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
              {contactName[0]}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Added {new Date(lead.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex -space-x-1.5">
             <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <UserIcon size={10} className="text-slate-500" />
             </div>
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
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
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
        const [s, l, c, u] = await Promise.all([
          api.leadStages.list(), 
          api.leads.list(),
          api.contacts.list(),
          api.users.list()
        ]);
        setStages(s.sort((a, b) => a.order - b.order));
        setLeads(l);
        setContacts(c);
        setUsers(u);
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
      const created = await api.leads.create({
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
      });
      setLeads(prev => [...prev, created]);
      setIsNewLeadModalOpen(false);
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
    } finally {
      setIsSubmitting(false);
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
    } catch (err) {
      console.error(err);
    }
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Leads Pipeline</h1>
          <p className="text-slate-400 mt-1">Nurture your potential clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setView('kanban')}
              className={cn("p-2 rounded-md transition-all", view === 'kanban' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-2 rounded-md transition-all", view === 'list' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
            >
              <ListIcon size={18} />
            </button>
          </div>
          <button 
            onClick={() => {
              setNewLeadData(prev => ({ ...prev, stageId: stages[0]?.id || '' }));
              setIsNewLeadModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Filter leads..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
          <Filter size={16} /> Filters
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
                <div key={stage.id} className="w-80 flex flex-col bg-slate-900/30 rounded-2xl border border-slate-800/50">
                  <div className="p-4 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-200">{stage.name}</h3>
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {getLeadsInStage(stage.id).length}
                      </span>
                    </div>
                    <button className="text-slate-500 hover:text-white">
                      <Plus size={18} />
                    </button>
                  </div>
                  <SortableContext 
                    id={stage.id}
                    items={getLeadsInStage(stage.id).map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn id={stage.id}>
                      {getLeadsInStage(stage.id).map(lead => (
                        <SortableLeadCard 
                          key={lead.id} 
                          lead={lead} 
                          contactName={getContactName(lead.contactId)}
                          onConvert={handleConvertToDeal}
                          onDelete={handleDeleteLead}
                        />
                      ))}
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
              <div className="bg-slate-800 border border-blue-500 p-4 rounded-xl shadow-2xl w-80 opacity-90">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">
                    ID: {activeLead.id.slice(0, 4)}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-3">
                  {getContactName(activeLead.contactId)}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Budget Max</span>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                      <DollarSign size={12} className="opacity-70" />
                      <span>{activeLead.maxBudget ? `$${activeLead.maxBudget.toLocaleString()}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex-1 overflow-hidden bg-slate-900/30 rounded-2xl border border-slate-800">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-slate-800">
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead Name</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stage</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Community</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Criteria</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Budget</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Created</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const stage = stages.find(s => s.id === lead.stageId);
                  const contactName = getContactName(lead.contactId);
                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={lead.id} 
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-400">
                            {contactName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{contactName}</p>
                            <p className="text-[10px] text-slate-500">ID: #{lead.id.slice(0, 4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                          stage?.name === 'Hot' ? "bg-red-500/10 text-red-400" :
                          stage?.name === 'Warm' ? "bg-orange-500/10 text-orange-400" :
                          stage?.name === 'Cold' ? "bg-blue-500/10 text-blue-400" :
                          "bg-slate-800 text-slate-400"
                        )}>
                          {stage?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-slate-300 font-medium">
                          {lead.preferredCommunity && lead.preferredCommunity.length > 0 
                            ? (lead.preferredCommunity.length === 1 
                                ? COMMUNITIES.find(c => c.id === lead.preferredCommunity?.[0])?.name
                                : `${COMMUNITIES.find(c => c.id === lead.preferredCommunity?.[0])?.name} (+${lead.preferredCommunity.length - 1})`)
                            : '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400">
                            {lead.minBeds || 0}b / {lead.minBaths || 0}ba
                          </span>
                          {lead.minSize && <span className="text-[10px] text-slate-500">{lead.minSize} sqft</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-mono font-bold text-emerald-500">
                            ${lead.maxBudget?.toLocaleString()}
                          </span>
                          {lead.minBudget && <span className="text-[10px] text-slate-500">From ${lead.minBudget.toLocaleString()}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                            title="Convert to Deal"
                            onClick={() => handleConvertToDeal(lead)}
                          >
                            <Briefcase size={14} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                            title="Delete Lead"
                            onClick={() => handleDeleteLead(lead.id)}
                          >
                            <Trash2 size={14} />
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

      {/* New Lead Modal */}
      <Modal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        title="Create New Lead"
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
    </div>
  );
}
