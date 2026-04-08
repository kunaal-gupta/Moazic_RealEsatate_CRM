import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  User as UserIcon, 
  Home, 
  Activity as ActivityIcon, 
  CheckSquare, 
  FileText,
  Mail,
  Phone,
  Plus,
  MoreHorizontal,
  Clock,
  ChevronRight,
  X,
  Type,
  AlignLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Building2,
  Tag,
  Layers,
  Warehouse,
  DoorOpen,
  CheckCircle2,
  Car
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Deal, Contact, Activity, Task, Property } from '../types';
import { cn } from '../lib/utils';

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'activities' | 'contacts' | 'tasks' | 'documents'>('activities');
  
  // Modal states
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  
  // Form states
  const [activityForm, setActivityForm] = useState({ type: 'call', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0] });
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);

  const loadData = async () => {
    const allDeals = await api.deals.list();
    const foundDeal = allDeals.find(d => d.id === id) || allDeals[0];
    setDeal(foundDeal);

    if (foundDeal) {
      const [props, allContacts, allActivities, allTasks] = await Promise.all([
        api.properties.list(),
        api.contacts.list(),
        api.activities.list(),
        api.tasks.list()
      ]);
      setProperty(props.find(p => p.id === foundDeal.propertyId) || null);
      setContacts(allContacts.filter(c => foundDeal.contactIds.includes(c.id)));
      setAvailableContacts(allContacts.filter(c => !foundDeal.contactIds.includes(c.id)));
      setActivities(allActivities.filter(a => a.dealId === foundDeal.id));
      setTasks(allTasks.filter(t => t.dealId === foundDeal.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    try {
      await api.activities.create({ ...activityForm, dealId: deal.id });
      setIsActivityModalOpen(false);
      setActivityForm({ type: 'call', description: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkContact = async (contactId: string) => {
    if (!deal) return;
    try {
      const updatedContactIds = [...deal.contactIds, contactId];
      await api.deals.update(deal.id, { contactIds: updatedContactIds });
      setIsContactModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    try {
      await api.tasks.create({ ...taskForm, dealId: deal.id, status: 'pending' });
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!deal) return <div className="p-8 text-slate-500">Loading deal details...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/deals" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Deal #{deal.id.slice(-4)}</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
              {deal.stageId === '1' ? 'Lead' : deal.stageId === '2' ? 'Showing' : deal.stageId === '3' ? 'Offer' : 'Active'}
            </span>
          </div>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <Home size={14} /> {property?.address || 'Property Address'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Tabs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deal Value</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                <DollarSign size={20} className="text-emerald-500" />
                {deal.value?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Created On</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                <Calendar size={20} className="text-blue-500" />
                {new Date(deal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assigned Agent</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                <UserIcon size={20} className="text-indigo-500" />
                Kunaal G.
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="flex border-b border-slate-800 p-1">
              {[
                { id: 'activities', label: 'Timeline', icon: ActivityIcon },
                { id: 'contacts', label: 'Contacts', icon: UserIcon },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                { id: 'documents', label: 'Documents', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-widest transition-all rounded-xl",
                    activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'activities' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Activity History</h3>
                    <button 
                      onClick={() => setIsActivityModalOpen(true)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                    >
                      <Plus size={14} /> Log Activity
                    </button>
                  </div>
                  <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                    {activities.length > 0 ? activities.map((activity, i) => (
                      <div key={i} className="flex gap-6 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-xl">
                          {activity.type === 'call' ? <Phone size={18} /> : 
                           activity.type === 'email' ? <Mail size={18} /> : 
                           <ActivityIcon size={18} />}
                        </div>
                        <div className="flex-1 bg-slate-800/30 border border-slate-800 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-white uppercase tracking-tighter">{activity.type}</p>
                            <span className="text-[10px] text-slate-500 font-bold">{new Date(activity.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-300">{activity.description}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-500 italic text-sm">No activities logged yet.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Linked Contacts</h3>
                    <button 
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                    >
                      <Plus size={14} /> Link Contact
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map(contact => (
                      <div key={contact.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                            {contact.fullName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{contact.fullName}</p>
                            <p className="text-xs text-slate-500">{contact.email}</p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Deal Tasks</h3>
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                    >
                      <Plus size={14} /> New Task
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tasks.length > 0 ? tasks.map(task => (
                      <div key={task.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-4 group hover:border-slate-600 transition-all">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          task.status === 'completed' ? "bg-emerald-500 border-emerald-500" : "border-slate-600"
                        )}>
                          {task.status === 'completed' && <CheckSquare size={12} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-medium", task.status === 'completed' ? "text-slate-500 line-through" : "text-white")}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            <span className="flex items-center gap-1"><Clock size={10} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                            <span className="flex items-center gap-1"><UserIcon size={10} /> Assigned to You</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-500 italic text-sm">No tasks for this deal.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Deal Documents</h3>
                    <label className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                      <Plus size={14} /> Upload Document
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            alert(`File "${file.name}" uploaded successfully (simulated)`);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Feature Sheet - Maple St.pdf', type: 'PDF', size: '2.4 MB' },
                      { name: 'Listing Agreement.pdf', type: 'PDF', size: '1.1 MB' },
                      { name: 'Property Photos.zip', type: 'ZIP', size: '45 MB' },
                    ].map((doc, i) => (
                      <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-4 group hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="p-3 bg-slate-900 rounded-lg text-slate-400 group-hover:text-blue-500 transition-all">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Property & Actions */}
        <div className="space-y-8">
          {/* Property Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property?.id}/800/600`} 
                alt="Property" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-white mb-1">{property?.address}</h3>
              <p className="text-xs text-slate-500 mb-4">{property?.community}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Beds</p>
                  <p className="text-lg font-bold text-white">{property?.beds}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Baths</p>
                  <p className="text-lg font-bold text-white">{property?.baths}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPropertyModalOpen(true)}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                View Full Listing <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                <Phone size={20} className="text-blue-500 group-hover:text-white" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Call</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                <Mail size={20} className="text-blue-500 group-hover:text-white" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Email</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                <Calendar size={20} className="text-blue-500 group-hover:text-white" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Showing</span>
              </button>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group"
              >
                <CheckSquare size={20} className="text-blue-500 group-hover:text-white" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">Log Activity</h2>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleLogActivity} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                  <select 
                    value={activityForm.type}
                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                    placeholder="What happened?"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                  Log Activity
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">Link Contact</h2>
                <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
                {availableContacts.length > 0 ? availableContacts.map(contact => (
                  <button 
                    key={contact.id}
                    onClick={() => handleLinkContact(contact.id)}
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-3 hover:border-blue-500/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                      {contact.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{contact.fullName}</p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-8 text-slate-500 italic text-sm">No more contacts available to link.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">New Deal Task</h2>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Type size={14} /> Title
                  </label>
                  <input 
                    type="text" 
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Task title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <AlignLeft size={14} /> Description
                  </label>
                  <textarea 
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                    placeholder="Task details..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isPropertyModalOpen && property && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="relative h-64 md:h-80 shrink-0">
                <img 
                  src={`https://picsum.photos/seed/${property.id}/1200/800`} 
                  alt={property.address}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <button 
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-8">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                    {property.isOurInventory ? 'Our Inventory' : 'External'}
                  </span>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{property.address}</h2>
                  <div className="flex items-center gap-2 text-slate-300 mt-1">
                    <MapPin size={16} />
                    {property.community}
                  </div>
                </div>
                <div className="absolute bottom-6 right-8">
                  <div className="bg-emerald-500/20 border border-emerald-500/50 px-4 py-2 rounded-xl backdrop-blur-md">
                    <span className="text-2xl font-bold text-emerald-400">${property.price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    {/* Key Features */}
                    <div className="grid grid-cols-3 gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
                      <div className="flex flex-col items-center gap-2">
                        <Bed size={20} className="text-blue-400" />
                        <span className="text-lg font-bold text-white">{property.beds}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Bedrooms</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 border-x border-slate-700">
                        <Bath size={20} className="text-blue-400" />
                        <span className="text-lg font-bold text-white">{property.baths}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Bathrooms</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Maximize size={20} className="text-blue-400" />
                        <span className="text-lg font-bold text-white">{property.size}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Sq Ft</span>
                      </div>
                    </div>

                    {/* Property Details Grid */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Home size={18} className="text-blue-400" />
                        Property Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <DetailItem label="Builder" value={property.builder} icon={<Building2 size={14} />} />
                        <DetailItem label="Year Built" value={property.yearBuilt} icon={<Calendar size={14} />} />
                        <DetailItem label="Property Class" value={property.propertyClass} icon={<Tag size={14} />} />
                        <DetailItem label="Building Type" value={property.buildingType} icon={<Layers size={14} />} />
                        <DetailItem label="Style" value={property.style} icon={<Home size={14} />} />
                        <DetailItem label="Model" value={property.model} icon={<Tag size={14} />} />
                        <DetailItem label="Block/Lot" value={property.blockLot} icon={<Tag size={14} />} />
                        <DetailItem label="Legal Plan" value={property.legalPlan} icon={<Tag size={14} />} />
                        <DetailItem label="Occupancy" value={property.occupancy} icon={<DoorOpen size={14} />} />
                        <DetailItem label="Condo Fees" value={property.condoFees ? `$${property.condoFees}` : 'N/A'} icon={<DollarSign size={14} />} />
                      </div>
                    </div>

                    {/* Interior & Exterior */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Warehouse size={18} className="text-blue-400" />
                        Interior & Exterior Features
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <DetailItem label="Flooring" value={property.flooring} icon={<Layers size={14} />} />
                        <DetailItem label="Garage Type" value={property.garageType} icon={<Car size={14} />} />
                        <DetailItem label="Floors" value={property.floors} icon={<Layers size={14} />} />
                        <DetailItem label="Basement" value={property.basement} icon={<Warehouse size={14} />} />
                        <DetailItem label="Basement Dev" value={property.basementDev} icon={<Warehouse size={14} />} />
                        <DetailItem label="Appliances" value={property.appliancesIncluded ? 'Included' : 'Not Included'} icon={<CheckCircle2 size={14} />} />
                        <DetailItem label="Separate Entrance" value={property.separateEntrance ? 'Yes' : 'No'} icon={<DoorOpen size={14} />} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
                      <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Listing Info</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Added Date</span>
                          <span className="text-white text-sm font-medium">
                            {new Date(property.addedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">DOM</span>
                          <span className="text-white text-sm font-medium">{property.dom || 0} Days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">C-DOM</span>
                          <span className="text-white text-sm font-medium">{property.cDom || 0} Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-500">{icon}</div>
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</div>
        <div className="text-sm text-slate-200 font-medium">{value || 'N/A'}</div>
      </div>
    </div>
  );
}
