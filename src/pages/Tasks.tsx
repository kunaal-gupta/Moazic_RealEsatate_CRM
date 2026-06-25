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
  Search,
  X,
  Trash2,
  Calendar,
  Type,
  AlignLeft,
  Briefcase,
  Home,
  Users,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Task, Deal, Property, User, Showing, Contact } from '../types';
import { cn } from '../lib/utils';
import MultiSelect from '../components/MultiSelect';

const emptyTaskForm: Partial<Task> = {
  title: '',
  description: '',
  dealId: '',
  showingId: '',
  contactId: '',
  contactIds: [],
  propertyIds: [],
  assignedTo: '',
  dueDate: new Date().toISOString().split('T')[0],
  status: 'pending'
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [statusFilters, setStatusFilters] = useState<Array<Task['status']>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilterIds, setAssignedFilterIds] = useState<string[]>([]);
  const [clientFilterIds, setClientFilterIds] = useState<string[]>([]);
  const [propertyFilterIds, setPropertyFilterIds] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'no-date'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'createdAt'>('dueDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>(emptyTaskForm);

  useEffect(() => {
    Promise.all([
      api.tasks.list(),
      api.deals.list(),
      api.properties.list(),
      api.users.list(),
      api.showings.list(),
      api.contacts.list()
    ]).then(([taskRecords, dealRecords, propertyRecords, userRecords, showingRecords, contactRecords]) => {
      setTasks(taskRecords);
      setDeals(dealRecords);
      setProperties(propertyRecords);
      setUsers(userRecords);
      setShowings(showingRecords);
      setContacts(contactRecords);
    });
  }, []);

  const getProperty = (id?: string) => properties.find(property => property.id === id);
  const getContact = (id?: string) => contacts.find(contact => contact.id === id);
  const getUser = (id?: string) => users.find(user => user.id === id);
  const getDealLabel = (deal: Deal) => {
    const dealProperties = deal.propertyIds?.map(id => getProperty(id)?.address).filter(Boolean) || [];
    return dealProperties.length ? dealProperties.join(', ') : `Deal ${deal.id.slice(0, 6)}`;
  };
  const getShowingLabel = (showing: Showing) => {
    const showingProperties = showing.propertyIds?.map(id => getProperty(id)?.address).filter(Boolean) || [];
    const date = showing.scheduledAt ? new Date(showing.scheduledAt).toLocaleDateString() : 'No date';
    return `${showingProperties.join(', ') || 'Showing'} • ${date}`;
  };

  const mergeIds = (...groups: Array<string[] | undefined>) => Array.from(new Set(groups.flatMap(group => group || []).filter(Boolean)));

  const applyDeal = (dealId: string) => {
    const deal = deals.find(item => item.id === dealId);
    setEditForm(prev => ({
      ...prev,
      dealId,
      propertyIds: mergeIds(prev.propertyIds, deal?.propertyIds),
      contactIds: mergeIds(prev.contactIds, deal?.contactIds),
      contactId: prev.contactId || deal?.contactIds?.[0] || ''
    }));
  };

  const applyShowing = (showingId: string) => {
    const showing = showings.find(item => item.id === showingId);
    setEditForm(prev => ({
      ...prev,
      showingId,
      dealId: prev.dealId || showing?.dealId || '',
      propertyIds: mergeIds(prev.propertyIds, showing?.propertyIds),
      contactIds: mergeIds(prev.contactIds, showing?.participantIds),
      contactId: prev.contactId || showing?.participantIds?.[0] || ''
    }));
  };

  const filteredTasks = tasks
    .filter(task => {
      const taskPropertyIds = task.propertyIds || [];
      const taskContactIds = task.contactIds || (task.contactId ? [task.contactId] : []);
      const deal = deals.find(item => item.id === task.dealId);
      const showing = showings.find(item => item.id === task.showingId);
      const searchable = [
        task.title,
        task.description,
        task.status,
        task.assignedTo ? getUser(task.assignedTo)?.fullName : '',
        taskContactIds.map(id => getContact(id)?.fullName).join(' '),
        taskPropertyIds.map(id => getProperty(id)?.address).join(' '),
        deal ? getDealLabel(deal) : '',
        showing ? getShowingLabel(showing) : ''
      ].join(' ').toLowerCase();
      const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const startOfTomorrow = startOfToday + 86400000;

      const matchesSearch = searchable.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(task.status);
      const matchesAssignee = assignedFilterIds.length === 0 || (task.assignedTo && assignedFilterIds.includes(task.assignedTo));
      const matchesClients = clientFilterIds.length === 0 || clientFilterIds.some(id => taskContactIds.includes(id));
      const matchesProperties = propertyFilterIds.length === 0 || propertyFilterIds.some(id => taskPropertyIds.includes(id));
      const matchesDueDate = dueDateFilter === 'all'
        || (dueDateFilter === 'no-date' && !task.dueDate)
        || (dueDateFilter === 'overdue' && dueTime !== null && dueTime < startOfToday && task.status !== 'completed')
        || (dueDateFilter === 'today' && dueTime !== null && dueTime >= startOfToday && dueTime < startOfTomorrow)
        || (dueDateFilter === 'upcoming' && dueTime !== null && dueTime >= startOfTomorrow);

      return matchesSearch && matchesStatus && matchesAssignee && matchesClients && matchesProperties && matchesDueDate;
    })
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
    setSelectedTask(null);
    setEditForm(emptyTaskForm);
    setIsModalOpen(true);
  };

  const handleEditTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setIsCreateMode(false);
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      dealId: task.dealId || '',
      showingId: task.showingId || '',
      contactId: task.contactId || task.contactIds?.[0] || '',
      contactIds: task.contactIds || (task.contactId ? [task.contactId] : []),
      propertyIds: task.propertyIds || [],
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) return;
    try {
      await api.tasks.delete(task.id);
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Task> = {
      ...editForm,
      contactId: editForm.contactIds?.[0] || editForm.contactId || '',
      contactIds: editForm.contactIds || [],
      propertyIds: editForm.propertyIds || []
    };

    try {
      if (isCreateMode) {
        const newTask = await api.tasks.create(payload);
        setTasks([newTask, ...tasks]);
      } else if (selectedTask) {
        const updatedTask = await api.tasks.update(selectedTask.id, payload);
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-slate-400 mt-1">Stay on top of deal, showing, and client follow-ups.</p>
        </div>
        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="space-y-4 border-b border-slate-800 p-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.3fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks, deals, showings, clients, or properties..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as typeof dueDateFilter)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All due dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due today</option>
              <option value="upcoming">Upcoming</option>
              <option value="no-date">No due date</option>
            </select>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-10 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="title">Sort by title</option>
                <option value="createdAt">Sort by created</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <MultiSelect label="STATUS" options={[{ id: 'pending', name: 'Pending' }, { id: 'completed', name: 'Completed' }]} selectedIds={statusFilters} onChange={(ids) => setStatusFilters(ids as Array<Task['status']>)} placeholder="All statuses" />
            <MultiSelect label="ASSIGNED TO" options={users.map(user => ({ id: user.id, name: user.fullName }))} selectedIds={assignedFilterIds} onChange={setAssignedFilterIds} placeholder="All assignees" />
            <MultiSelect label="CLIENTS" options={contacts.map(contact => ({ id: contact.id, name: contact.fullName }))} selectedIds={clientFilterIds} onChange={setClientFilterIds} placeholder="All clients" />
            <MultiSelect label="PROPERTIES" options={properties.map(property => ({ id: property.id, name: property.address }))} selectedIds={propertyFilterIds} onChange={setPropertyFilterIds} placeholder="All properties" />
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => {
              const taskProperties = task.propertyIds?.map(getProperty).filter((property): property is Property => Boolean(property)) || [];
              const taskContacts = task.contactIds?.map(getContact).filter((contact): contact is Contact => Boolean(contact)) || [];
              return (
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={cn(
                        "text-lg font-bold transition-all",
                        task.status === 'completed' ? "text-slate-500 line-through" : "text-white"
                      )}>
                        {task.title}
                      </h3>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleEditTask(e, task)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
                        >
                          <MoreVertical size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTask(e, task)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 transition-all hover:border-rose-400/40 hover:bg-rose-500/20 hover:text-rose-100"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400 border border-slate-700">
                        <Clock size={14} /> Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400 border border-slate-700">
                        <UserIcon size={14} /> {getUser(task.assignedTo)?.fullName || 'Unassigned'}
                      </span>
                      {task.dealId && <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-200 border border-blue-400/20"><Briefcase size={14} /> Deal</span>}
                      {task.showingId && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200 border border-amber-400/20"><ClipboardList size={14} /> Showing</span>}
                      {taskProperties.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200 border border-emerald-400/20"><Home size={14} /> {taskProperties.length} properties</span>}
                      {taskContacts.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200 border border-indigo-400/20"><Users size={14} /> {taskContacts.length} clients</span>}
                      {task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-tighter text-rose-400 border border-rose-400/20">
                          <AlertCircle size={14} /> Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredTasks.length === 0 && (
            <div className="p-12 text-center text-slate-500 italic">
              No tasks found in this category.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Task Details</p>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {isCreateMode ? 'Add New Task' : 'Edit Task'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">Connect the task to a deal, showing, properties, clients, and an assignee.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-all rounded-lg p-2 hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Type size={14} /> Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <AlignLeft size={14} /> Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px]"
                    placeholder="Add details, next steps, or client context..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Briefcase size={14} /> Deal</label>
                  <select value={editForm.dealId || ''} onChange={(e) => applyDeal(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="">No deal selected</option>
                    {deals.map(deal => <option key={deal.id} value={deal.id}>{getDealLabel(deal)}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500">Selecting a deal auto-adds its clients and properties.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><ClipboardList size={14} /> Showing</label>
                  <select value={editForm.showingId || ''} onChange={(e) => applyShowing(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="">No showing selected</option>
                    {showings.map(showing => <option key={showing.id} value={showing.id}>{getShowingLabel(showing)}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500">Selecting a showing auto-adds its participants and properties.</p>
                </div>

                <MultiSelect label="PROPERTIES" options={properties.map(property => ({ id: property.id, name: property.address }))} selectedIds={editForm.propertyIds || []} onChange={(ids) => setEditForm({ ...editForm, propertyIds: ids })} placeholder="Select properties..." />
                <MultiSelect label="CLIENTS / PARTICIPANTS" options={contacts.map(contact => ({ id: contact.id, name: `${contact.fullName} (${contact.email})` }))} selectedIds={editForm.contactIds || []} onChange={(ids) => setEditForm({ ...editForm, contactIds: ids, contactId: ids[0] || '' })} placeholder="Select clients..." />

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><UserIcon size={14} /> Assigned To</label>
                  <select value={editForm.assignedTo || ''} onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="">Unassigned</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14} /> Status</label>
                  <select value={editForm.status || 'pending'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-5 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
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
