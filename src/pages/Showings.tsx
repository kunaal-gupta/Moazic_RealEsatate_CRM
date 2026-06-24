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
  StickyNote,
  ChevronDown,
  Home,
  Mail,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Showing, ShowingNote, Property, Contact, EmailTemplate, Email as EmailType } from '../types';
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
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShowing, setSelectedShowing] = useState<Showing | null>(null);
  const [editingShowing, setEditingShowing] = useState<Showing | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newNotePropertyId, setNewNotePropertyId] = useState<string>('general');
  const [notesPropertyFilterId, setNotesPropertyFilterId] = useState<string>('all');
  const [savingNote, setSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ShowingStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('scheduledAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showingForm, setShowingForm] = useState<ShowingFormState>(emptyShowingForm);
  const [expandedShowingIds, setExpandedShowingIds] = useState<Set<string>>(new Set());
  const [notificationShowing, setNotificationShowing] = useState<Showing | null>(null);
  const [notificationContactIds, setNotificationContactIds] = useState<string[]>([]);
  const [notificationTemplateId, setNotificationTemplateId] = useState('');
  const [sendingNotifications, setSendingNotifications] = useState(false);

  const propertyOptions = properties.map(p => ({ id: p.id, name: `${p.address} (${p.community})` }));
  const contactOptions = contacts.map(c => ({ id: c.id, name: c.fullName }));

  useEffect(() => {
    Promise.all([
      api.showings.list(), 
      api.properties.list(),
      api.contacts.list(),
      api.emailTemplates.list(),
      api.emails.list()
    ]).then(([s, p, c, templates, emailRecords]) => {
      setShowings(s);
      setProperties(p);
      setContacts(c);
      setEmailTemplates(templates);
      setEmails(emailRecords);
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

  const getShowingNotificationEmails = (showing: Showing) => emails.filter(email => (email as EmailType & { showingId?: string }).showingId === showing.id);

  const openNotificationModal = (showing: Showing) => {
    const sentContactIds = new Set(getShowingNotificationEmails(showing).map(email => email.contactId));
    setNotificationShowing(showing);
    setNotificationContactIds((showing.participantIds || []).filter(contactId => !sentContactIds.has(contactId)));
    setNotificationTemplateId(emailTemplates.find(template => template.name.toLowerCase().includes('showing'))?.id || emailTemplates[0]?.id || '');
  };

  const closeNotificationModal = () => {
    setNotificationShowing(null);
    setNotificationContactIds([]);
    setNotificationTemplateId('');
  };

  const renderNotificationText = (text: string, showing: Showing, contact: Contact) => {
    const showingProperties = getShowingProperties(showing);
    const propertyAddress = showingProperties.map(property => property.address).join(', ') || 'the selected property';
    const showingDate = new Date(showing.scheduledAt).toLocaleDateString();
    const showingTime = new Date(showing.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return text
      .replaceAll('{{contact_name}}', contact.fullName)
      .replaceAll('{{property_address}}', propertyAddress)
      .replaceAll('{{showing_date}}', showingDate)
      .replaceAll('{{showing_time}}', showingTime)
      .replaceAll('{{agent_name}}', 'Your agent');
  };

  const sendShowingNotifications = async () => {
    if (!notificationShowing || notificationContactIds.length === 0 || sendingNotifications) return;
    setSendingNotifications(true);
    try {
      const template = emailTemplates.find(item => item.id === notificationTemplateId);
      const showingProperties = getShowingProperties(notificationShowing);
      const propertyAddress = showingProperties.map(property => property.address).join(', ') || 'Showing';
      const fallbackSubject = `Confirmed: Showing for ${propertyAddress}`;
      const fallbackBody = 'Hi {{contact_name}},\n\nThis is to confirm your showing for {{property_address}} on {{showing_date}} at {{showing_time}}.\n\nSee you there!';
      const sentEmails = await Promise.all(notificationContactIds.map(async contactId => {
        const contact = getContact(contactId);
        if (!contact) return null;
        return api.emails.create({
          contactId,
          subject: renderNotificationText(template?.subject || fallbackSubject, notificationShowing, contact),
          body: renderNotificationText(template?.body || fallbackBody, notificationShowing, contact),
          status: 'sent',
          dealId: notificationShowing.dealId,
          showingId: notificationShowing.id,
          createdAt: new Date().toISOString()
        } as Partial<EmailType> & { showingId: string });
      }));
      setEmails(prev => [...sentEmails.filter((email): email is EmailType => Boolean(email)), ...prev]);
      closeNotificationModal();
    } catch (error) {
      console.error('Failed to send showing notifications:', error);
    } finally {
      setSendingNotifications(false);
    }
  };

  const visibleShowings = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfTomorrow = startOfToday + 86400000;

    return [...showings]
      .filter((showing) => {
        const propertyNames = showing.propertyIds?.map(id => getProperty(id)?.address || '').join(' ') || '';
        const participantNames = showing.participantIds?.map(id => getContact(id)?.fullName || '').join(' ') || '';
        const timelineNotes = showing.notesTimeline?.map(note => note.note).join(' ') || '';
        const searchable = `${propertyNames} ${participantNames} ${showing.status} ${showing.notes || ''} ${timelineNotes}`.toLowerCase();
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

  const openNotesModal = (showing: Showing) => {
    setSelectedShowing(showing);
    setNewNote('');
    setNewNotePropertyId('general');
    setNotesPropertyFilterId('all');
    cancelEditingNote();
  };

  const toggleShowingExpanded = (showingId: string) => {
    setExpandedShowingIds(prev => {
      const next = new Set(prev);
      if (next.has(showingId)) {
        next.delete(showingId);
      } else {
        next.add(showingId);
      }
      return next;
    });
  };

  const openEditModal = (showing: Showing) => {
    setEditingShowing(showing);
    setShowingForm({ ...showing, propertyIds: showing.propertyIds || [], participantIds: showing.participantIds || [] });
    setSelectedShowing(null);
    setIsModalOpen(true);
  };

  const saveShowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showingForm.scheduledAt && showingForm.endScheduledAt && new Date(showingForm.endScheduledAt).getTime() < new Date(showingForm.scheduledAt).getTime()) {
      return;
    }
    setLoading(true);
    try {
      if (editingShowing) {
        const updatedShowing = await api.showings.update(editingShowing.id, showingForm);
        setShowings(showings.map(showing => showing.id === updatedShowing.id ? updatedShowing : showing));
      } else {
        const scheduledShowing = await api.showings.create(showingForm);
        setShowings([scheduledShowing, ...showings]);
        if (scheduledShowing.participantIds?.length) {
          openNotificationModal(scheduledShowing);
        }
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

  const syncSelectedShowing = (updatedShowing: Showing) => {
    setShowings(prev => prev.map(item => item.id === updatedShowing.id ? updatedShowing : item));
    setSelectedShowing(updatedShowing);
  };

  const addTimelineNote = async () => {
    if (!selectedShowing || !newNote.trim() || savingNote) return;
    setSavingNote(true);
    try {
      const showingProperties = getShowingProperties(selectedShowing);
      const selectedPropertyId = newNotePropertyId !== 'general' && showingProperties.some(property => property.id === newNotePropertyId)
        ? newNotePropertyId
        : undefined;
      const note: ShowingNote = {
        id: Math.random().toString(36).slice(2, 9),
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
        ...(selectedPropertyId ? { propertyId: selectedPropertyId } : {})
      };
      const updatedShowing = await api.showings.update(selectedShowing.id, {
        notesTimeline: [note, ...(selectedShowing.notesTimeline || [])]
      });
      syncSelectedShowing(updatedShowing);
      setNewNote('');
      setNewNotePropertyId('general');
    } catch (error) {
      console.error('Failed to add showing note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  const getNoteProperty = (note: ShowingNote) => getProperty(note.propertyId);

  const startEditingNote = (noteId: string, noteText: string) => {
    setEditingNoteId(noteId);
    setEditingNoteText(noteText);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const saveTimelineNote = async (noteId: string) => {
    if (!selectedShowing || !editingNoteText.trim()) return;
    const updatedShowing = await api.showings.update(selectedShowing.id, {
      notesTimeline: (selectedShowing.notesTimeline || []).map(note => (
        note.id === noteId ? { ...note, note: editingNoteText.trim() } : note
      ))
    });
    syncSelectedShowing(updatedShowing);
    cancelEditingNote();
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
          const isExpanded = expandedShowingIds.has(showing.id);
          const startDateLabel = formatShowingDateTime(showing.scheduledAt);

          return (
            <motion.div
              key={showing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all group hover:border-blue-500/40"
            >
              <button
                type="button"
                onClick={() => toggleShowingExpanded(showing.id)}
                className="w-full p-5 text-left"
                aria-expanded={isExpanded}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 border border-slate-700">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(showing.scheduledAt).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {new Date(showing.scheduledAt).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-all">
                          {showingProperties.length === 1 ? showingProperties[0].address : `${showingProperties.length || 'No'} Showing Locations`}
                        </h3>
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", statusColors[showing.status])}>
                          {showing.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-3">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                          <Home size={14} className="text-blue-300" /> {showingProperties.length} homes
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                          <Users size={14} className="text-emerald-300" /> {showingParticipants.length} participants
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                          <Clock size={14} className="text-amber-300" /> {startDateLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 xl:justify-end">
                    <span className="inline-flex items-center gap-2">
                      <StickyNote size={14} /> {showing.notesTimeline?.length || 0} timeline notes
                    </span>
                    <ChevronDown className={cn("text-slate-400 transition-transform", isExpanded && "rotate-180")} size={20} />
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-800"
                  >
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="rounded-xl bg-slate-950/40 p-3">
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

                        <div className="rounded-xl bg-slate-950/40 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Schedule</p>
                          <div className="space-y-1 text-sm text-slate-200">
                            <div className="flex items-center gap-2"><Clock size={14} className="text-emerald-400" /> Start: {formatShowingDateTime(showing.scheduledAt)}</div>
                            <div className="flex items-center gap-2"><Clock size={14} className="text-rose-400" /> End: {formatShowingDateTime(showing.endScheduledAt)}</div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-slate-950/40 p-3">
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

                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => openNotificationModal(showing)} disabled={!showingParticipants.length} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                          <Mail size={16} /> Email Clients ({getShowingNotificationEmails(showing).length}/{showingParticipants.length})
                        </button>
                        <button type="button" onClick={() => openNotesModal(showing)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500">
                          <StickyNote size={16} /> Add Notes
                        </button>
                        <button type="button" onClick={() => updateShowingStatus(showing, 'completed')} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition-all hover:bg-emerald-500/10 hover:text-emerald-400">
                          <CheckCircle2 size={16} /> Complete
                        </button>
                        <button type="button" onClick={() => updateShowingStatus(showing, 'cancelled')} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition-all hover:bg-rose-500/10 hover:text-rose-400">
                          <XCircle size={16} /> Cancel
                        </button>
                        <button type="button" onClick={() => openEditModal(showing)} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white">
                          <Edit3 size={16} /> Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {visibleShowings.length === 0 && <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-2xl text-center text-slate-400">No showings match the selected filters.</div>}
      </div>

      <AnimatePresence>{selectedShowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedShowing(null);
              cancelEditingNote();
            }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl max-h-[86vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"
          >
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/70">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Showing Notes</p>
                <h2 className="text-xl font-bold text-white">Timeline & Follow-ups</h2>
                <p className="text-sm text-slate-400">Add updates, client feedback, and next steps for this showing.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedShowing(null);
                  cancelEditingNote();
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {(() => {
                const selectedShowingProperties = getShowingProperties(selectedShowing);
                return (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Add Timeline Note</label>
                        <p className="mt-1 text-xs text-slate-500">Attach feedback to the whole showing or to one specific property.</p>
                      </div>
                      <div className="min-w-[220px] space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Note Scope</label>
                        <select
                          value={newNotePropertyId}
                          onChange={(e) => setNewNotePropertyId(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="general">General showing note</option>
                          {selectedShowingProperties.map(property => (
                            <option key={property.id} value={property.id}>{property.address}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write a clear note, client feedback, or next action..."
                      className="mt-3 w-full min-h-[86px] bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={addTimelineNote}
                        disabled={!newNote.trim() || savingNote}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingNote ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const selectedShowingProperties = getShowingProperties(selectedShowing);
                const filteredNotes = (selectedShowing.notesTimeline || []).filter(note => (
                  notesPropertyFilterId === 'all'
                  || (notesPropertyFilterId === 'general' && !note.propertyId)
                  || note.propertyId === notesPropertyFilterId
                ));

                return (
                  <div>
                    <div className="mb-4 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-bold text-white">Notes Timeline</h3>
                        <span className="w-fit rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {filteredNotes.length} of {selectedShowing.notesTimeline?.length || 0} notes
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        <button type="button" onClick={() => setNotesPropertyFilterId('all')} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all", notesPropertyFilterId === 'all' ? "border-blue-400 bg-blue-500/20 text-blue-100" : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white")}>All</button>
                        <button type="button" onClick={() => setNotesPropertyFilterId('general')} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all", notesPropertyFilterId === 'general' ? "border-blue-400 bg-blue-500/20 text-blue-100" : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white")}>General</button>
                        {selectedShowingProperties.map(property => (
                          <button key={property.id} type="button" onClick={() => setNotesPropertyFilterId(property.id)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all", notesPropertyFilterId === property.id ? "border-blue-400 bg-blue-500/20 text-blue-100" : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white")}>
                            {property.address}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-l border-slate-700 pl-4 sm:pl-5">
                      {filteredNotes.map(note => (
                    <div key={note.id} className="relative rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <span className="absolute -left-[27px] top-5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-lg shadow-blue-500/30" />
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full min-h-[90px] bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={cancelEditingNote} className="px-3 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-700">Cancel</button>
                            <button onClick={() => saveTimelineNote(note.id)} disabled={!editingNoteText.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">Save Note</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getNoteProperty(note) ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                                <MapPin size={12} /> {getNoteProperty(note)?.address}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                General Showing
                              </span>
                            )}
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm leading-6 text-slate-100">{note.note}</p>
                            <button onClick={() => startEditingNote(note.id, note.note)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800">
                              <Edit3 size={13} /> Edit
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                      {!filteredNotes.length && (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-6 text-center text-sm text-slate-500">
                          {selectedShowing.notesTimeline?.length ? 'No notes match this property filter.' : 'No timeline notes yet. Add the first professional follow-up note above.'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>


      <AnimatePresence>{notificationShowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeNotificationModal} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-900/70 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Showing Notification</p>
                <h2 className="text-xl font-bold text-white">Email Clients</h2>
                <p className="text-sm text-slate-400">Select which showing participants should receive this confirmation.</p>
              </div>
              <button onClick={closeNotificationModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><XCircle size={20} /></button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                <p className="font-bold text-white">{getShowingProperties(notificationShowing).map(property => property.address).join(', ') || 'No property selected'}</p>
                <p className="mt-1 text-slate-400">{formatShowingDateTime(notificationShowing.scheduledAt)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Template</label>
                <select value={notificationTemplateId} onChange={(e) => setNotificationTemplateId(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  <option value="">Default showing confirmation</option>
                  {emailTemplates.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Clients</label>
                  <span className="text-xs text-slate-500">{notificationContactIds.length} selected</span>
                </div>
                <div className="space-y-2">
                  {getShowingParticipants(notificationShowing).map(contact => {
                    const alreadySent = getShowingNotificationEmails(notificationShowing).some(email => email.contactId === contact.id);
                    const checked = notificationContactIds.includes(contact.id);
                    return (
                      <label key={contact.id} className={cn("flex items-center justify-between gap-3 rounded-xl border p-3", alreadySent ? "border-emerald-500/20 bg-emerald-500/10" : "border-slate-800 bg-slate-950/40")}>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-white">{contact.fullName}</span>
                          <span className="block truncate text-xs text-slate-400">{contact.email}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          {alreadySent && <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">Sent</span>}
                          <input type="checkbox" checked={checked} onChange={(e) => setNotificationContactIds(prev => e.target.checked ? [...prev, contact.id] : prev.filter(id => id !== contact.id))} className="h-4 w-4 accent-indigo-500" />
                        </span>
                      </label>
                    );
                  })}
                  {!getShowingParticipants(notificationShowing).length && <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">No participants are attached to this showing.</p>}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeNotificationModal} className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Cancel</button>
                <button type="button" onClick={sendShowingNotifications} disabled={!notificationContactIds.length || sendingNotifications} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                  <Send size={16} /> {sendingNotifications ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <AnimatePresence>{isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"><div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50"><h2 className="text-xl font-bold text-white">{editingShowing ? 'Edit Showing' : 'Schedule New Showing'}</h2><button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><XCircle size={20} /></button></div><form onSubmit={saveShowing} className="p-5 sm:p-6 space-y-5"><MultiSelect label="PROPERTIES" options={propertyOptions} selectedIds={showingForm.propertyIds || []} onChange={(ids) => setShowingForm({ ...showingForm, propertyIds: ids })} placeholder="Select properties to show..." /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Time</label><input required type="datetime-local" value={showingForm.scheduledAt} onChange={(e) => setShowingForm({ ...showingForm, scheduledAt: e.target.value, endScheduledAt: showingForm.endScheduledAt && new Date(showingForm.endScheduledAt).getTime() < new Date(e.target.value).getTime() ? e.target.value : showingForm.endScheduledAt })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Time</label><input required type="datetime-local" min={showingForm.scheduledAt || undefined} value={showingForm.endScheduledAt} onChange={(e) => setShowingForm({ ...showingForm, endScheduledAt: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div></div><select value={showingForm.status} onChange={(e) => setShowingForm({ ...showingForm, status: e.target.value as ShowingStatus })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><MultiSelect label="PARTICIPANTS" options={contactOptions} selectedIds={showingForm.participantIds || []} onChange={(ids) => setShowingForm({ ...showingForm, participantIds: ids })} placeholder="Select participants..." /><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes</label><textarea value={showingForm.notes} onChange={(e) => setShowingForm({ ...showingForm, notes: e.target.value })} placeholder="Any special instructions..." className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]" /></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700">Cancel</button><button type="submit" disabled={loading || !showingForm.scheduledAt || !showingForm.endScheduledAt || !showingForm.propertyIds?.length || new Date(showingForm.endScheduledAt).getTime() < new Date(showingForm.scheduledAt).getTime()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Saving...' : editingShowing ? 'Save Changes' : 'Schedule Showing'}</button></div></form></motion.div></div>}</AnimatePresence>
    </div>
  );
}
