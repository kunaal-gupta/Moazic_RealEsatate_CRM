import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Showing, Property, Contact } from '../types';
import { cn } from '../lib/utils';

export default function Showings() {
  const [showings, setShowings] = useState<Showing[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newShowing, setNewShowing] = useState<Partial<Showing>>({
    propertyId: '',
    scheduledAt: '',
    status: 'scheduled',
    participantIds: [],
    notes: ''
  });

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

  const handleScheduleShowing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduledShowing = await api.showings.create(newShowing);
      setShowings([scheduledShowing, ...showings]);
      setIsModalOpen(false);
      setNewShowing({
        propertyId: '',
        scheduledAt: '',
        status: 'scheduled',
        participantIds: [],
        notes: ''
      });
    } catch (error) {
      console.error('Failed to schedule showing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProperty = (id: string) => properties.find(p => p.id === id);

  const statusColors = {
    scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Showings</h1>
          <p className="text-slate-400 mt-1">Schedule and manage property viewings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Schedule Showing
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendar Placeholder / List */}
        <div className="xl:col-span-2 space-y-4">
          {(showings.length > 0 ? showings : [
            { id: 's1', propertyId: 'p1', scheduledAt: new Date().toISOString(), status: 'scheduled', participantIds: ['c1'] },
            { id: 's2', propertyId: 'p2', scheduledAt: new Date(Date.now() - 86400000).toISOString(), status: 'completed', participantIds: ['c2'] }
          ]).map((showing) => {
            const property = getProperty(showing.propertyId);
            return (
              <motion.div
                key={showing.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-6 hover:border-slate-700 transition-all group"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {new Date(showing.scheduledAt).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold text-white">
                    {new Date(showing.scheduledAt).getDate()}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-all">
                      {property?.address || 'Property Viewing'}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border",
                      statusColors[showing.status as keyof typeof statusColors]
                    )}>
                      {showing.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-500" />
                      {new Date(showing.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500" />
                      {property?.community || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-500" />
                      {showing.participantIds.length} Participants
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                    <CheckCircle2 size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                    <XCircle size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mini Calendar / Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-blue-500" />
              Upcoming Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm text-slate-400">Today</span>
                <span className="text-sm font-bold text-white">3 Showings</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm text-slate-400">Tomorrow</span>
                <span className="text-sm font-bold text-white">5 Showings</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm text-slate-400">This Week</span>
                <span className="text-sm font-bold text-white">12 Showings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Showing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h2 className="text-xl font-bold text-white">Schedule New Showing</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleScheduleShowing} className="p-8 space-y-6">
                {/* Property Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Property</label>
                  <select
                    required
                    value={newShowing.propertyId}
                    onChange={(e) => setNewShowing({ ...newShowing, propertyId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="">Select a property</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.address} - {p.community}</option>
                    ))}
                  </select>
                </div>

                {/* Scheduled At */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={newShowing.scheduledAt}
                    onChange={(e) => setNewShowing({ ...newShowing, scheduledAt: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                {/* Participants */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Participants</label>
                  <select
                    multiple
                    value={newShowing.participantIds}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                      setNewShowing({ ...newShowing, participantIds: values });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px]"
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">Hold Ctrl/Cmd to select multiple participants.</p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes</label>
                  <textarea
                    value={newShowing.notes}
                    onChange={(e) => setNewShowing({ ...newShowing, notes: e.target.value })}
                    placeholder="Any special instructions..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[80px]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Showing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
