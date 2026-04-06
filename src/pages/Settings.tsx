import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Mail, 
  Lock,
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'general'>('users');

  const users = [
    { id: 'u1', name: 'Kunaal Gupta', email: 'kunaal@luxecrm.com', role: 'Super Admin', status: 'active' },
    { id: 'u2', name: 'Jane Doe', email: 'jane@luxecrm.com', role: 'Agent', status: 'active' },
    { id: 'u3', name: 'Michael Smith', email: 'michael@luxecrm.com', role: 'Agent', status: 'inactive' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your team, roles, and application preferences.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'general' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Globe size={18} />
            <span className="font-medium">General</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'users' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <User size={18} />
            <span className="font-medium">Users & Team</span>
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'roles' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Shield size={18} />
            <span className="font-medium">Roles & Permissions</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Bell size={18} />
            <span className="font-medium">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Database size={18} />
            <span className="font-medium">Data & Export</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
          {activeTab === 'users' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Team Members</h3>
                  <p className="text-sm text-slate-500">Manage who has access to LuxeCRM.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                  <Plus size={18} /> Invite User
                </button>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl group hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-slate-600">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{user.name}</h4>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {user.status === 'active' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                              <CheckCircle2 size={10} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                              <XCircle size={10} /> Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Roles & Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Super Admin', 'Agent', 'Client'].map((role) => (
                  <div key={role} className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Shield size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {role === 'Super Admin' ? 'Full Access' : 'Limited Access'}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-all">{role}</h4>
                    <p className="text-sm text-slate-400 mb-6">
                      {role === 'Super Admin' ? 'Can manage all aspects of the application, including billing and user management.' : 
                       role === 'Agent' ? 'Can manage deals, contacts, and properties assigned to them.' : 
                       'Can view their own deals and communicate with agents.'}
                    </p>
                    <button className="text-sm font-bold text-blue-400 hover:text-blue-300">Edit Permissions</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue="Luxe Real Estate Group"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Timezone</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option>Mountain Time (US & Canada)</option>
                    <option>Pacific Time (US & Canada)</option>
                    <option>Eastern Time (US & Canada)</option>
                  </select>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-800 flex justify-end">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
