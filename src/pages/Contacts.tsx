import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Contact } from '../types';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.contacts.list().then(data => {
      setContacts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-slate-400 mt-1">Manage your clients and prospects.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Added</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {contacts.map((contact) => (
                <motion.tr 
                  key={contact.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-800/30 transition-all group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                        {contact.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-white">{contact.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail size={14} />
                      {contact.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone size={14} />
                      {contact.phoneNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-tighter">
                      <Tag size={10} />
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {contacts.length} of {contacts.length} contacts</p>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 text-slate-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
