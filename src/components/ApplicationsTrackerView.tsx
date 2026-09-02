import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Sparkles, 
  ListChecks, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Clock, 
  ArrowRight,
  Send,
  AlertCircle,
  Eye
} from 'lucide-react';
import { TrackedApplication, Scholarship, ApplicationStatus, ChecklistItem } from '../types';
import { ScholarshipCardProjection } from '../utils/db';

interface ApplicationsTrackerViewProps {
  applications: TrackedApplication[];
  projectedScholarships: ScholarshipCardProjection[];
  onUpdateAppStatus: (appId: string, status: ApplicationStatus) => void;
  onToggleChecklistItem: (scholarshipId: string, itemId: string) => void;
  onAddChecklistItem: (scholarshipId: string, title: string) => void;
  onRemoveApplication: (appId: string) => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onOpenAiSummary: (scholarship: Scholarship) => void;
  onNavigateToExplore: () => void;
}

export const ApplicationsTrackerView: React.FC<ApplicationsTrackerViewProps> = ({
  applications,
  projectedScholarships,
  onUpdateAppStatus,
  onToggleChecklistItem,
  onAddChecklistItem,
  onRemoveApplication,
  onOpenDetails,
  onOpenAiSummary,
  onNavigateToExplore,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(
    applications.length > 0 ? applications[0].id : null
  );
  const [newTaskTitle, setNewTaskTitle] = useState<{ [appId: string]: string }>({});

  const filteredApps = applications.filter(app => {
    if (selectedStatusFilter === 'all') return true;
    return app.status === selectedStatusFilter;
  });

  const handleAddTask = (scholarshipId: string, appId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle[appId];
    if (!title || !title.trim()) return;
    onAddChecklistItem(scholarshipId, title.trim());
    setNewTaskTitle(prev => ({ ...prev, [appId]: '' }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Status Filter Bar */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl p-5 border border-stone-200/90 dark:border-[#24242E] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-[#E5C38F] border border-amber-500/30 dark:border-[#C5A267]/40">
              Personalized Checklist Hub
            </span>
            <span className="text-xs text-stone-500 dark:text-[#8E8E93]">
              {applications.length} Active Pipelines
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
            My Application Milestones
          </h1>
          <p className="text-xs text-stone-600 dark:text-[#A1A1AA] mt-0.5">
            Track official requirements, required transcripts, essays, and direct submission portals for your selected awards.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 dark:bg-[#181820] p-1 rounded-xl border border-stone-200 dark:border-[#282834] self-start sm:self-auto">
          {['all', 'preparing', 'submitted', 'shortlisted', 'accepted'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                selectedStatusFilter === st
                  ? 'bg-white dark:bg-[#22222E] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="bg-white dark:bg-[#121217] rounded-2xl p-12 text-center border border-stone-200 dark:border-[#24242E] shadow-xs space-y-3">
          <ListChecks className="w-12 h-12 mx-auto text-stone-300 dark:text-[#444455]" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-[#F4F4F5]">
            No tracked applications yet
          </h2>
          <p className="text-xs text-stone-500 dark:text-[#8E8E93] max-w-md mx-auto">
            Explore scholarships worldwide, then click "Track" on any opportunity to generate an automated requirement checklist.
          </p>
          <button
            onClick={onNavigateToExplore}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] shadow-xs hover:opacity-95 transition"
          >
            Discover Scholarships Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => {
            const proj = projectedScholarships.find(p => p.scholarship.id === app.scholarshipId);
            const scholarship = proj?.scholarship;
            const checklist = app.checklist || [];
            const completedCount = checklist.filter(c => c.completed).length;
            const totalCount = checklist.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isExpanded = expandedAppId === app.id;
            const isReadyToSubmit = progressPercent === 100 && totalCount > 0;

            return (
              <div 
                key={app.id}
                className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200/90 dark:border-[#24242E] shadow-xs overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50 dark:bg-[#14141B]">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 dark:bg-[#1E1E28] text-stone-800 dark:text-[#D1D1D6]">
                        {scholarship?.hostCountry || 'Global'}
                      </span>
                      {isReadyToSubmit ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> 100% Ready to Submit
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-[#E5C38F] border border-amber-500/20">
                          {completedCount}/{totalCount} Items ({progressPercent}%)
                        </span>
                      )}
                    </div>

                    <h2 
                      onClick={() => scholarship && onOpenDetails(scholarship)}
                      className="text-base sm:text-lg font-bold font-heading text-stone-900 dark:text-[#F4F4F5] truncate hover:text-amber-700 dark:hover:text-[#D4B37F] cursor-pointer"
                    >
                      {scholarship?.title || app.customTitle || 'Scholarship Application'}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-[#8E8E93] flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                      <span>{scholarship?.provider || 'External Grant'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Deadline: {app.deadline || scholarship?.deadline || 'Ongoing'}
                      </span>
                    </p>
                  </div>

                  {/* Actions & Pipeline Selector */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-[#22222E]">
                    {/* Status Dropdown */}
                    <select
                      value={app.status}
                      onChange={e => onUpdateAppStatus(app.id, e.target.value as ApplicationStatus)}
                      className="px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-[#282834] bg-white dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] font-semibold focus:outline-hidden min-h-[40px]"
                    >
                      <option value="preparing">Preparing</option>
                      <option value="submitted">Submitted</option>
                      <option value="interview">Interview</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    {/* View Full Opportunity Dossier Modal */}
                    {scholarship && (
                      <button
                        onClick={() => onOpenDetails(scholarship)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#1E1E28] dark:hover:bg-[#282836] text-stone-800 dark:text-[#D1D1D6] border border-stone-200 dark:border-[#282834] transition min-h-[40px]"
                        title="View Full Opportunity Information, Contacts, Links & Requirements"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    )}

                    {/* Direct Portal Link */}
                    {scholarship?.officialApplicationUrl && (
                      <a
                        href={scholarship.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-stone-600 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#181820] border border-stone-200 dark:border-[#282834] transition min-h-[40px] min-w-[40px] flex items-center justify-center"
                        title="Official Application Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="p-2 rounded-xl text-stone-600 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#181820] border border-stone-200 dark:border-[#282834] transition min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title={isExpanded ? 'Collapse Checklist' : 'Expand Checklist'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onRemoveApplication(app.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Untrack Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-100 dark:bg-[#1E1E28] h-1.5">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isReadyToSubmit ? 'bg-emerald-500' : 'bg-amber-500 dark:bg-[#C5A267]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Expanded Dynamic Checklist Content */}
                {isExpanded && (
                  <div className="p-5 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] flex items-center">
                        <ListChecks className="w-3.5 h-3.5 mr-1.5 text-stone-600 dark:text-[#C5A267]" />
                        Official Requirement Checklist ({completedCount}/{totalCount} Completed)
                      </h3>

                      {scholarship?.contacts && (
                        <div className="text-[11px] text-stone-500 dark:text-[#8E8E93] flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>Contact: {scholarship.contacts.email || scholarship.contacts.departmentOrPerson}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Checklist Items */}
                    <div className="space-y-2">
                      {checklist.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onToggleChecklistItem(app.scholarshipId, item.id)}
                          className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer ${
                            item.completed
                              ? 'bg-stone-50/60 dark:bg-[#0E0E12] border-stone-200/60 dark:border-[#1E1E28] opacity-75'
                              : 'bg-white dark:bg-[#181820] border-stone-200 dark:border-[#282834] hover:border-stone-300 dark:hover:border-[#383848]'
                          }`}
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            <button className="mt-0.5 shrink-0 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100">
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-stone-400 dark:text-[#52525B]" />
                              )}
                            </button>
                            <div>
                              <span className={`text-xs font-medium ${item.completed ? 'line-through text-stone-400 dark:text-[#71717A]' : 'text-stone-900 dark:text-[#F4F4F5]'}`}>
                                {item.title}
                              </span>
                              <span className="block text-[10px] text-stone-400 dark:text-[#71717A] uppercase mt-0.5">
                                Category: {item.category || 'General'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Task Input */}
                    <form 
                      onSubmit={e => handleAddTask(app.scholarshipId, app.id, e)}
                      className="flex gap-2 pt-2"
                    >
                      <input
                        type="text"
                        value={newTaskTitle[app.id] || ''}
                        onChange={e => setNewTaskTitle({ ...newTaskTitle, [app.id]: e.target.value })}
                        placeholder="Add personal task (e.g., 'Draft 500-word statement of purpose')..."
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-[#282834] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
                      />
                      <button
                        type="submit"
                        disabled={!newTaskTitle[app.id]?.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] disabled:opacity-50 transition"
                      >
                        <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Task
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
