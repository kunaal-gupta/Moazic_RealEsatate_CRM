import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  label?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selectedIds, 
  onChange, 
  placeholder = "Select options...",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    onChange(newSelected);
  };

  const removeOption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter(i => i !== id));
  };

  const selectedOptions = options.filter(o => selectedIds.includes(o.id));

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-400">{label}</label>}
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "min-h-[42px] w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer hover:border-slate-600 transition-all focus-within:ring-2 focus-within:ring-blue-500/20",
            isOpen && "border-blue-500/50 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/5"
          )}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span 
                key={option.id} 
                className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-blue-500/20 group"
              >
                {option.name}
                <button 
                  onClick={(e) => removeOption(option.id, e)}
                  className="p-0.5 hover:bg-blue-500/20 rounded transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-sm">{placeholder}</span>
          )}
          <ChevronDown 
            size={16} 
            className={cn("ml-auto text-slate-500 transition-transform", isOpen && "rotate-180")} 
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 backdrop-blur-xl bg-opacity-95 animate-in fade-in zoom-in duration-200">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.length > 0 ? (
                options.map(option => {
                  const isSelected = selectedIds.includes(option.id);
                  return (
                    <div 
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-all",
                        isSelected ? "bg-blue-500/10 text-blue-400 font-bold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      )}
                    >
                      {option.name}
                      {isSelected && <Check size={14} className="text-blue-400" />}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-slate-500 italic">No options available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
