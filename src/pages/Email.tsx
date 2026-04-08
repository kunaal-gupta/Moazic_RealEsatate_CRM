import React, { useState, useEffect } from 'react';
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
  Star,
  X,
  User,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { EmailTemplate, Email as EmailType, Contact } from '../types';

export default function Email() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'templates'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);
  const [composeData, setComposeData] = useState({
    contactId: '',
    subject: '',
    body: '',
    templateId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const [t, e, c] = await Promise.all([
        api.emailTemplates.list(),
        api.emails.list(),
        api.contacts.list()
      ]);
      setTemplates(t);
      setEmails(e);
      setContacts(c);
    };
    fetchData();
  }, []);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      if (editingTemplate.id) {
        const updated = await api.emailTemplates.update(editingTemplate.id, editingTemplate);
        setTemplates(templates.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await api.emailTemplates.create(editingTemplate);
        setTemplates([...templates, created]);
      }
      setIsTemplateModalOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await api.emailTemplates.delete(templateToDelete);
      setTemplates(templates.filter(t => t.id !== templateToDelete));
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEmail = await api.emails.create({
        contactId: composeData.contactId,
        subject: composeData.subject,
        body: composeData.body,
        status: 'sent',
        createdAt: new Date().toISOString()
      });
      setEmails([newEmail, ...emails]);
      setIsComposeOpen(false);
      setComposeData({ contactId: '', subject: '', body: '', templateId: '' });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComposeData(prev => ({
        ...prev,
        templateId,
        subject: template.subject,
        body: template.body
      }));
    }
  };

  const getContactName = (id: string) => contacts.find(c => c.id === id)?.fullName || 'Unknown';

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email & Automation</h1>
          <p className="text-slate-400 mt-1">Manage client communications and email templates.</p>
        </div>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
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
                <button 
                  onClick={() => {
                    setEditingTemplate({ name: '', subject: '', body: '' });
                    setIsTemplateModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest"
                >
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
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate(t);
                            setIsTemplateModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-white"
                        >
                          <SettingsIcon size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToDelete(t.id);
                          }}
                          className="text-slate-500 hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-all">{t.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{t.subject}</p>
                    <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Template</span>
                      <button 
                        onClick={() => {
                          setEditingTemplate(t);
                          setIsTemplateModalOpen(true);
                        }}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
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
                  {emails.filter(e => activeTab === 'inbox' ? e.status === 'pending' : e.status === 'sent').map(email => (
                    <div 
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:bg-slate-800/30",
                        selectedEmail?.id === email.id ? "bg-slate-800/50 border-l-4 border-blue-600" : ""
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-white">
                          {getContactName(email.contactId)}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(email.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs mb-1 truncate text-blue-400 font-bold">
                        {email.subject}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{email.body}</p>
                    </div>
                  ))}
                  {emails.filter(e => activeTab === 'inbox' ? e.status === 'pending' : e.status === 'sent').length === 0 && (
                    <div className="p-8 text-center text-slate-600 text-xs">
                      No emails found
                    </div>
                  )}
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
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase">
                            {getContactName(selectedEmail.contactId)[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{getContactName(selectedEmail.contactId)}</p>
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
                    <div className="flex-1 text-slate-300 space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedEmail.body}
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

      {/* Compose Email Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">Compose Email</h2>
                <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recipient</label>
                    <select 
                      value={composeData.contactId}
                      onChange={(e) => setComposeData({ ...composeData, contactId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    >
                      <option value="">Select Contact</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Template (Optional)</label>
                    <select 
                      value={composeData.templateId}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">No Template</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                  <input 
                    type="text" 
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Email Subject"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message</label>
                  <textarea 
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[200px]"
                    placeholder="Write your message here..."
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Send Email
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {isTemplateModalOpen && editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingTemplate.id ? 'Edit Template' : 'Create Template'}
                </h2>
                <button onClick={() => {
                  setIsTemplateModalOpen(false);
                  setEditingTemplate(null);
                }} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Template Name</label>
                  <input 
                    type="text" 
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g. Initial Follow-up"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Default Subject</label>
                  <input 
                    type="text" 
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Email Subject"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Template Body</label>
                  <textarea 
                    value={editingTemplate.body}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[200px]"
                    placeholder="Write your template here..."
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsTemplateModalOpen(false);
                      setEditingTemplate(null);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {templateToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Delete Template?</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to delete this template? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setTemplateToDelete(null)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteTemplate}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
