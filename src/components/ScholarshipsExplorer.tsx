import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  Bookmark, 
  Award, 
  RotateCcw,
  Globe,
  GraduationCap,
  DollarSign,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  Calendar,
  Sliders,
  CheckCircle,
  Plus,
  ArrowRight,
  History
} from 'lucide-react';
import { Scholarship, UserProfile, DegreeLevel, FundingType } from '../types';
import { 
  ScholarshipCardProjection, 
  QueryFilters,
  loadRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches
} from '../utils/db';
import { ScholarshipCard } from './ScholarshipCard';
import { getMatchBadgeColor } from '../utils/matchingEngine';

interface ScholarshipsExplorerProps {
  userProfile: UserProfile;
  projectedScholarships: ScholarshipCardProjection[];
  filters: QueryFilters;
  onFilterChange: (newFilters: Partial<QueryFilters>) => void;
  onResetFilters: () => void;
  onToggleSave: (scholarshipId: string) => void;
  onTrack: (scholarship: Scholarship) => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onOpenAiSummary: (scholarship: Scholarship) => void;
  onOpenProfile: () => void;
}

export const ScholarshipsExplorer: React.FC<ScholarshipsExplorerProps> = ({
  userProfile,
  projectedScholarships,
  filters,
  onFilterChange,
  onResetFilters,
  onToggleSave,
  onTrack,
  onOpenDetails,
  onOpenAiSummary,
  onOpenProfile,
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());

  // Automatically save search query to recent searches after typing pauses
  useEffect(() => {
    const query = filters.query?.trim();
    if (!query || query.length < 2) return;

    const timer = setTimeout(() => {
      const updated = saveRecentSearch(query);
      setRecentSearches(updated);
    }, 700);

    return () => clearTimeout(timer);
  }, [filters.query]);

  // Handler: Select a recent search chip to re-run
  const handleSelectRecentSearch = useCallback((searchTerm: string) => {
    onFilterChange({ query: searchTerm });
    const updated = saveRecentSearch(searchTerm);
    setRecentSearches(updated);
  }, [onFilterChange]);

  // Handler: Remove an individual search query
  const handleRemoveRecentSearch = useCallback((e: React.MouseEvent, searchTerm: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(searchTerm);
    setRecentSearches(updated);
  }, []);

  // Handler: Clear all recent searches
  const handleClearAllRecent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Extract unique countries for filter dropdown
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    projectedScholarships.forEach(p => {
      if (p.scholarship.hostCountry) set.add(p.scholarship.hostCountry);
    });
    return Array.from(set).sort();
  }, [projectedScholarships]);

  const hasActiveFilters = 
    (filters.query && filters.query.length > 0) ||
    (filters.degreeLevel && filters.degreeLevel !== 'all') ||
    (filters.hostCountry && filters.hostCountry !== 'all') ||
    (filters.fundingType && filters.fundingType !== 'all') ||
    filters.onlySaved ||
    filters.onlyTracked ||
    (filters.minMatchScore && filters.minMatchScore > 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. Global Scholarship Discovery Hero & Profile Match Bar */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl p-4 sm:p-6 border border-stone-200/90 dark:border-[#24242E] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-[#E5C38F] border border-amber-500/30 dark:border-[#C5A267]/40">
              Verified Opportunity Portal
            </span>
            <span className="text-xs text-stone-500 dark:text-[#8E8E93] hidden sm:inline">
              Direct Application Links • Verified Criteria
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            Explore Global Scholarships
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-[#A1A1AA] mt-1">
            Matching awards to your profile: <strong className="text-stone-900 dark:text-[#F4F4F5]">{userProfile.targetDegree}</strong> in <strong className="text-stone-900 dark:text-[#F4F4F5]">{userProfile.fieldOfStudy}</strong> with GPA <strong className="text-stone-900 dark:text-[#F4F4F5]">{userProfile.gpa.toFixed(1)}/4.0</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-[#181822] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#22222C] border border-stone-200 dark:border-[#282834] transition min-h-[44px]"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500 dark:text-[#C5A267]" />
            <span>Customize Match Criteria</span>
          </button>
        </div>
      </div>

      {/* 2. Search, View Toggle, and Filters Tool Bar */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl p-3.5 sm:p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-[#71717A]" />
            <input
              id="scholarships-search-input"
              type="text"
              value={filters.query || ''}
              onChange={e => onFilterChange({ query: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter' && filters.query && filters.query.trim().length > 0) {
                  const updated = saveRecentSearch(filters.query);
                  setRecentSearches(updated);
                }
              }}
              placeholder="Search scholarships, countries, stipends (e.g. 'Chevening', 'Germany', 'stipend')..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-[#262634] bg-stone-50/70 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
            />
            {filters.query && (
              <button
                onClick={() => onFilterChange({ query: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Toggle + Filter Drawer Button + Sort */}
          <div className="flex items-center justify-between sm:justify-start space-x-2 shrink-0">
            {/* View Mode (Grid vs Table) */}
            <div className="flex items-center bg-stone-100 dark:bg-[#181820] p-0.5 rounded-xl border border-stone-200 dark:border-[#282834]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 sm:p-2.5 rounded-lg transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#22222E] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-[#D1D1D6]'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 sm:p-2.5 rounded-lg transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#22222E] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-[#D1D1D6]'
                }`}
                title="Dense Comparison Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition min-h-[42px] ${
                showFilterDrawer || hasActiveFilters
                  ? 'bg-stone-900 text-stone-50 dark:bg-[#C5A267] dark:text-[#0A0A0B] border-transparent'
                  : 'bg-stone-100 dark:bg-[#181820] text-stone-700 dark:text-[#D1D1D6] border-stone-200 dark:border-[#282834]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-[#0A0A0B]" />
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy || 'match'}
              onChange={e => onFilterChange({ sortBy: e.target.value as any })}
              className="px-2.5 sm:px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-[#282834] bg-stone-100 dark:bg-[#181820] text-stone-700 dark:text-[#D1D1D6] focus:outline-hidden font-medium min-h-[42px]"
            >
              <option value="match">Sort: Match</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="title">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Recent Searches (Saves last 3 query strings to local storage) */}
        {recentSearches.length > 0 && (
          <div id="recent-searches-container" className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
            <div className="flex items-center space-x-1 text-stone-500 dark:text-[#8E8E93] mr-1 select-none">
              <History className="w-3.5 h-3.5 text-amber-600 dark:text-[#C5A267]" />
              <span className="text-[11px] font-semibold">Recent:</span>
            </div>

            {recentSearches.map((searchTerm, idx) => {
              const isActive = filters.query?.trim().toLowerCase() === searchTerm.toLowerCase();
              return (
                <button
                  key={`recent-search-${idx}-${searchTerm}`}
                  id={`recent-search-chip-${idx}`}
                  onClick={() => handleSelectRecentSearch(searchTerm)}
                  title={`Re-run search for "${searchTerm}"`}
                  className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs transition border min-h-[30px] ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-900 dark:text-[#E5C38F] border-amber-500/30 dark:border-[#C5A267]/40 font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-[#181822] text-stone-700 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#22222E] border-stone-200/90 dark:border-[#282834]'
                  }`}
                >
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">"{searchTerm}"</span>
                  <span
                    onClick={(e) => handleRemoveRecentSearch(e, searchTerm)}
                    title="Remove recent search"
                    className="p-0.5 rounded-md hover:bg-stone-300 dark:hover:bg-[#2C2C3A] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </button>
              );
            })}

            <button
              id="recent-searches-clear-btn"
              onClick={handleClearAllRecent}
              title="Clear recent searches"
              className="text-[11px] text-stone-400 hover:text-stone-700 dark:text-[#71717A] dark:hover:text-[#A1A1AA] hover:underline px-1.5 py-0.5 transition ml-0.5"
            >
              Clear
            </button>
          </div>
        )}

        {/* Quick Filter Pills (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => onFilterChange({ fundingType: filters.fundingType === 'Fully Funded' ? 'all' : 'Fully Funded' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap min-h-[34px] ${
              filters.fundingType === 'Fully Funded'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#22222C]'
            }`}
          >
            Fully Funded
          </button>

          <button
            onClick={() => onFilterChange({ degreeLevel: filters.degreeLevel === 'Master / Postgraduate' ? 'all' : 'Master / Postgraduate' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap min-h-[34px] ${
              filters.degreeLevel === 'Master / Postgraduate'
                ? 'bg-stone-900 text-white dark:bg-[#C5A267] dark:text-[#0A0A0B]'
                : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#22222C]'
            }`}
          >
            Master's
          </button>

          <button
            onClick={() => onFilterChange({ degreeLevel: filters.degreeLevel === 'PhD / Doctorate' ? 'all' : 'PhD / Doctorate' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap min-h-[34px] ${
              filters.degreeLevel === 'PhD / Doctorate'
                ? 'bg-stone-900 text-white dark:bg-[#C5A267] dark:text-[#0A0A0B]'
                : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#22222C]'
            }`}
          >
            PhD
          </button>

          <button
            onClick={() => onFilterChange({ onlySaved: !filters.onlySaved })}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap flex items-center space-x-1 min-h-[34px] ${
              filters.onlySaved
                ? 'bg-purple-600 text-white'
                : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#22222C]'
            }`}
          >
            <Bookmark className="w-3 h-3 mr-1" />
            <span>Saved</span>
          </button>

          <button
            onClick={() => onFilterChange({ minMatchScore: filters.minMatchScore === 80 ? 0 : 80 })}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap min-h-[34px] ${
              filters.minMatchScore === 80
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#22222C]'
            }`}
          >
            Top Match (80%+)
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="ml-auto text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-[#8E8E93] dark:hover:text-[#F4F4F5] flex items-center space-x-1 whitespace-nowrap px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Expanded Filters Drawer */}
        {showFilterDrawer && (
          <div className="pt-3 border-t border-stone-200 dark:border-[#22222A] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 dark:text-[#8E8E93] mb-1">
                Target Degree
              </label>
              <select
                value={filters.degreeLevel || 'all'}
                onChange={e => onFilterChange({ degreeLevel: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-[#262634] bg-stone-50 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] min-h-[44px]"
              >
                <option value="all">All Degrees</option>
                <option value="Master / Postgraduate">Master / Postgraduate</option>
                <option value="PhD / Doctorate">PhD / Doctorate</option>
                <option value="Bachelor / Undergraduate">Bachelor / Undergraduate</option>
                <option value="Postdoc / Fellowship">Postdoc / Fellowship</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 dark:text-[#8E8E93] mb-1">
                Host Destination
              </label>
              <select
                value={filters.hostCountry || 'all'}
                onChange={e => onFilterChange({ hostCountry: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-[#262634] bg-stone-50 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] min-h-[44px]"
              >
                <option value="all">All Countries</option>
                {availableCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 dark:text-[#8E8E93] mb-1">
                Funding Coverage
              </label>
              <select
                value={filters.fundingType || 'all'}
                onChange={e => onFilterChange({ fundingType: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-[#262634] bg-stone-50 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] min-h-[44px]"
              >
                <option value="all">All Funding Types</option>
                <option value="Fully Funded">Fully Funded</option>
                <option value="Partial Tuition">Partial Tuition</option>
                <option value="Tuition Only">Tuition Only</option>
                <option value="Research Grant">Research Grant</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Results Status Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-[#8E8E93] px-1">
        <span>
          Found <strong className="text-stone-900 dark:text-[#F4F4F5]">{projectedScholarships.length}</strong> opportunities
        </span>
        <span className="text-[11px] hidden sm:inline">
          Click any opportunity for direct portals, contacts & requirements
        </span>
      </div>

      {/* 4. Display: No Results vs Grid View vs Table View */}
      {projectedScholarships.length === 0 ? (
        <div className="bg-white dark:bg-[#121217] rounded-2xl p-8 sm:p-12 text-center border border-stone-200 dark:border-[#24242E] shadow-xs">
          <Award className="w-10 h-10 mx-auto text-stone-300 dark:text-[#444455] mb-3" />
          <h3 className="text-base font-bold text-stone-900 dark:text-[#F4F4F5] mb-1">
            No matching scholarships found
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8E8E93] max-w-md mx-auto mb-4">
            Try adjusting your search terms or clearing active filters to see all available international opportunities.
          </p>
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] min-h-[44px]"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {projectedScholarships.map(proj => (
            <ScholarshipCard
              key={proj.scholarship.id}
              scholarship={proj.scholarship}
              matchScore={proj.matchScore}
              completedChecklistCount={proj.completedChecklistCount}
              totalChecklistCount={proj.totalChecklistCount}
              progressPercent={proj.progressPercent}
              isSaved={proj.isSaved}
              isTracked={proj.isTracked}
              onToggleSave={onToggleSave}
              onTrack={onTrack}
              onOpenDetails={onOpenDetails}
              onOpenAiSummary={onOpenAiSummary}
            />
          ))}
        </div>
      ) : (
        /* Dense Comparison Table View */
        <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#16161E] border-b border-stone-200 dark:border-[#22222A] text-stone-500 dark:text-[#8E8E93] font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Match</th>
                  <th className="py-3.5 px-4">Scholarship & Provider</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Coverage</th>
                  <th className="py-3.5 px-4">Min GPA</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-[#1E1E26]">
                {projectedScholarships.map(proj => {
                  const s = proj.scholarship;
                  const badge = getMatchBadgeColor(proj.matchScore);
                  return (
                    <tr 
                      key={s.id}
                      onClick={() => onOpenDetails(s)}
                      className="hover:bg-stone-50/70 dark:hover:bg-[#161620] cursor-pointer transition"
                    >
                      <td className="py-3 px-4 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {proj.matchScore}%
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-stone-900 dark:text-[#F4F4F5] truncate">
                          {s.title}
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-[#D1D1D6] font-medium truncate">
                          {s.provider}
                        </div>
                        {s.university && (
                          <div className="text-[10px] text-stone-400 dark:text-[#8E8E93] truncate">
                            {s.university}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-stone-700 dark:text-[#D1D1D6]">
                        {s.hostCountry}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          {s.fundingType}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-stone-700 dark:text-[#D1D1D6]">
                        {s.eligibilityCriteria.minGpa ? s.eligibilityCriteria.minGpa.toFixed(1) : 'None'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-stone-600 dark:text-[#8E8E93]">
                        {s.deadline || 'Varies'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenDetails(s)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#1E1E28] dark:hover:bg-[#282834] text-stone-800 dark:text-[#D1D1D6] transition min-h-[36px]"
                          >
                            Details
                          </button>

                          {s.officialApplicationUrl && (
                            <a
                              href={s.officialApplicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-[#F4F4F5] min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Official Application Portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => onToggleSave(s.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Save"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${proj.isSaved ? 'fill-current text-amber-500' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
