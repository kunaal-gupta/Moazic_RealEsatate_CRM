import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle,
  Edit3,
  Search,
  ArrowUpDown,
  StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Showing, Property, Contact } from '../types';
import { cn } from '../lib/utils';
import MultiSelect from '../components/MultiSelect';

type ShowingStatus = Showing['status'];
type SortKey = 'scheduledAt' | 'status' | 'participants' | 'property';
type ShowingFormState = Partial<Showing>;

const emptyShowingForm: ShowingFormState = {
  propertyIds: [],
  scheduledAt: '',
  endScheduledAt: '',
  status: 'scheduled',
  participantIds: [],
  notes: '',
  notesTimeline: []
};

export default function Showings() {
  const [showings, setShowings] = useState<Showing[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShowing, setSelectedShowing] = useState<Showing | null>(null);
  const [editingShowing, setEditingShowing] = useState<Showing | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ShowingStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('scheduledAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showingForm, setShowingForm] = useState<ShowingFormState>(emptyShowingForm);

  const propertyOptions = properties.map(p => ({ id: p.id, name: `${p.address} (${p.community})` }));
  const contactOptions = contacts.map(c => ({ id: c.id, name: c.fullName }));

  useEffect(() => {
    Promise.all([
      api.showings.list(), 
      api.properties.list(),
      api.contacts.list()
    ]).then(([s, p, c]) => {
      setShowings(s);
      setProperties(p);
      setContacts(c);
    });
  }, []);

  const getProperty = (id?: string) => properties.find(p => p.id === id);
  const getContact = (id: string) => contacts.find(c => c.id === id);
  const getPrimaryProperty = (showing: Partial<Showing>) => getProperty(showing.propertyIds?.[0] || (showing as any).propertyId);

  const getShowingProperties = (showing: Partial<Showing>) => (
    showing.propertyIds?.map(id => getProperty(id)).filter((property): property is Property => Boolean(property)) || []
  );

  const getShowingParticipants = (showing: Partial<Showing>) => (
    showing.participantIds?.map(id => getContact(id)).filter((contact): contact is Contact => Boolean(contact)) || []
  );

  const formatShowingDateTime = (value?: string) => {
    if (!value) return 'Not set';
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const visibleShowings = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfTomorrow = startOfToday + 86400000;

    return [...showings]
      .filter((showing) => {
        const propertyNames = showing.propertyIds?.map(id => getProperty(id)?.address || '').join(' ') || '';
        const participantNames = showing.participantIds?.map(id => getContact(id)?.fullName || '').join(' ') || '';
        const searchable = `${propertyNames} ${participantNames} ${showing.status} ${showing.notes || ''}`.toLowerCase();
        const scheduledTime = new Date(showing.scheduledAt).getTime();
        const matchesSearch = searchable.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || showing.status === statusFilter;
        const matchesDate = dateFilter === 'all'
          || (dateFilter === 'upcoming' && scheduledTime >= Date.now())
          || (dateFilter === 'past' && scheduledTime < Date.now())
          || (dateFilter === 'today' && scheduledTime >= startOfToday && scheduledTime < startOfTomorrow);
        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        const aProperty = getPrimaryProperty(a)?.address || '';
        const bProperty = getPrimaryProperty(b)?.address || '';
        const values: Record<SortKey, [string | number, string | number]> = {
          scheduledAt: [new Date(a.scheduledAt).getTime(), new Date(b.scheduledAt).getTime()],
          status: [a.status, b.status],
          participants: [a.participantIds?.length || 0, b.participantIds?.length || 0],
          property: [aProperty, bProperty]
        };
        const [aValue, bValue] = values[sortKey];
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
  }, [showings, searchTerm, statusFilter, dateFilter, sortKey, sortDirection, properties, contacts]);


  const statusColors = {
    scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  const resetForm = () => {
    setShowingForm(emptyShowingForm);
    setEditingShowing(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (showing: Showing) => {
    setEditingShowing(showing);
    setShowingForm({ ...showing, propertyIds: showing.propertyIds || [], participantIds: showing.participantIds || [] });
    setSelectedShowing(null);
    setIsModalOpen(true);
  };

  const saveShowing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingShowing) {
        const updatedShowing = await api.showings.update(editingShowing.id, showingForm);
        setShowings(showings.map(showing => showing.id === updatedShowing.id ? updatedShowing : showing));
      } else {
        const scheduledShowing = await api.showings.create(showingForm);
        setShowings([scheduledShowing, ...showings]);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save showing:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateShowingStatus = async (showing: Showing, status: ShowingStatus) => {
    const updatedShowing = await api.showings.update(showing.id, { status });
    setShowings(showings.map(item => item.id === showing.id ? updatedShowing : item));
    setSelectedShowing(prev => prev?.id === showing.id ? updatedShowing : prev);
  };

  const addTimelineNote = async () => {
    if (!selectedShowing || !newNote.trim()) return;
    const note = { id: Math.random().toString(36).slice(2, 9), note: newNote.trim(), createdAt: new Date().toISOString() };
    const updatedShowing = await api.showings.update(selectedShowing.id, {
      notesTimeline: [note, ...(selectedShowing.notesTimeline || [])]
    });
    setShowings(showings.map(item => item.id === updatedShowing.id ? updatedShowing : item));
    setSelectedShowing(updatedShowing);
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Showings</h1>
          <p className="text-slate-400 mt-1">Schedule, sort, filter, edit, and review property viewings.</p>
        </div>
        <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus size={18} /> Schedule Showing
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter by property, contact, notes..." className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ShowingStatus)} className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <option value="all">All statuses</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as 'all' | 'upcoming' | 'past' | 'today')} className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <option value="all">All dates</option><option value="today">Today</option><option value="upcoming">Upcoming</option><option value="past">Past</option>
        </select>
        <div className="flex gap-2">
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="min-w-0 flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="scheduledAt">Sort by date</option><option value="property">Sort by property</option><option value="status">Sort by status</option><option value="participants">Sort by participants</option>
          </select>
          <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white"><ArrowUpDown size={16} /></button>
        </div>
      </div>

      <div className="space-y-4">
        {visibleShowings.map((showing) => {
          const showingProperties = getShowingProperties(showing);
          const showingParticipants = getShowingParticipants(showing);
          return (
            <motion.div
              key={showing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedShowing(showing)}
              className="w-full bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-blue-500/40 transition-all group cursor-pointer"
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 border border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {new Date(showing.scheduledAt).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-white">
                      {new Date(showing.scheduledAt).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-all">
                        {showingProperties.length === 1 ? showingProperties[0].address : `${showingProperties.length || 'No'} Showing Locations`}
                      </h3>
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", statusColors[showing.status])}>
                        {showing.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Locations</p>
                        <div className="flex flex-wrap gap-2">
                          {showingProperties.length > 0 ? showingProperties.map(property => (
                            <span key={property.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-slate-100 border border-blue-400/30 shadow-sm shadow-blue-950/20">
                              <MapPin size={12} className="text-blue-300" /> {property.address}
                            </span>
                          )) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-700">
                              <MapPin size={12} className="text-slate-500" /> No locations selected
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Schedule</p>
                        <div className="space-y-1 text-sm text-slate-200">
                          <div className="flex items-center gap-2"><Clock size={14} className="text-emerald-400" /> Start: {formatShowingDateTime(showing.scheduledAt)}</div>
                          <div className="flex items-center gap-2"><Clock size={14} className="text-rose-400" /> End: {formatShowingDateTime(showing.endScheduledAt)}</div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Participants</p>
                        <div className="flex flex-wrap gap-2">
                          {showingParticipants.length > 0 ? showingParticipants.map(contact => (
                            <span key={contact.id} className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 border border-slate-700">
                              <Users size={12} className="text-slate-400" /> {contact.fullName}
                            </span>
                          )) : <span className="text-sm text-slate-400">No participants selected</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <StickyNote size={14} /> {showing.notesTimeline?.length || 0} timeline notes
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 xl:self-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => updateShowingStatus(showing, 'completed')} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" aria-label="Mark showing completed"><CheckCircle2 size={20} /></button>
                  <button onClick={() => updateShowingStatus(showing, 'cancelled')} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" aria-label="Cancel showing"><XCircle size={20} /></button>
                  <button onClick={() => openEditModal(showing)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" aria-label="Edit showing"><Edit3 size={20} /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {visibleShowings.length === 0 && <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-2xl text-center text-slate-400">No showings match the selected filters.</div>}
      </div>

      <AnimatePresence>{selectedShowing && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedShowing(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"><div className="p-6 border-b border-slate-800 flex items-center justify-between"><div><h2 className="text-xl font-bold text-white">Showing Details</h2><p className="text-sm text-slate-400">{getPrimaryProperty(selectedShowing)?.address || 'Property Viewing'}</p></div><div className="flex gap-2"><button onClick={() => openEditModal(selectedShowing)} className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 flex items-center gap-2"><Edit3 size={16} /> Edit</button><button onClick={() => setSelectedShowing(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><XCircle size={20} /></button></div></div><div className="p-6 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div className="p-4 bg-slate-800/50 rounded-xl"><p className="text-slate-500 uppercase text-[10px] font-bold">Status</p><p className="text-white capitalize">{selectedShowing.status}</p></div><div className="p-4 bg-slate-800/50 rounded-xl"><p className="text-slate-500 uppercase text-[10px] font-bold">Time</p><p className="text-white">{new Date(selectedShowing.scheduledAt).toLocaleString()} {selectedShowing.endScheduledAt && `- ${new Date(selectedShowing.endScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</p></div><div className="p-4 bg-slate-800/50 rounded-xl"><p className="text-slate-500 uppercase text-[10px] font-bold">Properties</p><p className="text-white">{selectedShowing.propertyIds?.map(id => getProperty(id)?.address).filter(Boolean).join(', ') || 'N/A'}</p></div><div className="p-4 bg-slate-800/50 rounded-xl"><p className="text-slate-500 uppercase text-[10px] font-bold">Participants</p><p className="text-white">{selectedShowing.participantIds?.map(id => getContact(id)?.fullName).filter(Boolean).join(', ') || 'None'}</p></div></div>{selectedShowing.notes && <div className="p-4 bg-slate-800/50 rounded-xl"><p className="text-slate-500 uppercase text-[10px] font-bold mb-1">General Notes</p><p className="text-slate-300">{selectedShowing.notes}</p></div>}<div><h3 className="font-bold text-white mb-3">Timeline Notes</h3><div className="flex gap-2 mb-4"><input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a timeline note..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" /><button onClick={addTimelineNote} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500">Add</button></div><div className="space-y-3 border-l border-slate-700 pl-4">{(selectedShowing.notesTimeline || []).map(note => <div key={note.id} className="relative"><span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900" /><p className="text-sm text-white">{note.note}</p><p className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</p></div>)}{!selectedShowing.notesTimeline?.length && <p className="text-sm text-slate-500">No timeline notes yet.</p>}</div></div></div></motion.div></div>}</AnimatePresence>

      <AnimatePresence>{isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"><div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50"><h2 className="text-xl font-bold text-white">{editingShowing ? 'Edit Showing' : 'Schedule New Showing'}</h2><button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><XCircle size={20} /></button></div><form onSubmit={saveShowing} className="p-8 space-y-6"><MultiSelect label="PROPERTIES" options={propertyOptions} selectedIds={showingForm.propertyIds || []} onChange={(ids) => setShowingForm({ ...showingForm, propertyIds: ids })} placeholder="Select properties to show..." /><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Time</label><input required type="datetime-local" value={showingForm.scheduledAt} onChange={(e) => setShowingForm({ ...showingForm, scheduledAt: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Time</label><input required type="datetime-local" value={showingForm.endScheduledAt} onChange={(e) => setShowingForm({ ...showingForm, endScheduledAt: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div></div><select value={showingForm.status} onChange={(e) => setShowingForm({ ...showingForm, status: e.target.value as ShowingStatus })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><MultiSelect label="PARTICIPANTS" options={contactOptions} selectedIds={showingForm.participantIds || []} onChange={(ids) => setShowingForm({ ...showingForm, participantIds: ids })} placeholder="Select participants..." /><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes</label><textarea value={showingForm.notes} onChange={(e) => setShowingForm({ ...showingForm, notes: e.target.value })} placeholder="Any special instructions..." className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]" /></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700">Cancel</button><button type="submit" disabled={loading || !showingForm.scheduledAt || !showingForm.endScheduledAt || !showingForm.propertyIds?.length} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Saving...' : editingShowing ? 'Save Changes' : 'Schedule Showing'}</button></div></form></motion.div></div>}</AnimatePresence>
    </div>
  );
}
