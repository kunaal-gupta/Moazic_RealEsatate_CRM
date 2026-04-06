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
  ChevronRight
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Deal, Contact, Activity, Task, Property } from '../types';
import { cn } from '../lib/utils';

export default function DealDetail() {
  const { id } = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'activities' | 'contacts' | 'tasks' | 'documents'>('activities');

  useEffect(() => {
    // Mock loading for demo
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
        setActivities(allActivities.filter(a => a.dealId === foundDeal.id || !a.dealId));
        setTasks(allTasks.filter(t => t.dealId === foundDeal.id || !t.dealId));
      }
    };
    loadData();
  }, [id]);

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
              Lead Stage
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
                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1">
                      <Plus size={14} /> Log Activity
                    </button>
                  </div>
                  <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                    {activities.map((activity, i) => (
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
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Linked Contacts</h3>
                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1">
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
                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1">
                      <Plus size={14} /> New Task
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tasks.map(task => (
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
                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(task.dueDate!).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><UserIcon size={10} /> Assigned to You</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Deal Documents</h3>
                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1">
                      <Plus size={14} /> Upload Document
                    </button>
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
              <button className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
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
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                <CheckSquare size={20} className="text-blue-500 group-hover:text-white" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
