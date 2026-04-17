import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon
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
  rectIntersection,
  getFirstCollision,
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
import { Deal, DealStage } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { Property, Contact } from '../types';

const SortableDealCard: React.FC<{ deal: Deal }> = ({ deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link to={`/deals/${deal.id}`} onClick={(e) => isDragging && e.preventDefault()}>
        <div 
          className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-3 cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-all group"
          style={{ touchAction: 'none' }}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">
              ID: {deal.id.slice(0, 4)}
            </span>
            <button className="text-slate-500 hover:text-white" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <MoreHorizontal size={16} />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white mb-2 group-hover:text-blue-400 transition-all">
            Property Deal #{deal.id.slice(-4)}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <DollarSign size={14} className="text-emerald-500" />
              <span className="font-medium text-slate-200">${deal.value?.toLocaleString() || "0"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={14} />
              <span>Added {new Date(deal.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1, 2].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                  {i === 1 ? 'JD' : 'AS'}
                </div>
              ))}
            </div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              2 Contacts
            </div>
          </div>
          <div className="mt-3">
            <Link 
              to={`/deals/${deal.id}`}
              className="w-full py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              View Full Listing
            </Link>
          </div>
        </div>
      </Link>
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

export default function Deals() {
  const [stages, setStages] = useState<DealStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newDealData, setNewDealData] = useState({
    propertyIds: [] as string[],
    contactIds: [] as string[],
    value: '',
    stageId: ''
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
        const [s, d, p, c] = await Promise.all([
          api.stages.list(), 
          api.deals.list(),
          api.properties.list(),
          api.contacts.list()
        ]);
        setStages(s.sort((a, b) => a.order - b.order));
        setDeals(d);
        setProperties(p);
        setContacts(c);
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

    const activeDeal = deals.find(d => d.id === activeId);
    if (!activeDeal) return;

    // Find the container (stage) of the over item
    const overStage = stages.find(s => s.id === overId);
    const overDeal = deals.find(d => d.id === overId);
    const newStageId = overStage ? overStage.id : overDeal?.stageId;

    if (newStageId && activeDeal.stageId !== newStageId) {
      setDeals(prev => {
        const activeIndex = prev.findIndex(d => d.id === activeId);
        const updatedDeals = [...prev];
        updatedDeals[activeIndex] = { ...activeDeal, stageId: newStageId };
        
        // If we are over another deal, we might want to reorder
        if (overDeal) {
          const overIndex = updatedDeals.findIndex(d => d.id === overId);
          return arrayMove(updatedDeals, activeIndex, overIndex);
        }
        
        return updatedDeals;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find(d => d.id === activeId);
    if (!activeDeal) return;

    const overStage = stages.find(s => s.id === overId);
    const overDeal = deals.find(d => d.id === overId);
    const newStageId = overStage ? overStage.id : overDeal?.stageId;

    if (newStageId) {
      if (activeDeal.stageId !== newStageId) {
        // This should have been handled by onDragOver for optimistic UI
        // but we ensure it's correct here
      }

      try {
        await api.deals.update(activeId, { stageId: newStageId });
      } catch (err) {
        console.error("Failed to update deal stage:", err);
      }
    }
  };

  const getDealsInStage = (stageId: string) => deals.filter(d => d.stageId === stageId);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDealData.propertyIds.length === 0 || !newDealData.stageId || newDealData.contactIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const created = await api.deals.create({
        propertyIds: newDealData.propertyIds,
        contactIds: newDealData.contactIds,
        stageId: newDealData.stageId,
        value: parseFloat(newDealData.value) || 0,
      });
      setDeals(prev => [...prev, created]);
      setIsNewDealModalOpen(false);
      setNewDealData({ propertyIds: [], contactIds: [], value: '', stageId: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Deals Pipeline</h1>
          <p className="text-slate-400 mt-1">Manage your active real estate opportunities.</p>
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
              setNewDealData(prev => ({ ...prev, stageId: stages[0]?.id || '' }));
              setIsNewDealModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Deal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Filter deals..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Kanban Board */}
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
                      {getDealsInStage(stage.id).length}
                    </span>
                  </div>
                  <button className="text-slate-500 hover:text-white">
                    <Plus size={18} />
                  </button>
                </div>
                <SortableContext 
                  id={stage.id}
                  items={getDealsInStage(stage.id).map(d => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={stage.id}>
                    {getDealsInStage(stage.id).map(deal => (
                      <SortableDealCard key={deal.id} deal={deal} />
                    ))}
                    {getDealsInStage(stage.id).length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm italic">
                        No deals here
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div className="bg-slate-800 border border-blue-500 p-4 rounded-xl shadow-2xl w-80 opacity-90">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">
                  ID: {activeDeal.id.slice(0, 4)}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2">
                Property Deal #{activeDeal.id.slice(-4)}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span className="font-medium text-slate-200">${activeDeal.value?.toLocaleString() || "0"}</span>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Deal Modal */}
      <Modal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
        title="Create New Deal"
      >
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Properties</label>
            <select
              multiple
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={newDealData.propertyIds}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                setNewDealData({ ...newDealData, propertyIds: values });
              }}
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.address}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Contacts</label>
            <select
              multiple
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={newDealData.contactIds}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                setNewDealData({ ...newDealData, contactIds: values });
              }}
            >
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Deal Value ($)</label>
            <input
              type="number"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 850000"
              value={newDealData.value}
              onChange={(e) => setNewDealData({ ...newDealData, value: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Stage</label>
            <select
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newDealData.stageId}
              onChange={(e) => setNewDealData({ ...newDealData, stageId: e.target.value })}
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsNewDealModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
