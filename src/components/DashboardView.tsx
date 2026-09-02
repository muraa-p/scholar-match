import React from 'react';
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  Bookmark, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ExternalLink, 
  ListChecks, 
  TrendingUp,
  Globe,
  Sliders,
  CheckSquare,
  Circle,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Scholarship, TrackedApplication, UserProfile, ChecklistItem } from '../types';
import { ScholarshipCardProjection } from '../utils/db';
import { ScholarshipCard } from './ScholarshipCard';

interface DashboardViewProps {
  userProfile: UserProfile;
  projectedScholarships: ScholarshipCardProjection[];
  trackedApplications: TrackedApplication[];
  savedScholarshipIds: string[];
  onNavigateToTab: (tab: 'dashboard' | 'scholarships' | 'applications') => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onOpenAiSummary: (scholarship: Scholarship) => void;
  onToggleSave: (scholarshipId: string) => void;
  onTrack: (scholarship: Scholarship) => void;
  onOpenProfile: () => void;
  onToggleChecklistItem: (scholarshipId: string, itemId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  projectedScholarships,
  trackedApplications,
  savedScholarshipIds,
  onNavigateToTab,
  onOpenDetails,
  onOpenAiSummary,
  onToggleSave,
  onTrack,
  onOpenProfile,
  onToggleChecklistItem,
}) => {
  // 1. Calculate Summary Metrics
  const totalMatched = projectedScholarships.length;
  const topMatchScore = projectedScholarships.length > 0 ? projectedScholarships[0].matchScore : 0;
  
  // Calculate global application progress
  let totalTasks = 0;
  let completedTasks = 0;
  trackedApplications.forEach(app => {
    totalTasks += app.checklist?.length || 0;
    completedTasks += (app.checklist || []).filter(c => c.completed).length;
  });
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming deadlines (from tracked + saved + top matched)
  const deadlineItems = projectedScholarships
    .filter(p => p.scholarship.deadline)
    .sort((a, b) => (a.scholarship.deadline || '').localeCompare(b.scholarship.deadline || ''))
    .slice(0, 4);

  // Top Matched Scholarships for spotlight
  const topMatched = projectedScholarships.slice(0, 4);

  // Saved Opportunities list
  const savedList = projectedScholarships.filter(p => p.isSaved);

  const getDeadlineBadge = (deadlineStr?: string) => {
    if (!deadlineStr) return { label: 'Ongoing', color: 'bg-stone-100 text-stone-700 dark:bg-[#1E1E24] dark:text-[#A1A1AA]' };
    return { label: deadlineStr, color: 'bg-amber-500/15 text-amber-700 dark:text-[#E5C38F] border border-amber-500/30' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Profile Match Banner */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl p-4 sm:p-6 border border-stone-200/90 dark:border-[#24242E] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-[#E5C38F] border border-amber-500/30 dark:border-[#C5A267]/40">
              Personalized Matching Active
            </span>
            <span className="text-xs text-stone-500 dark:text-[#8E8E93]">
              Real-Time Global Evaluation
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            Welcome back, {userProfile.name || 'Scholar'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-[#A1A1AA] mt-1 max-w-2xl">
            Currently targeting <strong className="text-stone-900 dark:text-[#F4F4F5]">{userProfile.targetDegree}</strong> in <strong className="text-stone-900 dark:text-[#F4F4F5]">{userProfile.fieldOfStudy}</strong> with a <strong className="text-stone-900 dark:text-[#F4F4F5]">{userProfile.gpa.toFixed(1)}/4.0 GPA</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-[#181822] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#22222C] border border-stone-200 dark:border-[#282834] transition min-h-[44px]"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500 dark:text-[#C5A267]" />
            <span>Edit Profile & Criteria</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Matched Scholarships */}
        <div 
          onClick={() => onNavigateToTab('scholarships')}
          className="bg-white dark:bg-[#121217] rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs hover:border-stone-300 dark:hover:border-[#C5A267]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 dark:text-[#8E8E93]">Matched Awards</span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#1A1A22] text-amber-500 dark:text-[#C5A267] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            {totalMatched}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] mt-1 flex items-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">{topMatchScore}%</span> Top Match
          </p>
        </div>

        {/* Metric 2: Upcoming Deadlines */}
        <div 
          className="bg-white dark:bg-[#121217] rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 dark:text-[#8E8E93]">Active Deadlines</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-[#C5A267]/20 text-amber-600 dark:text-[#E5C38F] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            {deadlineItems.length}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] mt-1 truncate">
            {deadlineItems[0] ? `Next: ${deadlineItems[0].scholarship.title.split(' ')[0]}` : 'No deadlines set'}
          </p>
        </div>

        {/* Metric 3: Application Progress */}
        <div 
          onClick={() => onNavigateToTab('applications')}
          className="bg-white dark:bg-[#121217] rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs hover:border-stone-300 dark:hover:border-[#C5A267]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 dark:text-[#8E8E93]">Checklist Progress</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            {overallProgress}%
          </div>
          <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] mt-1">
            {completedTasks} of {totalTasks} checklist items done
          </p>
        </div>

        {/* Metric 4: Saved Opportunities */}
        <div 
          onClick={() => onNavigateToTab('scholarships')}
          className="bg-white dark:bg-[#121217] rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs hover:border-stone-300 dark:hover:border-[#C5A267]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 dark:text-[#8E8E93]">Saved Opportunities</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            {savedScholarshipIds.length}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] mt-1">
            Pinned for rapid tracking
          </p>
        </div>
      </div>

      {/* 3. Two-Column Dashboard Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on Desktop): Active Application Checklists & Top Matched Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Application Dynamic Checklists */}
          <div className="bg-white dark:bg-[#121217] rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-[#24242E] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ListChecks className="w-4 h-4 text-stone-500 dark:text-[#C5A267]" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                  Active Application Checklists
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('applications')}
                className="text-xs font-semibold text-stone-600 dark:text-[#C5A267] hover:underline flex items-center"
              >
                <span>View Full Tracker</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>

            {trackedApplications.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-stone-50 dark:bg-[#181820] border border-dashed border-stone-200 dark:border-[#262632]">
                <p className="text-xs text-stone-500 dark:text-[#8E8E93] mb-2">
                  You haven't added any scholarships to your application tracker yet.
                </p>
                <button
                  onClick={() => onNavigateToTab('scholarships')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B]"
                >
                  Browse Matched Scholarships
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {trackedApplications.map(app => {
                  const proj = projectedScholarships.find(p => p.scholarship.id === app.scholarshipId);
                  const scholarship = proj?.scholarship;
                  const checklist = app.checklist || [];
                  const doneCount = checklist.filter(c => c.completed).length;
                  const total = checklist.length;
                  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

                  return (
                    <div 
                      key={app.id}
                      className="p-4 rounded-xl bg-stone-50/70 dark:bg-[#181820] border border-stone-200/80 dark:border-[#262632] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span 
                              onClick={() => scholarship && onOpenDetails(scholarship)}
                              className="text-xs font-bold font-heading text-stone-900 dark:text-[#F4F4F5] line-clamp-1 cursor-pointer hover:underline"
                            >
                              {scholarship?.title || app.customTitle || 'Scholarship Application'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 dark:bg-[#242430] text-stone-700 dark:text-[#D1D1D6] capitalize">
                              {app.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] flex items-center mt-0.5">
                            <Calendar className="w-3 h-3 mr-1 text-stone-400" /> Deadline: {app.deadline || 'Ongoing'}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-stone-800 dark:text-[#F4F4F5]">
                            {doneCount}/{total} Done ({pct}%)
                          </span>
                          {scholarship && (
                            <button
                              onClick={() => onOpenDetails(scholarship)}
                              className="block text-[11px] text-stone-500 dark:text-[#C5A267] hover:underline mt-0.5"
                            >
                              View Dossier
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="w-full bg-stone-200 dark:bg-[#282836] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct === 100 ? 'bg-emerald-500' : 'bg-amber-500 dark:bg-[#C5A267]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Top 3 Interactive Checklist Items right in Dashboard */}
                      <div className="space-y-1.5 pt-1">
                        {checklist.slice(0, 3).map(item => (
                          <div 
                            key={item.id}
                            onClick={() => onToggleChecklistItem(app.scholarshipId, item.id)}
                            className="flex items-center space-x-2.5 text-xs p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#121217] cursor-pointer transition"
                          >
                            <button className="shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                              {item.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-stone-400 dark:text-[#52525B]" />
                              )}
                            </button>
                            <span className={`line-clamp-1 ${
                              item.completed ? 'line-through text-stone-400 dark:text-[#666672]' : 'text-stone-800 dark:text-[#E4E4E7]'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Matched Opportunities Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#C5A267]" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                  Top Matched Opportunities
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('scholarships')}
                className="text-xs font-semibold text-stone-600 dark:text-[#C5A267] hover:underline flex items-center"
              >
                <span>View All ({totalMatched})</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMatched.map(proj => (
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
          </div>
        </div>

        {/* Right Column (1 Col wide on Desktop): Upcoming Deadlines & Saved Quick Access */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white dark:bg-[#121217] rounded-2xl p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-stone-500 dark:text-[#C5A267]" />
                <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                  Upcoming Deadlines
                </h2>
              </div>
            </div>

            <div className="space-y-2.5">
              {deadlineItems.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No upcoming deadlines.</p>
              ) : (
                deadlineItems.map(proj => {
                  const badge = getDeadlineBadge(proj.scholarship.deadline);
                  return (
                    <div
                      key={proj.scholarship.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200/70 dark:border-[#262632] flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 
                          onClick={() => onOpenDetails(proj.scholarship)}
                          className="text-xs font-bold text-stone-800 dark:text-[#F4F4F5] hover:underline cursor-pointer truncate"
                        >
                          {proj.scholarship.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] flex items-center mt-0.5">
                          <Globe className="w-3 h-3 mr-1 text-stone-400" /> {proj.scholarship.hostCountry}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                        <button
                          onClick={() => onOpenDetails(proj.scholarship)}
                          className="text-[10px] text-stone-500 dark:text-[#C5A267] hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Saved Opportunities Quick Widget */}
          <div className="bg-white dark:bg-[#121217] rounded-2xl p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-stone-500 dark:text-[#C5A267]" />
                <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                  Saved Opportunities ({savedList.length})
                </h2>
              </div>
            </div>

            {savedList.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400 dark:text-[#71717A]">
                Click the bookmark icon on any scholarship card to save it here for fast access.
              </div>
            ) : (
              <div className="space-y-2">
                {savedList.slice(0, 4).map(proj => (
                  <div
                    key={proj.scholarship.id}
                    className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200/70 dark:border-[#262632] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p 
                        onClick={() => onOpenDetails(proj.scholarship)}
                        className="text-xs font-semibold text-stone-800 dark:text-[#E4E4E7] truncate hover:underline cursor-pointer"
                      >
                        {proj.scholarship.title}
                      </p>
                      <span className="text-[10px] text-stone-500 dark:text-[#8E8E93]">
                        {proj.scholarship.fundingType} • {proj.matchScore}% Match
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenDetails(proj.scholarship)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-stone-200 dark:bg-[#242430] text-stone-800 dark:text-[#D1D1D6] hover:opacity-80 transition shrink-0"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
