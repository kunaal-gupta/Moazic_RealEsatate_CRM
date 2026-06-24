import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Briefcase,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Activity as ActivityIcon,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Deal, Activity, Lead, Showing } from '../types';

const cardColors: Record<string, { icon: string; bg: string; ring: string }> = {
  blue: { icon: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'group-hover:border-blue-500/40' },
  indigo: { icon: 'text-indigo-400', bg: 'bg-indigo-500/10', ring: 'group-hover:border-indigo-500/40' },
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'group-hover:border-emerald-500/40' },
  amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'group-hover:border-amber-500/40' }
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color, to }: any) => {
  const palette = cardColors[color] || cardColors.blue;
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-slate-900/70", palette.ring)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("rounded-2xl p-3 ring-1 ring-white/5", palette.bg)}>
          <Icon className={palette.icon} size={26} />
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}%
        </div>
      </div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      {subtitle && <p className="mt-2 text-xs font-medium text-slate-500">{subtitle}</p>}
      {to && <p className="mt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-white">Open section <ChevronRight size={14} /></p>}
    </motion.div>
  );

  return to ? <Link to={to} className="block h-full">{card}</Link> : card;
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function Dashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [d, a, l, s] = await Promise.all([
          api.deals.list(),
          api.activities.list(),
          api.leads.list(),
          api.showings.list()
        ]);
        setDeals(d);
        setActivities(a);
        setLeads(l);
        setShowings(s);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    loadData();
  }, []);

  const activeLeads = leads.filter(lead => lead.stageId !== 'ls5').length;
  const totalLeads = leads.length;
  const upcomingShowings = showings.filter(showing => showing.status === 'scheduled' && new Date(showing.scheduledAt).getTime() >= Date.now()).length;

  const activityData = [
    { name: 'Jan', leads: 8, showings: 3 },
    { name: 'Feb', leads: 12, showings: 5 },
    { name: 'Mar', leads: 9, showings: 7 },
    { name: 'Apr', leads: 16, showings: 9 },
    { name: 'May', leads: 14, showings: 11 },
    { name: 'Jun', leads: Math.max(totalLeads, 10), showings: Math.max(upcomingShowings, 4) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back, Kunaal. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">
            + New Deal
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Deals"
          value={deals.length || "24"}
          icon={Briefcase}
          to="/deals"
          trend="up"
          trendValue="12"
          color="blue"
        />
        <StatCard
          title="Active Leads"
          value={totalLeads ? activeLeads : "142"}
          subtitle={`Total leads: ${totalLeads || "156"}`}
          icon={Users}
          to="/leads"
          trend="up"
          trendValue="8"
          color="indigo"
        />
        <StatCard
          title="Upcoming Showings"
          value={showings.length ? upcomingShowings : "12"}
          icon={CalendarCheck}
          to="/showings"
          trend="up"
          trendValue="6"
          color="emerald"
        />
        <StatCard
          title="Conversion"
          value="24.5%"
          icon={TrendingUp}
          trend="up"
          trendValue="15"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Lead & Showing Activity</h3>
              <p className="mt-1 text-sm text-slate-500">Track new lead flow against scheduled showings.</p>
            </div>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorShowings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="showings" name="Showings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorShowings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm flex flex-col"
        >
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            {(activities.length > 0 ? activities : [
              { type: 'call', description: 'Call with John Smith regarding property A', createdAt: '2 hours ago' },
              { type: 'email', description: 'Sent contract to Sarah Johnson', createdAt: '4 hours ago' },
              { type: 'meeting', description: 'Showing scheduled for 123 Maple St', createdAt: 'Yesterday' },
              { type: 'note', description: 'Client interested in zero-lot line properties', createdAt: '2 days ago' },
            ]).map((activity, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ActivityIcon size={18} />
                  </div>
                  {i !== 3 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-800"></div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200 font-medium group-hover:text-blue-400 transition-all">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{activity.createdAt.toString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
            View All Activity <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
