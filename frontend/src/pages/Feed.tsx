import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Star, 
  Clock, 
  MapPin, 
  Briefcase, 
  Loader2, 
  X, 
  Mic, 
  SlidersHorizontal,
  ChevronRight,
  Check,
  AlertCircle,
  Tag
} from 'lucide-react';
import { openingService } from '../services/openingService';
import { Opening, CollaborationType, ProjectStage, CommitmentLevel, LocationPreference } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/Card';

const Feed: React.FC = () => {
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState({
    types: [] as string[],
    stages: [] as string[],
    commitments: [] as string[],
    locations: [] as string[],
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        setLoading(true);
        const data = await openingService.getOpenings();
        setOpenings(data);
      } catch (error) {
        console.error('Failed to fetch openings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpenings();
  }, []);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Constants for filters
  const collabTypes: CollaborationType[] = [
    'Hackathon',
    'Side Project/Indie App',
    'Startup/Co-founder',
    'Open Source',
    'Freelance/Paid Gig',
    'Student/College Project',
    'Other'
  ];

  const stages: ProjectStage[] = ['Idea Only', 'Prototype/MVP Built', 'Scaling/Growth', 'Maintenance/Polish'];
  const commitments: CommitmentLevel[] = ['Casual/Weekends Only', 'Part-time (5-15 hrs/week)', 'Full-time', 'One-off Task'];
  const locations: LocationPreference[] = ['Remote/Online Only', 'Mumbai In-Person', 'Hybrid', 'Anywhere'];

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Toggle filter logic
  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      types: [],
      stages: [],
      commitments: [],
      locations: [],
    });
    setSearchTerm('');
  };

  const removeFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== value)
    }));
  };

  const activeFilterCount = Object.values(filters).flat().length;

  // Filtered Openings
  const filteredOpenings = useMemo(() => {
    return openings.filter(o => {
      const recruiterName = (o as any).recruiter?.name || o.recruiterName || '';
      const lowerSearch = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
                            o.title.toLowerCase().includes(lowerSearch) || 
                            o.description.toLowerCase().includes(lowerSearch) ||
                            o.tags.some(t => t.toLowerCase().includes(lowerSearch)) ||
                            o.roles.some(r => r.name.toLowerCase().includes(lowerSearch)) ||
                            o.location.toLowerCase().includes(lowerSearch) ||
                            recruiterName.toLowerCase().includes(lowerSearch);

      const matchesType = filters.types.length === 0 || filters.types.includes(o.type);
      const matchesStage = filters.stages.length === 0 || filters.stages.includes(o.stage);
      const matchesCommitment = filters.commitments.length === 0 || filters.commitments.includes(o.commitment);
      const matchesLocation = filters.locations.length === 0 || filters.locations.includes(o.location);

      return matchesSearch && matchesType && matchesStage && matchesCommitment && matchesLocation;
    });
  }, [openings, searchTerm, filters]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const results: { type: string; value: string; label: string }[] = [];
    const lowerSearch = searchTerm.toLowerCase();

    // Project Titles
    const matchingProjects = openings
      .filter(o => o.title.toLowerCase().includes(lowerSearch))
      .slice(0, 3)
      .map(o => ({ type: 'Project', value: o.title, label: o.title }));
    results.push(...matchingProjects);

    // Tags/Skills
    const uniqueTags = Array.from(new Set(openings.flatMap(o => o.tags)));
    const matchingTags = uniqueTags
      .filter(t => t.toLowerCase().includes(lowerSearch))
      .slice(0, 3)
      .map(t => ({ type: 'Tag', value: t, label: `#${t}` }));
    results.push(...matchingTags);

    // Roles
    const uniqueRoles = Array.from(new Set(openings.flatMap(o => o.roles.map(r => r.name))));
    const matchingRoles = uniqueRoles
      .filter(r => r.toLowerCase().includes(lowerSearch))
      .slice(0, 2)
      .map(r => ({ type: 'Role', value: r, label: r }));
    results.push(...matchingRoles);

    // Types
    const matchingTypes = collabTypes
      .filter(t => t.toLowerCase().includes(lowerSearch))
      .slice(0, 2)
      .map(t => ({ type: 'Type', value: t, label: t }));
    results.push(...matchingTypes);

    return results.slice(0, 8);
  }, [openings, searchTerm]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-indigo-400 font-bold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 bg-black text-[#e0e0e0]">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Find your next dream team<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-base text-slate-400 max-w-2xl">
          Connect with builders, designers, and creators for any project. From hackathons to startups, your perfect collaborator is waiting.
        </p>
      </div>

      {/* Main Search & Quick Filters Container */}
      <div className="-mx-4 px-4 py-6 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1" ref={searchRef}>
              <div className={`relative flex items-center bg-[#111111] border border-white/10 rounded-2xl transition-all duration-300 focus-within:border-indigo-500/50 focus-within:bg-[#151515] focus-within:shadow-[0_0_20px_rgba(99,102,241,0.1)] group`}>
                <Search className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search projects, skills, roles, tags, people..."
                  className="w-full pl-12 pr-12 py-4 bg-transparent text-white outline-none placeholder:text-slate-500 text-base"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-white/5 bg-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1">Quick Suggestions</p>
                  </div>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 text-left group"
                      onClick={() => {
                        setSearchTerm(suggestion.value);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                        {suggestion.type === 'Tag' && <Tag size={16} />}
                        {suggestion.type === 'Project' && <Briefcase size={16} />}
                        {suggestion.type === 'Role' && <Star size={16} />}
                        {suggestion.type === 'Type' && <Clock size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{highlightMatch(suggestion.label, searchTerm)}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{suggestion.type}</span>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-slate-700 group-hover:text-slate-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Advanced Filters Trigger */}
              <Button
                variant="outline"
                className={`border-white/10 bg-[#111111] hover:bg-[#151515] h-auto py-4 px-6 rounded-2xl transition-all ${activeFilterCount > 0 ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' : 'text-slate-400'}`}
                onClick={() => setShowAdvancedFilters(true)}
              >
                <SlidersHorizontal size={20} className="mr-2.5" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2.5 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 px-8 h-auto rounded-2xl whitespace-nowrap hidden md:flex font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                onClick={() => navigate('/post')}
              >
                <Plus className="mr-2" size={20} />
                Post Opening
              </Button>
            </div>
          </div>

          {/* Filter Chips Scrollable */}
          <div 
            ref={scrollRef}
            onWheel={handleWheel}
            className="flex items-center gap-3 overflow-x-auto pb-4 -mb-4 touch-pan-x no-scrollbar select-none"
          >
            <button
              onClick={clearAllFilters}
              className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                searchTerm === '' && activeFilterCount === 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25'
                : 'bg-[#111111] border-white/10 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              All
            </button>
            {collabTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleFilter('types', type)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  filters.types.includes(type)
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                    : 'bg-[#111111] border-white/10 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilterCount > 0 || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 px-1 animate-in slide-in-from-left-4 duration-300">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Selected:</span>
          {searchTerm && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs text-indigo-400">
              <span className="font-medium">"{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}
          {Object.entries(filters).flatMap(([category, values]) => 
            values.map(v => (
              <div key={`${category}-${v}`} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300 hover:border-white/20 transition-colors">
                <span className="opacity-60 text-[10px] uppercase">{category.replace('s', '')}:</span>
                <span className="font-medium">{v}</span>
                <button onClick={() => removeFilter(category as any, v)} className="hover:text-white text-slate-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))
          )}
          <button 
            onClick={clearAllFilters}
            className="text-xs text-slate-500 hover:text-indigo-400 font-bold ml-2 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Clear all
          </button>
        </div>
      )}

      {/* Results Count & Sort */}
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>{filteredOpenings.length} {filteredOpenings.length === 1 ? 'Opportunity' : 'Opportunities'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Sort by</span>
          <select className="bg-transparent text-slate-300 border-0 focus:ring-0 outline-none cursor-pointer hover:text-white transition-colors">
            <option value="recent">Most Recent</option>
            <option value="strength">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Openings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOpenings.map(opening => (
          <OpeningCard key={opening.id} opening={opening} onClick={() => navigate(`/opening/${opening.id}`)} />
        ))}
      </div>

      {/* No Results State */}
      {filteredOpenings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-8 shadow-2xl">
            <Search size={48} className="text-slate-700" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No matching openings found</h3>
          <p className="text-slate-400 max-w-md mb-10 text-lg">
            We couldn't find any results for your current search or filters. Try adjusting them or start fresh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="border-white/10 text-slate-300 hover:bg-white/5 rounded-2xl px-8"
              onClick={clearAllFilters}
            >
              Reset Search
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-8 font-bold"
              onClick={() => navigate('/post')}
            >
              Post a New Opening
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdvancedFilters(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-500">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/10 rounded-xl">
                  <SlidersHorizontal size={24} className="text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Refine Search</h2>
                  <p className="text-xs text-slate-500">Filter openings by specific criteria</p>
                </div>
              </div>
              <button onClick={() => setShowAdvancedFilters(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              {/* Collaboration Type */}
              <FilterSection 
                title="Collaboration Type" 
                options={collabTypes} 
                selected={filters.types} 
                onChange={(val) => toggleFilter('types', val)} 
              />

              {/* Project Stage */}
              <FilterSection 
                title="Project Stage" 
                options={stages} 
                selected={filters.stages} 
                onChange={(val) => toggleFilter('stages', val)} 
              />

              {/* Commitment Level */}
              <FilterSection 
                title="Commitment Level" 
                options={commitments} 
                selected={filters.commitments} 
                onChange={(val) => toggleFilter('commitments', val)} 
              />

              {/* Location Preference */}
              <FilterSection 
                title="Location Preference" 
                options={locations} 
                selected={filters.locations} 
                onChange={(val) => toggleFilter('locations', val)} 
              />
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <button 
                onClick={clearAllFilters}
                className="text-sm text-slate-500 hover:text-indigo-400 font-bold transition-colors"
              >
                Reset All Filters
              </button>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="border-white/10 text-slate-400 hover:text-white rounded-xl px-6"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 rounded-xl font-bold"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  Show Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => navigate('/post')}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

const FilterSection: React.FC<{
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}> = ({ title, options, selected, onChange }) => (
  <div className="space-y-5">
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(option => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all ${
              isSelected 
                ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <span className="text-sm font-medium">{option}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-white/10 bg-transparent'
            }`}>
              {isSelected && <Check size={12} className="text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const OpeningCard: React.FC<{ opening: Opening, onClick: () => void }> = ({ opening, onClick }) => {
  const isClosed = opening.status === 'Closed / Team Formed';
  const recruiterName = (opening as any).recruiter?.name || opening.recruiterName || 'Unknown';
  const strengthScore = (opening as any).recruiter?.strengthScore || opening.recruiterStrengthScore || 0;
  const recruiterAvatarUrl = (opening as any).recruiter?.avatarUrl || opening.recruiterAvatarUrl;

  return (
    <Card 
      className="group flex flex-col h-full bg-[#0a0a0a] border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden rounded-3xl" 
      onClick={onClick}
    >
      <CardHeader className="flex-none flex flex-col gap-3 p-6 pb-2">
        <div className="flex justify-between items-start">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border ${
            isClosed 
            ? 'bg-slate-900/50 text-slate-500 border-white/5' 
            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            <div className={`w-1 h-1 rounded-full mr-1.5 ${isClosed ? 'bg-slate-700' : 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,1)]'}`} />
            {opening.status}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-500 font-bold border border-white/5">
            <Clock size={12} className="text-indigo-400" />
            <span>{opening.timeline || 'TBD'}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors mt-2">
          {opening.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-6 p-6 pt-0">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-indigo-500" />
            <span>{opening.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-indigo-500" />
            <span>{opening.location}</span>
          </div>
        </div>

        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
          {opening.description}
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Roles Available</p>
            <div className="h-px flex-grow mx-4 bg-white/5" />
            <span className="text-[10px] text-indigo-400 font-black">{opening.roles.filter(r => r.filled < r.slots).length} Open</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {opening.roles.slice(0, 3).map(role => (
              <span key={role.id} className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                role.filled >= role.slots 
                  ? 'border-white/5 bg-transparent text-slate-700' 
                  : 'border-white/10 bg-white/5 text-indigo-300 group-hover:border-indigo-500/30'
              }`}>
                {role.name} <span className="ml-1 opacity-50">{role.slots - role.filled}</span>
              </span>
            ))}
            {opening.roles.length > 3 && (
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/5 bg-transparent text-slate-600">
                +{opening.roles.length - 3}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center p-6 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center space-x-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-base font-black shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform overflow-hidden border border-white/10">
              {recruiterAvatarUrl ? (
                <img src={recruiterAvatarUrl} alt={recruiterName} className="w-full h-full object-cover" />
              ) : (
                recruiterName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{recruiterName}</span>
            <div className="flex items-center text-[10px] text-indigo-500 font-black tracking-widest uppercase mt-0.5">
              <Star size={10} className="mr-1 fill-indigo-500" />
              <span>{strengthScore}/100</span>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <ChevronRight size={18} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default Feed;