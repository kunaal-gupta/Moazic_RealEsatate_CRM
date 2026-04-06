import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  ChevronRight,
  Inbox,
  SendHorizontal,
  Archive,
  Trash2,
  Settings as SettingsIcon,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Email() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'templates'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const templates = [
    { id: 't1', name: 'Initial Lead Follow-up', subject: 'Welcome to LuxeCRM - Next Steps' },
    { id: 't2', name: 'Property Showing Confirmation', subject: 'Confirmed: Showing for {{property_address}}' },
    { id: 't3', name: 'Offer Submission', subject: 'New Offer Received for {{property_address}}' },
    { id: 't4', name: 'Closing Documents', subject: 'Action Required: Closing Documents for {{deal_id}}' },
  ];

  const emails = [
    { id: 'e1', from: 'John Smith', subject: 'Question about Maple St', preview: 'Hi, I was wondering if the basement is fully finished...', date: '10:45 AM', read: false },
    { id: 'e2', from: 'Sarah Johnson', subject: 'Offer documents', preview: 'Attached are the signed documents for the Pine Ave listing...', date: 'Yesterday', read: true },
    { id: 'e3', from: 'Michael Brown', subject: 'Showing request', preview: 'Would it be possible to see the Oak Ridge property this weekend?', date: '2 days ago', read: true },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email & Automation</h1>
          <p className="text-slate-400 mt-1">Manage client communications and email templates.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Send size={18} /> Compose Email
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('inbox')}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
              activeTab === 'inbox' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Inbox size={18} />
              <span className="font-medium">Inbox</span>
            </div>
            <span className="text-xs font-bold bg-slate-900/50 px-2 py-0.5 rounded-full">3</span>
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'sent' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <SendHorizontal size={18} />
            <span className="font-medium">Sent</span>
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'templates' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <FileText size={18} />
            <span className="font-medium">Templates</span>
          </button>
          <div className="h-px bg-slate-800 my-2"></div>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Archive size={18} />
            <span className="font-medium">Archive</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Trash2 size={18} />
            <span className="font-medium">Trash</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden flex">
          {activeTab === 'templates' ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white">Email Templates</h3>
                <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">
                  <Plus size={16} /> Create Template
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <FileText size={20} />
                      </div>
                      <button className="text-slate-500 hover:text-white">
                        <SettingsIcon size={16} />
                      </button>
                    </div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-all">{t.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{t.subject}</p>
                    <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Used 24 times</span>
                      <button className="text-xs font-bold text-blue-400 hover:text-blue-300">Edit</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Email List */}
              <div className="w-1/3 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search email..." 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
                  {emails.map(email => (
                    <div 
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:bg-slate-800/30",
                        selectedEmail?.id === email.id ? "bg-slate-800/50 border-l-4 border-blue-600" : "",
                        !email.read ? "bg-blue-600/5" : ""
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn("text-sm font-bold", !email.read ? "text-white" : "text-slate-300")}>
                          {email.from}
                        </span>
                        <span className="text-[10px] text-slate-500">{email.date}</span>
                      </div>
                      <h4 className={cn("text-xs mb-1 truncate", !email.read ? "text-blue-400 font-bold" : "text-slate-400")}>
                        {email.subject}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{email.preview}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 flex flex-col">
                {selectedEmail ? (
                  <div className="flex-1 flex flex-col p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedEmail.subject}</h2>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                            {selectedEmail.from[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{selectedEmail.from}</p>
                            <p className="text-xs text-slate-500">to me (kunaal@luxecrm.com)</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-amber-400 transition-all">
                          <Star size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 text-slate-300 space-y-4 text-sm leading-relaxed">
                      <p>Dear Kunaal,</p>
                      <p>{selectedEmail.preview} and I'd like to schedule a follow-up call to discuss the details further.</p>
                      <p>I've been looking at several properties in the Oak Ridge area, but the Maple St listing really caught my eye due to its unique architecture and the size of the lot.</p>
                      <p>Looking forward to hearing from you soon.</p>
                      <p>Best regards,<br />{selectedEmail.from}</p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800">
                      <div className="flex gap-4">
                        <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all">
                          Reply
                        </button>
                        <button className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all">
                          Forward
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                    <Mail size={48} className="mb-4 opacity-20" />
                    <p>Select an email to read</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
