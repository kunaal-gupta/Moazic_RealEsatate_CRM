import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  User as UserIcon, 
  AlertCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Task } from '../types';
import { cn } from '../lib/utils';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    api.tasks.list().then(setTasks);
  }, []);

  const filteredTasks = (tasks.length > 0 ? tasks : [
    { id: 't1', title: 'Follow up with John Smith', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString(), description: 'Discuss the Maple St offer' },
    { id: 't2', title: 'Send contract to Sarah', status: 'completed', dueDate: new Date().toISOString(), description: 'Finalize the listing agreement' },
    { id: 't3', title: 'Schedule inspection for Oak Ridge', status: 'pending', dueDate: new Date(Date.now() + 172800000).toISOString(), description: 'Contact local inspector' }
  ]).filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-slate-400 mt-1">Stay on top of your daily responsibilities.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-all text-sm">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 flex items-start gap-4 group hover:bg-slate-800/20 transition-all"
              >
                <button className="mt-1 text-slate-500 hover:text-blue-500 transition-all">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "text-lg font-bold transition-all",
                      task.status === 'completed' ? "text-slate-500 line-through" : "text-white"
                    )}>
                      {task.title}
                    </h3>
                    <button className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={14} />
                      <span>Due {new Date(task.dueDate!).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <UserIcon size={14} />
                      <span>Assigned to You</span>
                    </div>
                    {new Date(task.dueDate!) < new Date() && task.status === 'pending' && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold uppercase tracking-tighter">
                        <AlertCircle size={14} />
                        Overdue
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredTasks.length === 0 && (
            <div className="p-12 text-center text-slate-500 italic">
              No tasks found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
