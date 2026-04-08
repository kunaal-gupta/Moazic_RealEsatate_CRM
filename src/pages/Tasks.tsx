import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  User as UserIcon, 
  AlertCircle,
  MoreVertical,
  Filter,
  X,
  Calendar,
  Type,
  AlignLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Task } from '../types';
import { cn } from '../lib/utils';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'createdAt'>('dueDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  useEffect(() => {
    api.tasks.list().then(setTasks);
  }, []);

  const filteredTasks = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleToggleStatus = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updatedTask = await api.tasks.update(task.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to toggle task status:', error);
    }
  };

  const handleAddTask = () => {
    setIsCreateMode(true);
    setEditForm({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setIsCreateMode(false);
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCreateMode) {
        const newTask = await api.tasks.create(editForm);
        setTasks([newTask, ...tasks]);
      } else if (selectedTask) {
        const updatedTask = await api.tasks.update(selectedTask.id, editForm);
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-slate-400 mt-1">Stay on top of your daily responsibilities.</p>
        </div>
        <button 
          onClick={handleAddTask}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
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
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-10"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="createdAt">Created At</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
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
                onClick={(e) => handleToggleStatus(e, task)}
                className="p-6 flex items-start gap-4 group hover:bg-slate-800/20 transition-all cursor-pointer"
              >
                <button 
                  className="mt-1 text-slate-500 hover:text-blue-500 transition-all"
                  onClick={(e) => handleToggleStatus(e, task)}
                >
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
                    <button 
                      onClick={(e) => handleEditTask(e, task)}
                      className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={14} />
                      <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <UserIcon size={14} />
                      <span>Assigned to You</span>
                    </div>
                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending' && (
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

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isCreateMode ? 'Add New Task' : 'Edit Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Type size={14} /> Title
                </label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft size={14} /> Description
                </label>
                <textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                  placeholder="Add some details..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Due Date
                </label>
                <input 
                  type="date" 
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  {isCreateMode ? 'Create Task' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
