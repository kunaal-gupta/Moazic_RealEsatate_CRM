import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Home, 
  Bed, 
  Bath, 
  Maximize, 
  DollarSign,
  MapPin,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Property } from '../types';

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    api.properties.list().then(setProperties);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Properties</h1>
          <p className="text-slate-400 mt-1">Manage your listing inventory.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus size={18} /> Add Property
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by address, community..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property.id}/800/600`} 
                alt={property.address}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {property.isOurInventory ? 'Our Inventory' : 'External'}
                </span>
              </div>
              <div className="absolute bottom-4 right-4">
                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span className="text-sm font-bold text-white">${property.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-all">{property.address}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                    <MapPin size={12} />
                    {property.community}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800">
                <div className="flex flex-col items-center gap-1">
                  <Bed size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-200">{property.beds} Beds</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-slate-800">
                  <Bath size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-200">{property.baths} Baths</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Maximize size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-200">{property.size} sqft</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all">
                  View Details
                </button>
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
