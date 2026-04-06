import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User as UserIcon,
  Search,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { api } from '../lib/api';
import { Deal, DealStage } from '../types';
import { cn } from '../lib/utils';

import { Link } from 'react-router-dom';

const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => (
  <Link to={`/deals/${deal.id}`}>
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-3 cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">
          ID: {deal.id.slice(0, 4)}
        </span>
        <button className="text-slate-500 hover:text-white" onClick={(e) => e.preventDefault()}>
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
    </motion.div>
  </Link>
);

export default function Deals() {
  const [stages, setStages] = useState<DealStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, d] = await Promise.all([api.stages.list(), api.deals.list()]);
        setStages(s.sort((a, b) => a.order - b.order));
        setDeals(d);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const getDealsInStage = (stageId: string) => deals.filter(d => d.stageId === stageId);

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
              <List size={18} />
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
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
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                {getDealsInStage(stage.id).map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                {getDealsInStage(stage.id).length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm italic">
                    No deals here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
