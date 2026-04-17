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
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Modal states
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isEditDealModalOpen, setIsEditDealModalOpen] = useState(false);
  const [isShowingModalOpen, setIsShowingModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Form states
  const [activityForm, setActivityForm] = useState({ type: 'call', description: '' });
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    dueDate: new Date().toISOString().split('T')[0],
    contactId: '',
    assignedTo: '',
    status: 'pending' as 'pending' | 'completed'
  });
  const [dealForm, setDealForm] = useState({ value: 0, stageId: '' });
  const [showingForm, setShowingForm] = useState({ propertyId: '', scheduledAt: new Date().toISOString().slice(0, 16), participantIds: [] as string[] });
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingPropertyNotes, setIsEditingPropertyNotes] = useState(false);
  const [propertyNotes, setPropertyNotes] = useState('');

  const loadData = async () => {
    const allDeals = await api.deals.list();
    const foundDeal = allDeals.find(d => d.id === id) || allDeals[0];
    setDeal(foundDeal);

    if (foundDeal) {
      const [props, allContacts, allActivities, allTasks, users] = await Promise.all([
        api.properties.list(),
        api.contacts.list(),
        api.activities.list(),
        api.tasks.list(),
        api.users.list()
      ]);
      setProperties(props.filter(p => foundDeal.propertyIds.includes(p.id)));
      setContacts(allContacts.filter(c => foundDeal.contactIds.includes(c.id)));
      setAvailableContacts(allContacts.filter(c => !foundDeal.contactIds.includes(c.id)));
      setActivities(allActivities.filter(a => a.dealId === foundDeal.id));
      setTasks(allTasks.filter(t => t.dealId === foundDeal.id));
      setNotes(foundDeal.notes || '');
      setAllUsers(users);
      setDealForm({ value: foundDeal.value || 0, stageId: foundDeal.stageId });
      setShowingForm(prev => ({ ...prev, propertyId: foundDeal.propertyIds[0] || '' }));
      setTaskForm(prev => ({ ...prev, contactId: foundDeal.contactIds[0] || '' }));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveNotes = async () => {
    if (!deal) return;
    try {
      await api.deals.update(deal.id, { notes });
      setIsEditingNotes(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePropertyNotes = async () => {
    if (!selectedProperty) return;
    try {
      await api.properties.update(selectedProperty.id, { notes: propertyNotes });
      setIsEditingPropertyNotes(false);
      // Update local state
      setProperties(prev => prev.map(p => p.id === selectedProperty.id ? { ...p, notes: propertyNotes } : p));
      setSelectedProperty(prev => prev ? { ...prev, notes: propertyNotes } : null);
    } catch (err) {
      console.error(err);
    }
  };

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
      await api.tasks.create({ ...taskForm, dealId: deal.id });
      setIsTaskModalOpen(false);
      setTaskForm({ 
        title: '', 
        description: '', 
        dueDate: new Date().toISOString().split('T')[0],
        contactId: deal.contactIds[0] || '',
        assignedTo: '',
        status: 'pending'
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.tasks.update(task.id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    try {
      await api.deals.update(deal.id, dealForm);
      setIsEditDealModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleShowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    try {
      await api.showings.create({ ...showingForm, dealId: deal.id, status: 'scheduled' });
      setIsShowingModalOpen(false);
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
            <button 
              onClick={() => setIsEditDealModalOpen(true)}
              className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <Home size={14} /> {properties.length} Associated Properties
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Front (Left/Center): Properties, Notes, Metrics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats / Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deal Value</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                <DollarSign size={18} className="text-emerald-500" />
                {deal.value?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Created On</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                <Calendar size={18} className="text-blue-500" />
                {new Date(deal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assigned Agent</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                <UserIcon size={18} className="text-indigo-500" />
                Kunaal G.
              </p>
            </div>
          </div>

          {/* Properties Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Home size={16} className="text-blue-500" />
              Associated Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map(prop => (
                <div key={prop.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden group hover:border-blue-500/50 transition-all">
                  <div className="h-32 overflow-hidden relative">
                    <img 
                      src={`https://picsum.photos/seed/${prop.id}/400/300`} 
                      alt={prop.address} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-sm font-bold text-white truncate">{prop.address}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{prop.community}</span>
                      <span className="text-sm font-bold text-emerald-400">${prop.price?.toLocaleString()}</span>
                    </div>
                    {prop.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 italic leading-relaxed">
                        "{prop.notes}"
                      </p>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedProperty(prop);
                        setPropertyNotes(prop.notes || '');
                        setIsEditingPropertyNotes(false);
                        setIsPropertyModalOpen(true);
                      }}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 uppercase tracking-widest"
                    >
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Deal Notes
              </h3>
              {!isEditingNotes ? (
                <button 
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors"
                >
                  Edit Notes
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditingNotes(false)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveNotes}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[150px] leading-relaxed"
                placeholder="Add some notes about this deal..."
              />
            ) : (
              <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 min-h-[100px]">
                {notes ? (
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{notes}</p>
                ) : (
                  <p className="text-sm text-slate-600 italic">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline, Contacts, Tasks, Documents */}
        <div className="space-y-6">
          {/* Timeline Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <ActivityIcon size={16} className="text-blue-500" />
                Timeline
              </h3>
              <button onClick={() => setIsActivityModalOpen(true)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {activities.length > 0 ? activities.map((activity, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    {activity.type === 'call' ? <Phone size={12} /> : 
                     activity.type === 'email' ? <Mail size={12} /> : 
                     <ActivityIcon size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tight">{new Date(activity.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-600 italic text-center py-4">No activities logged.</p>
              )}
            </div>
          </div>

          {/* Contacts Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={16} className="text-indigo-500" />
                Contacts
              </h3>
              <button onClick={() => setIsContactModalOpen(true)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {contacts.length > 0 ? contacts.map(contact => (
                <div key={contact.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-3 group hover:border-blue-500/30 transition-all">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-bold">
                    {contact.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{contact.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-600 italic text-center py-4">No contacts linked.</p>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-500" />
                Tasks
              </h3>
              <button onClick={() => setIsTaskModalOpen(true)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
                  <button 
                    onClick={() => handleToggleTaskStatus(task)}
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                      task.status === 'completed' ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-emerald-500"
                    )}
                  >
                    {task.status === 'completed' && <CheckSquare size={10} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", task.status === 'completed' ? "text-slate-500 line-through" : "text-white")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </p>
                      {task.assignedTo && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">
                            {allUsers.find(u => u.id === task.assignedTo)?.fullName.split(' ')[0]}
                          </p>
                        </>
                      )}
                      {task.contactId && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">
                            {contacts.find(c => c.id === task.contactId)?.fullName.split(' ')[0]}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-600 italic text-center py-4">No tasks pending.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  setActivityForm({ type: 'call', description: '' });
                  setIsActivityModalOpen(true);
                }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group"
              >
                <Phone size={16} className="text-blue-500 group-hover:text-white" />
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-widest">Call</span>
              </button>
              <button 
                onClick={() => {
                  setActivityForm({ type: 'email', description: '' });
                  setIsActivityModalOpen(true);
                }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group"
              >
                <Mail size={16} className="text-blue-500 group-hover:text-white" />
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-widest">Email</span>
              </button>
              <button 
                onClick={() => setIsShowingModalOpen(true)}
                className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group"
              >
                <Calendar size={16} className="text-blue-500 group-hover:text-white" />
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-widest">Showing</span>
              </button>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group"
              >
                <CheckSquare size={16} className="text-blue-500 group-hover:text-white" />
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-widest">Task</span>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <UserIcon size={14} /> Assigned To
                    </label>
                    <select 
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {allUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <UserIcon size={14} /> Contact
                    </label>
                    <select 
                      value={taskForm.contactId}
                      onChange={(e) => setTaskForm({ ...taskForm, contactId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    >
                      <option value="">None</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>{contact.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} /> Status
                    </label>
                    <select 
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as 'pending' | 'completed' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isEditDealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">Edit Deal</h2>
                <button onClick={() => setIsEditDealModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateDeal} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deal Value ($)</label>
                  <input 
                    type="number" 
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stage</label>
                  <select 
                    value={dealForm.stageId}
                    onChange={(e) => setDealForm({ ...dealForm, stageId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="1">Lead</option>
                    <option value="2">Showing</option>
                    <option value="3">Offer</option>
                    <option value="4">Active</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isShowingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">Schedule Showing</h2>
                <button onClick={() => setIsShowingModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleScheduleShowing} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Property</label>
                  <select 
                    value={showingForm.propertyId}
                    onChange={(e) => setShowingForm({ ...showingForm, propertyId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.address}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={showingForm.scheduledAt}
                    onChange={(e) => setShowingForm({ ...showingForm, scheduledAt: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Participants</label>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    {contacts.map(contact => (
                      <label key={contact.id} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={showingForm.participantIds.includes(contact.id)}
                          onChange={(e) => {
                            const ids = e.target.checked 
                              ? [...showingForm.participantIds, contact.id]
                              : showingForm.participantIds.filter(id => id !== contact.id);
                            setShowingForm({ ...showingForm, participantIds: ids });
                          }}
                          className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50"
                        />
                        {contact.fullName}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                  Schedule Showing
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isPropertyModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="relative h-64 md:h-80 shrink-0">
                <img 
                  src={`https://picsum.photos/seed/${selectedProperty.id}/1200/800`} 
                  alt={selectedProperty.address}
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
                    {selectedProperty.isOurInventory ? 'Our Inventory' : 'External'}
                  </span>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{selectedProperty.address}</h2>
                  <div className="flex items-center gap-2 text-slate-300 mt-1">
                    <MapPin size={16} />
                    {selectedProperty.community}
                  </div>
                </div>
                <div className="absolute bottom-6 right-8">
                  <div className="bg-emerald-500/20 border border-emerald-500/50 px-4 py-2 rounded-xl backdrop-blur-md">
                    <span className="text-2xl font-bold text-emerald-400">${selectedProperty.price?.toLocaleString()}</span>
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
                        <span className="text-lg font-bold text-white">{selectedProperty.beds}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Bedrooms</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 border-x border-slate-700">
                        <Bath size={20} className="text-blue-400" />
                        <span className="text-lg font-bold text-white">{selectedProperty.baths}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Bathrooms</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Maximize size={20} className="text-blue-400" />
                        <span className="text-lg font-bold text-white">{selectedProperty.size}</span>
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
                        <DetailItem label="Builder" value={selectedProperty.builder} icon={<Building2 size={14} />} />
                        <DetailItem label="Year Built" value={selectedProperty.yearBuilt} icon={<Calendar size={14} />} />
                        <DetailItem label="Property Class" value={selectedProperty.propertyClass} icon={<Tag size={14} />} />
                        <DetailItem label="Building Type" value={selectedProperty.buildingType} icon={<Layers size={14} />} />
                        <DetailItem label="Style" value={selectedProperty.style} icon={<Home size={14} />} />
                        <DetailItem label="Model" value={selectedProperty.model} icon={<Tag size={14} />} />
                        <DetailItem label="Block/Lot" value={selectedProperty.blockLot} icon={<Tag size={14} />} />
                        <DetailItem label="Legal Plan" value={selectedProperty.legalPlan} icon={<Tag size={14} />} />
                        <DetailItem label="Occupancy" value={selectedProperty.occupancy} icon={<DoorOpen size={14} />} />
                        <DetailItem label="Condo Fees" value={selectedProperty.condoFees ? `$${selectedProperty.condoFees}` : 'N/A'} icon={<DollarSign size={14} />} />
                      </div>
                    </div>

                    {/* Interior & Exterior */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Warehouse size={18} className="text-blue-400" />
                        Interior & Exterior Features
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <DetailItem label="Flooring" value={selectedProperty.flooring} icon={<Layers size={14} />} />
                        <DetailItem label="Garage Type" value={selectedProperty.garageType} icon={<Car size={14} />} />
                        <DetailItem label="Floors" value={selectedProperty.floors} icon={<Layers size={14} />} />
                        <DetailItem label="Basement" value={selectedProperty.basement} icon={<Warehouse size={14} />} />
                        <DetailItem label="Basement Dev" value={selectedProperty.basementDev} icon={<Warehouse size={14} />} />
                        <DetailItem label="Appliances" value={selectedProperty.appliancesIncluded ? 'Included' : 'Not Included'} icon={<CheckCircle2 size={14} />} />
                        <DetailItem label="Separate Entrance" value={selectedProperty.separateEntrance ? 'Yes' : 'No'} icon={<DoorOpen size={14} />} />
                      </div>
                    </div>

                    {/* Property Notes Section */}
                    <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <FileText size={18} className="text-amber-500" />
                          Property Notes
                        </h3>
                        {!isEditingPropertyNotes ? (
                          <button 
                            onClick={() => setIsEditingPropertyNotes(true)}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors"
                          >
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setIsEditingPropertyNotes(false)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleSavePropertyNotes}
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditingPropertyNotes ? (
                        <textarea
                          value={propertyNotes}
                          onChange={(e) => setPropertyNotes(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px] leading-relaxed"
                          placeholder="Add notes specific to this property..."
                        />
                      ) : (
                        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 min-h-[80px]">
                          {selectedProperty.notes ? (
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedProperty.notes}</p>
                          ) : (
                            <p className="text-sm text-slate-600 italic">No property notes added yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
                      <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Listing Info</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Added Date</span>
                          <span className="text-white text-sm font-medium">
                            {new Date(selectedProperty.addedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">DOM</span>
                          <span className="text-white text-sm font-medium">{selectedProperty.dom || 0} Days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">C-DOM</span>
                          <span className="text-white text-sm font-medium">{selectedProperty.cDom || 0} Days</span>
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
