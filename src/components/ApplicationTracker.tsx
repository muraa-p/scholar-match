import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  AlertCircle, 
  CheckSquare, 
  FileText, 
  Edit3,
  Search,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  TrackedApplication, 
  Scholarship, 
  ApplicationStatus, 
  ChecklistItem, 
  UserProfile 
} from '../types';

interface ApplicationTrackerProps {
  applications: TrackedApplication[];
  scholarships: Scholarship[];
  userProfile: UserProfile;
  onUpdateApplication: (app: TrackedApplication) => void;
  onRemoveApplication: (appId: string) => void;
  onOpenAiDiagnostic: (scholarship: Scholarship) => void;
  onOpenLetterDrafter: (scholarship: Scholarship, app?: TrackedApplication) => void;
  onNavigateExplore: () => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string }> = {
  considering: {
    label: 'Considering',
    bg: 'bg-stone-500/10 dark:bg-[#181822]',
    text: 'text-stone-700 dark:text-[#D1D1D6]',
    border: 'border-stone-300 dark:border-[#2F2F3D]',
  },
  preparing: {
    label: 'Preparing Docs',
    bg: 'bg-amber-500/10 dark:bg-[#C5A267]/15',
    text: 'text-amber-800 dark:text-[#E5C38F]',
    border: 'border-amber-400/40 dark:border-[#C5A267]/35',
  },
  applied: {
    label: 'Submitted / Applied',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-400/40 dark:border-blue-500/30',
  },
  interview: {
    label: 'Interview Stage',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-400/40 dark:border-purple-500/30',
  },
  accepted: {
    label: 'Accepted 🎉',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/40 dark:border-emerald-500/40',
  },
  rejected: {
    label: 'Rejected / Learning',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-400/40 dark:border-rose-800/40',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-stone-200 dark:bg-[#15151B]',
    text: 'text-stone-500 dark:text-[#71717A]',
    border: 'border-stone-300 dark:border-[#22222A]',
  },
};

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  scholarships,
  userProfile,
  onUpdateApplication,
  onRemoveApplication,
  onOpenAiDiagnostic,
  onOpenLetterDrafter,
  onNavigateExplore,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(applications[0]?.id || null);
  const [newTaskTitle, setNewTaskTitle] = useState<{ [appId: string]: string }>({});
  const [newTaskCategory, setNewTaskCategory] = useState<{ [appId: string]: ChecklistItem['category'] }>({});
  const [newCommRecipient, setNewCommRecipient] = useState<{ [appId: string]: string }>({});
  const [newCommTopic, setNewCommTopic] = useState<{ [appId: string]: string }>({});
  const [newCommNotes, setNewCommNotes] = useState<{ [appId: string]: string }>({});
  const [showCommForm, setShowCommForm] = useState<{ [appId: string]: boolean }>({});

  const filteredApps = applications.filter(app => {
    if (selectedStatusFilter === 'all') return app.status !== 'archived';
    return app.status === selectedStatusFilter;
  });

  // Calculate Overall Progress Metrics
  const totalChecklistItems = applications.reduce((acc, app) => acc + (app.checklist?.length || 0), 0);
  const completedChecklistItems = applications.reduce(
    (acc, app) => acc + (app.checklist?.filter(c => c.completed)?.length || 0),
    0
  );
  const overallPercentage = totalChecklistItems > 0 
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
    : 0;

  // Checklist handlers
  const handleToggleChecklist = (app: TrackedApplication, itemId: string) => {
    const updatedChecklist = app.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateApplication({
      ...app,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddChecklistItem = (app: TrackedApplication) => {
    const title = newTaskTitle[app.id]?.trim();
    if (!title) return;

    const newItem: ChecklistItem = {
      id: `custom-task-${Date.now()}`,
      title,
      category: newTaskCategory[app.id] || 'custom',
      completed: false,
    };

    onUpdateApplication({
      ...app,
      checklist: [...app.checklist, newItem],
      updatedAt: new Date().toISOString(),
    });

    setNewTaskTitle({ ...newTaskTitle, [app.id]: '' });
  };

  const handleDeleteChecklistItem = (app: TrackedApplication, itemId: string) => {
    onUpdateApplication({
      ...app,
      checklist: app.checklist.filter(i => i.id !== itemId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Status Change Handler
  const handleStatusChange = (app: TrackedApplication, newStatus: ApplicationStatus) => {
    onUpdateApplication({
      ...app,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Communication Log Handlers
  const handleAddCommunication = (app: TrackedApplication) => {
    const recipient = newCommRecipient[app.id]?.trim();
    const topic = newCommTopic[app.id]?.trim();
    const notes = newCommNotes[app.id]?.trim();

    if (!topic) return;

    const newLog = {
      id: `comm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      recipient: recipient || 'Scholarship Coordinator',
      topic,
      notes: notes || '',
      replied: false,
    };

    onUpdateApplication({
      ...app,
      communicationLog: [...(app.communicationLog || []), newLog],
      updatedAt: new Date().toISOString(),
    });

    setNewCommRecipient({ ...newCommRecipient, [app.id]: '' });
    setNewCommTopic({ ...newCommTopic, [app.id]: '' });
    setNewCommNotes({ ...newCommNotes, [app.id]: '' });
    setShowCommForm({ ...showCommForm, [app.id]: false });
  };

  const handleToggleCommReply = (app: TrackedApplication, logId: string) => {
    const updatedLogs = (app.communicationLog || []).map(l => 
      l.id === logId ? { ...l, replied: !l.replied } : l
    );
    onUpdateApplication({
      ...app,
      communicationLog: updatedLogs,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Overview & Stats Bar */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
              Applications Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-[#8E8E93] mt-1">
              Track custom document milestones, coordinator inquiries, and deadlines with zero database overhead.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#181820] border border-transparent dark:border-[#262632]">
              <span className="block text-lg font-bold font-mono text-stone-900 dark:text-[#F4F4F5]">
                {applications.length}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] uppercase font-semibold">Tracked Apps</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#181820] border border-transparent dark:border-[#262632]">
              <span className="block text-lg font-bold font-mono text-stone-900 dark:text-[#D4B37F]">
                {completedChecklistItems}/{totalChecklistItems}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] uppercase font-semibold">Tasks Done</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 dark:border-emerald-500/30">
              <span className="block text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {overallPercentage}%
              </span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase font-semibold">Progress</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-[#22222A] flex items-center space-x-3">
          <div className="flex-1 bg-stone-100 dark:bg-[#1A1A24] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-stone-600 dark:text-[#A1A1AA] whitespace-nowrap">
            {completedChecklistItems} of {totalChecklistItems} requirements completed
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'preparing', 'considering', 'applied', 'interview', 'accepted', 'rejected'].map(statusKey => {
          const count = statusKey === 'all' 
            ? applications.filter(a => a.status !== 'archived').length
            : applications.filter(a => a.status === statusKey).length;
          
          return (
            <button
              key={statusKey}
              onClick={() => setSelectedStatusFilter(statusKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedStatusFilter === statusKey
                  ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] shadow-xs'
                  : 'bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#24242E] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-100 dark:hover:bg-[#181822]'
              }`}
            >
              <span>{statusKey === 'all' ? 'All Active' : STATUS_CONFIG[statusKey as ApplicationStatus]?.label || statusKey}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedStatusFilter === statusKey
                  ? 'bg-stone-700 dark:bg-[#A8864B] text-stone-100 dark:text-[#0A0A0B]'
                  : 'bg-stone-200 dark:bg-[#1E1E28] text-stone-700 dark:text-[#D1D1D6]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#121217] rounded-2xl border border-dashed border-stone-300 dark:border-[#2E2E3C]">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-[#1A1A22] border dark:border-[#2E2E38] flex items-center justify-center mx-auto text-stone-400 dark:text-[#C5A267] mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-[#F4F4F5]">
            No applications in this category
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8E8E93] max-w-md mx-auto mt-1 mb-4">
            Explore available scholarships matched with your profile, and click "Track App" to start building your custom checklist.
          </p>
          <button
            onClick={onNavigateExplore}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90 dark:hover:bg-[#D4B37F] transition"
          >
            <span>Explore Matched Scholarships</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tracked Application Cards List */}
      <div className="space-y-4">
        {filteredApps.map(app => {
          const scholarship = scholarships.find(s => s.id === app.scholarshipId);
          const isExpanded = expandedAppId === app.id;
          const statusStyle = STATUS_CONFIG[app.status] || STATUS_CONFIG.considering;
          
          const completedCount = app.checklist?.filter(c => c.completed).length || 0;
          const totalCount = app.checklist?.length || 0;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={app.id}
              id={`tracked-app-${app.id}`}
              className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] overflow-hidden shadow-xs hover:dark:border-[#C5A267]/40 transition-all"
            >
              {/* Application Header Card */}
              <div 
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70 dark:hover:bg-[#16161D] transition"
                onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Status selector */}
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} focus:outline-hidden cursor-pointer`}
                      >
                        <option value="considering">Considering</option>
                        <option value="preparing">Preparing Docs</option>
                        <option value="applied">Submitted / Applied</option>
                        <option value="interview">Interview Stage</option>
                        <option value="accepted">Accepted 🎉</option>
                        <option value="rejected">Rejected / Learning</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <span className="text-xs text-stone-500 dark:text-[#8E8E93] flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-stone-400 dark:text-[#71717A]" /> Due: {scholarship?.deadline || app.deadline || 'TBD'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                    {scholarship?.title || app.customTitle || 'Scholarship Application'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
                    {scholarship?.provider} • {scholarship?.hostCountry}
                  </p>
                </div>

                {/* Progress Mini Bar & Chevron */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-stone-800 dark:text-[#D1D1D6]">
                      {completedCount}/{totalCount} Done ({progressPercent}%)
                    </div>
                    <div className="w-28 bg-stone-100 dark:bg-[#1E1E28] h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Application Detail & Interactive Checklist */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-stone-100 dark:border-[#22222A] space-y-6">
                  
                  {/* Action Toolbelt: Portal, Contacts, AI Letter, Rejection Diagnosis */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {scholarship?.officialApplicationUrl && (
                      <a
                        href={scholarship.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#22222C] border border-stone-200 dark:border-[#2C2C38] transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Official Portal</span>
                      </a>
                    )}

                    {scholarship?.contacts?.email && (
                      <a
                        href={`mailto:${scholarship.contacts.email}?subject=Inquiry: ${encodeURIComponent(scholarship.title)}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#22222C] border border-stone-200 dark:border-[#2C2C38] transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Coordinator</span>
                      </a>
                    )}

                    {scholarship && (
                      <>
                        <button
                          onClick={() => onOpenLetterDrafter(scholarship, app)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 dark:bg-[#1E1E28] text-stone-50 dark:text-[#E4E4E7] border border-transparent dark:border-[#383848] hover:opacity-90 dark:hover:border-[#C5A267]/50 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-300 dark:text-[#C5A267]" />
                          <span>AI Motivation Letter Drafter</span>
                        </button>

                        <button
                          onClick={() => onOpenAiDiagnostic(scholarship)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 dark:bg-[#C5A267]/15 text-amber-800 dark:text-[#D4B37F] border border-amber-500/30 dark:border-[#C5A267]/35 hover:bg-amber-500/25 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Rejection Risk Diagnostic</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onRemoveApplication(app.id)}
                      className="ml-auto text-xs text-rose-600 dark:text-rose-400 hover:underline p-1 flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove from Tracker
                    </button>
                  </div>

                  {/* Interactive Milestone Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-stone-900 dark:text-[#F4F4F5] flex items-center">
                        <CheckSquare className="w-4 h-4 mr-1.5 text-stone-600 dark:text-[#C5A267]" />
                        Application Milestones & Custom Checklist
                      </h4>
                      <span className="text-xs text-stone-500 dark:text-[#8E8E93]">
                        {completedCount} of {totalCount} completed
                      </span>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2">
                      {app.checklist?.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-start justify-between p-2.5 rounded-xl border transition ${
                            item.completed
                              ? 'bg-stone-50/60 dark:bg-[#0E0E12] border-stone-200/60 dark:border-[#1E1E28] opacity-75'
                              : 'bg-white dark:bg-[#181820] border-stone-200 dark:border-[#282834] shadow-2xs'
                          }`}
                        >
                          <div 
                            onClick={() => handleToggleChecklist(app, item.id)}
                            className="flex items-start space-x-3 cursor-pointer flex-1"
                          >
                            <button className="mt-0.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100">
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-stone-400 dark:text-[#52525B]" />
                              )}
                            </button>
                            <div>
                              <p className={`text-xs font-medium ${
                                item.completed 
                                  ? 'line-through text-stone-400 dark:text-[#666672]' 
                                  : 'text-stone-800 dark:text-[#E4E4E7]'
                              }`}>
                                {item.title}
                              </p>
                              {item.notes && (
                                <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] mt-0.5">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-[#121217] text-stone-500 dark:text-[#A1A1AA] border dark:border-[#262632]">
                              {item.category}
                            </span>
                            <button
                              onClick={() => handleDeleteChecklistItem(app, item.id)}
                              className="text-stone-300 dark:text-[#52525B] hover:text-rose-500 dark:hover:text-rose-400 p-1 transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Item Input */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="text"
                        value={newTaskTitle[app.id] || ''}
                        onChange={e => setNewTaskTitle({ ...newTaskTitle, [app.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem(app)}
                        placeholder="Add custom task (e.g. Request Professor John letter, Get German certified translation)..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] placeholder-stone-400 dark:placeholder-[#666672] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
                      />

                      <select
                        value={newTaskCategory[app.id] || 'custom'}
                        onChange={e => setNewTaskCategory({ ...newTaskCategory, [app.id]: e.target.value as any })}
                        className="px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] focus:outline-hidden"
                      >
                        <option value="custom">Custom</option>
                        <option value="document">Document</option>
                        <option value="essay">Essay / SOP</option>
                        <option value="recommendation">Reference</option>
                        <option value="test">Test</option>
                        <option value="submission">Submission</option>
                      </select>

                      <button
                        onClick={() => handleAddChecklistItem(app)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90 dark:hover:bg-[#D4B37F] transition flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* Personal Strategy Notes */}
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200 dark:border-[#262632]">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-800 dark:text-[#D1D1D6] flex items-center">
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-stone-500 dark:text-[#C5A267]" />
                        Personal Application Strategy Notes
                      </label>
                      <span className="text-[10px] text-stone-400 dark:text-[#71717A]">Auto-saved locally</span>
                    </div>
                    <textarea
                      rows={2}
                      value={app.personalNotes || ''}
                      onChange={e => {
                        onUpdateApplication({
                          ...app,
                          personalNotes: e.target.value,
                          updatedAt: new Date().toISOString(),
                        });
                      }}
                      placeholder="e.g. Professor suggested highlighting my community water filter project. Mention course modules A & B in the interview."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2C2C38] bg-white dark:bg-[#121217] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:border-[#C5A267]"
                    />
                  </div>

                  {/* Coordinator Inquiries & Communication Log */}
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200 dark:border-[#262632] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-800 dark:text-[#D1D1D6] flex items-center">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-stone-500 dark:text-[#C5A267]" />
                        Coordinator Communication & Inquiry Log ({app.communicationLog?.length || 0})
                      </h4>
                      <button
                        onClick={() => setShowCommForm({ ...showCommForm, [app.id]: !showCommForm[app.id] })}
                        className="text-xs font-semibold text-stone-700 dark:text-[#D4B37F] hover:underline"
                      >
                        {showCommForm[app.id] ? 'Close' : '+ Log Email Inquiry'}
                      </button>
                    </div>

                    {/* Existing Logs */}
                    {app.communicationLog && app.communicationLog.length > 0 ? (
                      <div className="space-y-2">
                        {app.communicationLog.map(log => (
                          <div 
                            key={log.id} 
                            className="p-2.5 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#262632] text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-stone-900 dark:text-[#F4F4F5]">
                                {log.topic}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-stone-400 dark:text-[#71717A]">{log.date}</span>
                                <button
                                  onClick={() => handleToggleCommReply(app, log.id)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    log.replied
                                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-amber-500/20 dark:bg-[#C5A267]/20 text-amber-800 dark:text-[#E5C38F]'
                                  }`}
                                >
                                  {log.replied ? 'Replied ✓' : 'Awaiting Reply'}
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-[#8E8E93]">
                              To: {log.recipient}
                            </p>
                            {log.notes && (
                              <p className="text-xs text-stone-700 dark:text-[#D1D1D6] mt-1 bg-stone-50 dark:bg-[#181822] p-2 rounded border dark:border-[#2A2A35]">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-500 dark:text-[#71717A] italic">
                        No inquiries logged yet. Record questions asked to embassy or university coordinators to track replies.
                      </p>
                    )}

                    {/* Add Communication Form */}
                    {showCommForm[app.id] && (
                      <div className="p-3 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#282836] space-y-2 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newCommTopic[app.id] || ''}
                            onChange={e => setNewCommTopic({ ...newCommTopic, [app.id]: e.target.value })}
                            placeholder="Inquiry Topic (e.g. English test waiver for degree)"
                            className="px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181822] text-stone-900 dark:text-[#F4F4F5]"
                          />
                          <input
                            type="text"
                            value={newCommRecipient[app.id] || ''}
                            onChange={e => setNewCommRecipient({ ...newCommRecipient, [app.id]: e.target.value })}
                            placeholder="Recipient (e.g. admissions@ox.ac.uk)"
                            className="px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181822] text-stone-900 dark:text-[#F4F4F5]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={newCommNotes[app.id] || ''}
                          onChange={e => setNewCommNotes({ ...newCommNotes, [app.id]: e.target.value })}
                          placeholder="Summary of response received or follow-up notes..."
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181822] text-stone-900 dark:text-[#F4F4F5]"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleAddCommunication(app)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90"
                          >
                            Save Log Entry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
