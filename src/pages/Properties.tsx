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
  Tag,
  X,
  Calendar,
  Building2,
  Layers,
  Warehouse,
  Car,
  DoorOpen,
  CheckCircle2,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Property } from '../types';

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    address: '',
    community: '',
    price: 0,
    beds: 0,
    baths: 0,
    size: 0,
    builder: '',
    yearBuilt: new Date().getFullYear(),
    isOurInventory: true
  });

  useEffect(() => {
    api.properties.list().then(setProperties);
  }, []);

  const filteredProperties = properties.filter(property => 
    property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.community?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.builder?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedProperty = await api.properties.create({
        ...newProperty,
        addedDate: new Date().toISOString()
      });
      setProperties([savedProperty, ...properties]);
      setIsAddModalOpen(false);
      setNewProperty({
        address: '',
        community: '',
        price: 0,
        beds: 0,
        baths: 0,
        size: 0,
        builder: '',
        yearBuilt: new Date().getFullYear(),
        isOurInventory: true
      });
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Properties</h1>
          <p className="text-slate-400 mt-1">Manage your listing inventory.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Property
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by address, community, builder..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedProperty(property)}
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
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProperty(property);
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  View Details
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-slate-900/50 border border-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white">No properties found</h3>
          <p className="text-slate-400">Try adjusting your search terms.</p>
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="relative h-64 md:h-80 shrink-0">
              <img 
                src={`https://picsum.photos/seed/${selectedProperty.id}/1200/800`} 
                alt={selectedProperty.address}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                  {selectedProperty.isOurInventory ? 'Our Inventory' : 'External'}
                </span>
                <h2 className="text-3xl font-bold text-white tracking-tight">{selectedProperty.address}</h2>
                <div className="flex items-center gap-2 text-slate-300 mt-1">
                  <MapPin size={16} />
                  {selectedProperty.community}
                </div>
              </div>
              <div className="absolute bottom-6 right-8">
                <div className="bg-emerald-500/20 border border-emerald-500/50 px-4 py-2 rounded-xl backdrop-blur-md">
                  <span className="text-2xl font-bold text-emerald-400">${selectedProperty.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  {/* Key Features */}
                  <div className="grid grid-cols-3 gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
                    <div className="flex flex-col items-center gap-2">
                      <Bed size={20} className="text-blue-400" />
                      <span className="text-lg font-bold text-white">{selectedProperty.beds}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Bedrooms</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 border-x border-slate-700">
                      <Bath size={20} className="text-blue-400" />
                      <span className="text-lg font-bold text-white">{selectedProperty.baths}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Bathrooms</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Maximize size={20} className="text-blue-400" />
                      <span className="text-lg font-bold text-white">{selectedProperty.size}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Sq Ft</span>
                    </div>
                  </div>

                  {/* Property Details Grid */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Home size={18} className="text-blue-400" />
                      Property Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <DetailItem label="Builder" value={selectedProperty.builder} icon={<Building2 size={14} />} />
                      <DetailItem label="Year Built" value={selectedProperty.yearBuilt} icon={<Calendar size={14} />} />
                      <DetailItem label="Property Class" value={selectedProperty.propertyClass} icon={<Tag size={14} />} />
                      <DetailItem label="Building Type" value={selectedProperty.buildingType} icon={<Layers size={14} />} />
                      <DetailItem label="Style" value={selectedProperty.style} icon={<Home size={14} />} />
                      <DetailItem label="Model" value={selectedProperty.model} icon={<Tag size={14} />} />
                      <DetailItem label="Block/Lot" value={selectedProperty.blockLot} icon={<Tag size={14} />} />
                      <DetailItem label="Legal Plan" value={selectedProperty.legalPlan} icon={<Tag size={14} />} />
                      <DetailItem label="Occupancy" value={selectedProperty.occupancy} icon={<DoorOpen size={14} />} />
                      <DetailItem label="Condo Fees" value={selectedProperty.condoFees ? `$${selectedProperty.condoFees}` : 'N/A'} icon={<DollarSign size={14} />} />
                    </div>
                  </div>

                  {/* Interior & Exterior */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Warehouse size={18} className="text-blue-400" />
                      Interior & Exterior Features
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <DetailItem label="Flooring" value={selectedProperty.flooring} icon={<Layers size={14} />} />
                      <DetailItem label="Garage Type" value={selectedProperty.garageType} icon={<Car size={14} />} />
                      <DetailItem label="Floors" value={selectedProperty.floors} icon={<Layers size={14} />} />
                      <DetailItem label="Basement" value={selectedProperty.basement} icon={<Warehouse size={14} />} />
                      <DetailItem label="Basement Dev" value={selectedProperty.basementDev} icon={<Warehouse size={14} />} />
                      <DetailItem label="Appliances" value={selectedProperty.appliancesIncluded ? 'Included' : 'Not Included'} icon={<CheckCircle2 size={14} />} />
                      <DetailItem label="Separate Entrance" value={selectedProperty.separateEntrance ? 'Yes' : 'No'} icon={<DoorOpen size={14} />} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Listing Info</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Added Date</span>
                        <span className="text-white text-sm font-medium">
                          {new Date(selectedProperty.addedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">DOM</span>
                        <span className="text-white text-sm font-medium">{selectedProperty.dom || 0} Days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">C-DOM</span>
                        <span className="text-white text-sm font-medium">{selectedProperty.cDom || 0} Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-2xl">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">Interested?</h4>
                    <p className="text-slate-400 text-xs mb-4">Create a deal or schedule a showing for this property.</p>
                    <div className="space-y-2">
                      <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all">
                        Create Deal
                      </button>
                      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all">
                        Schedule Showing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
              <h2 className="text-xl font-bold text-white tracking-tight">Add New Property</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</label>
                  <input 
                    type="text" 
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="123 Luxury Ave"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Community</label>
                  <input 
                    type="text" 
                    value={newProperty.community}
                    onChange={(e) => setNewProperty({ ...newProperty, community: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Beverly Hills"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price ($)</label>
                  <input 
                    type="number" 
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({ ...newProperty, price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Builder</label>
                  <input 
                    type="text" 
                    value={newProperty.builder}
                    onChange={(e) => setNewProperty({ ...newProperty, builder: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Elite Homes"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Beds</label>
                  <input 
                    type="number" 
                    value={newProperty.beds}
                    onChange={(e) => setNewProperty({ ...newProperty, beds: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Baths</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={newProperty.baths}
                    onChange={(e) => setNewProperty({ ...newProperty, baths: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Size (sqft)</label>
                  <input 
                    type="number" 
                    value={newProperty.size}
                    onChange={(e) => setNewProperty({ ...newProperty, size: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Year Built</label>
                  <input 
                    type="number" 
                    value={newProperty.yearBuilt}
                    onChange={(e) => setNewProperty({ ...newProperty, yearBuilt: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isOurInventory"
                  checked={newProperty.isOurInventory}
                  onChange={(e) => setNewProperty({ ...newProperty, isOurInventory: e.target.checked })}
                  className="w-4 h-4 bg-slate-800 border border-slate-700 rounded focus:ring-blue-500"
                />
                <label htmlFor="isOurInventory" className="text-sm text-slate-300">Our Inventory</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  Save Property
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-500">{icon}</div>
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</div>
        <div className="text-sm text-slate-200 font-medium">{value || 'N/A'}</div>
      </div>
    </div>
  );
}
