import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Building, 
  User as UserIcon, 
  Tag, 
  Calendar, 
  ChevronLeft,
  Briefcase,
  MapPin,
  Home,
  MessageSquare,
  Clock,
  DollarSign,
  Activity as ActivityIcon,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';
import { Contact, Lead, Showing, Property, Deal, Activity, LeadStage } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leadStages, setLeadStages] = useState<LeadStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'showings' | 'timeline'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [
          allContacts, 
          allLeads, 
          allShowings, 
          allProperties, 
          allDeals, 
          allActivities, 
          allLeadStages
        ] = await Promise.all([
          api.contacts.list(),
          api.leads.list(),
          api.showings.list(),
          api.properties.list(),
          api.deals.list(),
          api.activities.list(),
          api.leadStages.list()
        ]);
        
        const foundContact = allContacts.find(c => c.id === id);
        setContact(foundContact || null);
        
        setLeads(allLeads.filter(l => l.contactId === id));
        setShowings(allShowings.filter(s => s.participantIds.includes(id)));
        setProperties(allProperties);
        setDeals(allDeals.filter(d => d.contactIds.includes(id)));
        setActivities(allActivities.filter(a => a.contactId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLeadStages(allLeadStages);
      } catch (err) {
        console.error("Failed to load contact details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p>Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <UserIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Contact Not Found</h2>
        <p className="text-slate-400 mt-2">The contact you're looking for doesn't exist.</p>
        <Link to="/contacts" className="inline-block mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Return to Contacts
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ClipboardList className="text-blue-400" size={20} />
            Recent Deals
          </h2>
          {deals.length > 0 ? (
            <div className="space-y-4">
              {deals.map(deal => (
                <div key={deal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-colors gap-4">
                  <div>
                    <p className="text-white font-medium mb-1">Deal #{deal.id.slice(-4)}</p>
                    <div className="flex flex-wrap gap-2">
                      {deal.propertyIds.map(pid => {
                        const prop = properties.find(p => p.id === pid);
                        return prop ? (
                          <span key={pid} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-950/50 border border-slate-800 rounded text-[10px] text-slate-300">
                            <Home size={10} className="text-slate-500" />
                            {prop.address}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Value</p>
                      <p className="text-emerald-400 font-mono font-bold">${deal.value?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] uppercase font-bold tracking-widest">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-800/20 border border-slate-800 border-dashed rounded-xl">
              <p className="text-slate-500">No active deals found.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="text-emerald-400" size={20} />
            Recent Notes
          </h2>
          {activities.filter(a => a.type === 'note' || a.type === 'call').slice(0, 3).length > 0 ? (
            <div className="space-y-4">
              {activities.filter(a => a.type === 'note' || a.type === 'call').slice(0, 3).map(activity => (
                <div key={activity.id} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      {activity.type === 'call' ? <Phone size={12} className="text-purple-400"/> : <FileText size={12} className="text-emerald-400"/>}
                      {activity.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{activity.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-800/20 border border-slate-800 border-dashed rounded-xl">
              <p className="text-slate-500">No recent notes.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <ActivityIcon size={16} className="text-slate-400" />
            <h3 className="font-semibold text-slate-200">Contact Stats</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 rounded-xl p-4 text-center border border-slate-800/50">
              <p className="text-3xl font-bold text-blue-400 mb-1">{leads.length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Past Leads</p>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-4 text-center border border-slate-800/50">
              <p className="text-3xl font-bold text-emerald-400 mb-1">{showings.length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Showings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-white mb-6">Leads & Requirements</h2>
      <div className="grid lg:grid-cols-2 gap-4">
        {leads.length > 0 ? leads.map(lead => {
          const stage = leadStages.find(s => s.id === lead.stageId);
          return (
            <div key={lead.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                    stage?.name === 'Won' ? "bg-emerald-500/10 text-emerald-400" :
                    stage?.name === 'Lost' ? "bg-red-500/10 text-red-400" :
                    "bg-blue-500/10 text-blue-400"
                  )}>
                    {stage?.name || 'Open'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Budget</p>
                  <p className="text-white font-mono font-bold">
                    ${(lead.minBudget || 0).toLocaleString()} - ${(lead.maxBudget || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {(lead.preferredCommunity && lead.preferredCommunity.length > 0) && (
                <div className="mb-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Preferred Communities</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.preferredCommunity.map(communityId => (
                      <span key={communityId} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">
                        {communityId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                {lead.minBeds && (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <UserIcon size={14} className="text-slate-500"/> {lead.minBeds}+ Beds
                  </div>
                )}
                {lead.minBaths && (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <UserIcon size={14} className="text-slate-500"/> {lead.minBaths}+ Baths
                  </div>
                )}
                {lead.preferredPropertyClass && (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Building size={14} className="text-slate-500"/> {lead.preferredPropertyClass}
                  </div>
                )}
                {lead.preferredBuildingType && (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Home size={14} className="text-slate-500"/> {lead.preferredBuildingType}
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-8 bg-slate-800/20 border border-slate-800 border-dashed rounded-xl">
            <p className="text-slate-500">No leads associated with this contact.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderShowings = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-white mb-6">Properties Visited & Showings</h2>
      <div className="space-y-4">
        {showings.length > 0 ? showings.map(showing => {
          const property = properties.find(p => p.id === (showing.propertyIds?.[0] || (showing as any).propertyId));
          return (
            <div key={showing.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                <MapPin className="text-slate-400" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">
                    {property?.address || 'Unknown Property'} 
                    {showing.propertyIds && showing.propertyIds.length > 1 ? ` (+${showing.propertyIds.length - 1} more)` : ''}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                    showing.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                    showing.status === 'cancelled' ? "bg-red-500/10 text-red-400" :
                    "bg-blue-500/10 text-blue-400"
                  )}>
                    {showing.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-500"/>
                    {new Date(showing.scheduledAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-500"/>
                    {new Date(showing.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {showing.endScheduledAt && ` - ${new Date(showing.endScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                  {property && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={14} className="text-slate-500"/>
                      {property.price?.toLocaleString()}
                    </span>
                  )}
                </div>
                {showing.notes && (
                  <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    "{showing.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 bg-slate-800/20 border border-slate-800 border-dashed rounded-xl">
            <p className="text-slate-500">No showings recorded for this contact.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-white mb-8">Activity Timeline</h2>
      <div className="relative pl-6 sm:pl-8">
        <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-px bg-slate-800"></div>
        {activities.length > 0 ? activities.map((activity, idx) => {
          const isNote = activity.type === 'note';
          const isCall = activity.type === 'call';
          const isMeeting = activity.type === 'meeting';
          const isEmail = activity.type === 'email';

          return (
            <div key={activity.id} className="relative mb-8 last:mb-0 group">
              <div className={cn(
                "absolute -left-6 sm:-left-8 w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center shrink-0 ring-1 ring-slate-800",
                isNote ? "bg-emerald-500/20 text-emerald-400" :
                isCall ? "bg-purple-500/20 text-purple-400" :
                isEmail ? "bg-blue-500/20 text-blue-400" :
                "bg-slate-500/20 text-slate-400"
              )}>
                {isNote ? <FileText size={10} /> :
                 isCall ? <Phone size={10} /> :
                 isEmail ? <Mail size={10} /> :
                 <ActivityIcon size={10} />}
              </div>
              <div className="bg-slate-800/30 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {activity.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{activity.description}</p>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 bg-slate-800/20 border border-slate-800 border-dashed rounded-xl ml-4">
            <p className="text-slate-500">No activity timeline available.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Link to="/contacts" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
        <ChevronLeft size={16} /> Back to Contacts
      </Link>
      
      {/* Header Profile Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg ring-4 ring-slate-900">
            {getInitials(contact.fullName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">{contact.fullName}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit",
                contact.type === 'buyer' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                contact.type === 'seller' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              )}>
                {contact.type}
              </span>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <Briefcase size={16} />
              {contact.company || 'Independent'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-4 rounded-xl cursor-default group hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Email</p>
                <p className="text-sm text-slate-200 truncate">{contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-4 rounded-xl cursor-default group hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Phone</p>
                <p className="text-sm text-slate-200 truncate">{contact.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-4 rounded-xl cursor-default group hover:border-slate-700 transition-colors sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                <UserIcon size={18} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Client Since</p>
                <p className="text-sm text-slate-200 truncate">{new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800 pb-px">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'leads', label: 'Leads & Requirements' },
          { id: 'showings', label: 'Showings' },
          { id: 'timeline', label: 'Timeline & Notes' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-blue-500 text-white bg-slate-800/30 rounded-t-lg" 
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'leads' && renderLeads()}
        {activeTab === 'showings' && renderShowings()}
        {activeTab === 'timeline' && renderTimeline()}
      </div>

    </div>
  );
}

// Keep the clipboard icon
const ClipboardList = ({className, size}: {className?: string, size?: number}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/>
    <path d="M12 16h4"/>
    <path d="M8 11h.01"/>
    <path d="M8 16h.01"/>
  </svg>
)

