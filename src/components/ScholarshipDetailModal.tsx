import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Mail, 
  Phone, 
  HelpCircle, 
  Sparkles, 
  ListChecks, 
  Award,
  Lightbulb,
  CheckCircle2,
  Copy,
  Plus,
  Bookmark,
  CheckSquare,
  Circle,
  Building,
  FileText,
  UserCheck,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { Scholarship, UserProfile, ChecklistItem } from '../types';
import { calculateMatchScore, getMatchBadgeColor } from '../utils/matchingEngine';
import { getScholarshipChecklist, saveScholarshipChecklist, addChecklistItem } from '../utils/db';

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | null;
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  isTracked: boolean;
  onToggleSave: (scholarshipId: string) => void;
  onTrack: (scholarship: Scholarship) => void;
  onOpenAiSummary: (scholarship: Scholarship) => void;
  onChecklistChanged?: () => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  userProfile,
  isOpen,
  onClose,
  isSaved,
  isTracked,
  onToggleSave,
  onTrack,
  onOpenAiSummary,
  onChecklistChanged,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'checklist' | 'contacts'>('overview');

  useEffect(() => {
    if (isOpen && scholarship) {
      setChecklistItems(getScholarshipChecklist(scholarship));
    }
  }, [isOpen, scholarship]);

  if (!isOpen || !scholarship) return null;

  const matchResult = calculateMatchScore(scholarship, userProfile);
  const badgeStyle = getMatchBadgeColor(matchResult.score);

  const completedCount = checklistItems.filter(i => i.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleToggleCheckItem = (itemId: string) => {
    const updated = checklistItems.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updated);
    saveScholarshipChecklist(scholarship.id, updated);
    if (onChecklistChanged) onChecklistChanged();
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const updated = addChecklistItem(scholarship.id, {
      title: newChecklistText.trim(),
      category: 'custom'
    });
    setChecklistItems(updated);
    setNewChecklistText('');
    if (onChecklistChanged) onChecklistChanged();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        id="scholarship-detail-dialog"
        className="bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#24242E] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-200 dark:border-[#22222A] bg-stone-50/70 dark:bg-[#0E0E12] flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {matchResult.score}% Profile Match
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 dark:bg-[#1A1A24] text-stone-800 dark:text-[#D1D1D6] border dark:border-[#2E2E3A]">
                {scholarship.fundingType}
              </span>
              {scholarship.deadline && (
                <span className="text-xs text-stone-600 dark:text-[#8E8E93] flex items-center bg-stone-100 dark:bg-[#181820] px-2 py-0.5 rounded-md border border-stone-200 dark:border-[#24242E]">
                  <Calendar className="w-3 h-3 mr-1 text-stone-500 dark:text-[#C5A267]" /> 
                  Deadline: <strong className="ml-1 text-stone-900 dark:text-[#F4F4F5]">{scholarship.deadline}</strong>
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5] leading-tight">
              {scholarship.title}
            </h1>

            <div className="text-xs sm:text-sm text-stone-500 dark:text-[#8E8E93] mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-stone-900 dark:text-[#E4E4E7] flex items-center">
                <Building className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-[#C5A267]" />
                {scholarship.provider}
              </span>
              {scholarship.university && (
                <>
                  <span>•</span>
                  <span className="font-medium text-stone-700 dark:text-[#D1D1D6] flex items-center">
                    <GraduationCap className="w-3.5 h-3.5 mr-1 text-stone-400 dark:text-[#8E8E93]" />
                    {scholarship.university}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center text-stone-600 dark:text-[#A1A1AA]">
                <Globe className="w-3.5 h-3.5 mr-1 text-stone-400 dark:text-[#8E8E93]" /> 
                {scholarship.hostCountry}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleSave(scholarship.id)}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-amber-500/15 text-amber-600 dark:text-[#C5A267] border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-[#F4F4F5] border-stone-200 dark:border-[#24242E] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
              title={isSaved ? 'Saved to shortlist' : 'Save to shortlist'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-[#F4F4F5] p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#181820] border border-stone-200 dark:border-[#24242E] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Navigation Tabs inside Dossier */}
        <div className="flex items-center space-x-1 px-3 sm:px-6 py-2 bg-stone-100 dark:bg-[#15151C] border-b border-stone-200 dark:border-[#22222A] text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg font-semibold transition shrink-0 min-h-[38px] ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#20202A] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-2 rounded-lg font-semibold transition shrink-0 min-h-[38px] ${
              activeTab === 'requirements'
                ? 'bg-white dark:bg-[#20202A] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
            }`}
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-2 rounded-lg font-semibold transition shrink-0 flex items-center space-x-1.5 min-h-[38px] ${
              activeTab === 'checklist'
                ? 'bg-white dark:bg-[#20202A] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-stone-500 dark:text-[#C5A267]" />
            <span>Checklist ({completedCount}/{totalCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-2 rounded-lg font-semibold transition shrink-0 flex items-center space-x-1.5 min-h-[38px] ${
              activeTab === 'contacts'
                ? 'bg-white dark:bg-[#20202A] text-stone-900 dark:text-[#F4F4F5] shadow-xs'
                : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-stone-500 dark:text-[#C5A267]" />
            <span>Contacts & Portal</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-[#D1D1D6]">

          {/* Prominent Direct Official Action Banner */}
          <div className="p-4 rounded-xl bg-stone-900 dark:bg-[#181822] text-stone-100 dark:text-[#F4F4F5] border border-stone-800 dark:border-[#2C2C3C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Verified Official Portal
                </span>
                <span className="text-xs text-stone-400">Direct opportunity access</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Skip searching confusing university directories. Access the direct application portal and official forms.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
              {scholarship.officialApplicationUrl ? (
                <a
                  href={scholarship.officialApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 dark:bg-[#C5A267] dark:hover:bg-[#D4B37F] text-stone-950 transition shadow-sm"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-stone-400 italic">Apply through Embassy / University contact</span>
              )}

              <button
                onClick={() => onOpenAiSummary(scholarship)}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 dark:bg-[#22222E] hover:bg-stone-700 text-stone-200 border border-stone-700 dark:border-[#333344] transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-[#C5A267]" />
                <span>AI Explainer</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Institutional & University Details */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#24242E] bg-stone-50/70 dark:bg-[#16161E] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93]">
                  Host Institutions & Governing Body
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#262634]">
                    <span className="text-[10px] uppercase font-semibold text-stone-400 dark:text-[#71717A] block">
                      Award Provider / Funding Agency
                    </span>
                    <span className="font-bold text-stone-900 dark:text-[#F4F4F5] mt-0.5 block flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-amber-600 dark:text-[#C5A267] shrink-0" />
                      {scholarship.provider}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#262634]">
                    <span className="text-[10px] uppercase font-semibold text-stone-400 dark:text-[#71717A] block">
                      Eligible / Host Universities
                    </span>
                    <span className="font-bold text-stone-900 dark:text-[#F4F4F5] mt-0.5 block flex items-center">
                      <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-amber-600 dark:text-[#C5A267] shrink-0" />
                      {scholarship.university || 'All accredited universities in host country'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Program Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2">
                  Program Summary & Mission
                </h3>
                <p className="text-sm leading-relaxed text-stone-700 dark:text-[#A1A1AA]">
                  {scholarship.summary}
                </p>
              </div>

              {/* Financial Coverage Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2.5 flex items-center justify-between">
                  <span>Complete Financial Coverage Breakdown</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{scholarship.fundingType}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-[#24242E] bg-stone-50 dark:bg-[#16161E]">
                    <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold">Tuition Fees</span>
                    <span className="font-bold text-stone-900 dark:text-[#F4F4F5] mt-0.5 block">
                      {scholarship.financialCoverage.tuition ? '100% Fully Waived' : 'Partial / Variable'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-[#24242E] bg-stone-50 dark:bg-[#16161E]">
                    <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold">Living Stipend</span>
                    <span className="font-bold text-stone-900 dark:text-[#F4F4F5] mt-0.5 block">
                      {scholarship.financialCoverage.stipendAmount || (scholarship.financialCoverage.livingStipend ? 'Fully Covered' : 'Self-funded')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-[#24242E] bg-stone-50 dark:bg-[#16161E]">
                    <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold">International Airfare</span>
                    <span className="font-bold text-stone-900 dark:text-[#F4F4F5] mt-0.5 block">
                      {scholarship.financialCoverage.airfare ? 'Roundtrip Flights' : 'Not Included'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-[#24242E] bg-stone-50 dark:bg-[#16161E]">
                    <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold">Health & Visa</span>
                    <span className="font-bold text-stone-900 dark:text-[#F4F4F5] mt-0.5 block">
                      {scholarship.financialCoverage.healthInsurance ? 'Full Medical' : 'Variable'}
                    </span>
                  </div>
                </div>

                {scholarship.financialCoverage.otherBenefits && scholarship.financialCoverage.otherBenefits.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-stone-50 dark:bg-[#16161E] border border-stone-200/80 dark:border-[#24242E] text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] block mb-1">
                      Additional Grants & Allowances:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scholarship.financialCoverage.otherBenefits.map((b, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-[#20202A] text-stone-800 dark:text-[#D1D1D6] text-[11px]">
                          • {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Match Diagnosis */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#24242E] bg-stone-50/60 dark:bg-[#15151C] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#F4F4F5] flex items-center justify-between">
                  <span>Match Analysis for {userProfile.name || 'Your Profile'}</span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-[#D4B37F]">{matchResult.score}% Compatibility</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#24242E]">
                    <span className="text-[10px] text-stone-400 block font-semibold">GPA Requirement</span>
                    <span className="font-semibold text-stone-800 dark:text-[#D1D1D6]">
                      Your GPA: {userProfile.gpa.toFixed(1)} / Min: {scholarship.eligibilityCriteria.minGpa ? scholarship.eligibilityCriteria.minGpa.toFixed(1) : 'None'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#24242E]">
                    <span className="text-[10px] text-stone-400 block font-semibold">Degree Match</span>
                    <span className="font-semibold text-stone-800 dark:text-[#D1D1D6]">
                      {userProfile.targetDegree} ({scholarship.degreeLevels.some(d => d.includes(userProfile.targetDegree)) ? 'Matched' : 'General'})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#24242E]">
                    <span className="text-[10px] text-stone-400 block font-semibold">Field Compatibility</span>
                    <span className="font-semibold text-stone-800 dark:text-[#D1D1D6]">
                      {userProfile.fieldOfStudy}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUIREMENTS & PITFALLS */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {/* Key Requirements List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2.5">
                  Official Mandatory Requirements
                </h3>
                <div className="space-y-2">
                  {scholarship.keyRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs p-3 rounded-xl bg-stone-50 dark:bg-[#16161E] border border-stone-200/80 dark:border-[#24242E]">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed text-stone-800 dark:text-[#D1D1D6] font-medium">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRUCIAL SECTION: Why Applicants Get Rejected */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/10 border border-amber-500/30 dark:border-[#C5A267]/25 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 dark:text-[#E5C38F] font-heading font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#C5A267] shrink-0" />
                  <span>Why Applicants Get Rejected by Selection Committees</span>
                </div>
                <p className="text-xs text-stone-700 dark:text-[#A1A1AA]">
                  Top reasons strong candidates are screened out:
                </p>
                <ul className="space-y-2">
                  {scholarship.rejectionPitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-stone-800 dark:text-[#D1D1D6]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-[#C5A267] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Insider Tips & Committee Expectations */}
              {scholarship.insiderTips && scholarship.insiderTips.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/25 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-300 font-heading font-bold text-xs">
                    <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Selection Committee Insider Tips:</span>
                  </div>
                  <ul className="space-y-1.5">
                    {scholarship.insiderTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-stone-800 dark:text-[#D1D1D6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERACTIVE CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-[#16161E] border border-stone-200 dark:border-[#24242E]">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-[#F4F4F5]">
                    Application Milestone Progress
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-[#8E8E93]">
                    Check off items as you prepare documents and submit essays.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-stone-900 dark:text-[#F4F4F5]">
                    {progressPercent}% Complete
                  </span>
                  <span className="text-[11px] text-stone-500 block font-mono">
                    ({completedCount}/{totalCount} tasks)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-200 dark:bg-[#22222E] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500 dark:bg-[#C5A267]'
                  }`}
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>

              {/* Checklist Items List */}
              <div className="space-y-2 pt-2">
                {checklistItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleCheckItem(item.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer ${
                      item.completed
                        ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white dark:bg-[#16161E] border-stone-200 dark:border-[#262634] hover:border-stone-300 dark:hover:border-[#383848]'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-400 dark:text-[#71717A]" />
                        )}
                      </div>
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

              {/* Add Custom Item Form */}
              <form onSubmit={handleAddCustomItem} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  placeholder="Add custom reminder (e.g., 'Request transcript translation from registrar')..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-[#262634] bg-stone-50 dark:bg-[#16161E] text-stone-900 dark:text-[#F4F4F5] placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
                />
                <button
                  type="submit"
                  disabled={!newChecklistText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] disabled:opacity-50 transition"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Task
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: CONTACTS & PORTALS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* Application Portal & Contacts Directory */}
              <div className="p-5 rounded-2xl border border-stone-200 dark:border-[#24242E] bg-stone-50/70 dark:bg-[#15151C] space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#F4F4F5]">
                    Official Application Portal & Helpdesk
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-[#8E8E93] mt-0.5">
                    Direct coordinator contacts, inquiry webforms, and admission offices so you never have to wander through forums.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Portal Link */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#282834]">
                    <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold mb-1">
                      Official Application Website
                    </span>
                    {scholarship.officialApplicationUrl ? (
                      <a
                        href={scholarship.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 font-bold text-stone-900 dark:text-[#D4B37F] hover:underline break-all"
                      >
                        <span>{scholarship.officialApplicationUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-stone-500 dark:text-[#C5A267]" />
                      </a>
                    ) : (
                      <span className="text-stone-500 italic">Apply directly via Embassy / University quota</span>
                    )}
                  </div>

                  {/* Inquiry Email */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#282834]">
                    <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold mb-1">
                      Coordinator / Admissions Email
                    </span>
                    {scholarship.contacts.email ? (
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`mailto:${scholarship.contacts.email}`}
                          className="font-mono font-medium text-stone-900 dark:text-[#D1D1D6] hover:underline break-all"
                        >
                          {scholarship.contacts.email}
                        </a>
                        <button
                          onClick={() => handleCopyEmail(scholarship.contacts.email!)}
                          title="Copy Email"
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-stone-100 dark:bg-[#1E1E28] hover:bg-stone-200 text-stone-600 dark:text-[#D4B37F] text-[11px] shrink-0"
                        >
                          {copiedEmail ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-stone-500 italic">Refer to local embassy cultural section</span>
                    )}
                  </div>

                  {/* Inquiry Webform (if present) */}
                  {scholarship.contacts.inquiryFormUrl && (
                    <div className="p-4 rounded-xl bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#282834]">
                      <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold mb-1">
                        Inquiry Webform / Q&A Desk
                      </span>
                      <a
                        href={scholarship.contacts.inquiryFormUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 font-bold text-stone-900 dark:text-[#D4B37F] hover:underline break-all"
                      >
                        <span>Open Helpdesk Form</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                      </a>
                    </div>
                  )}

                  {/* Department Name */}
                  {scholarship.contacts.departmentOrPerson && (
                    <div className="p-4 rounded-xl bg-white dark:bg-[#121217] border border-stone-200 dark:border-[#282834]">
                      <span className="text-stone-400 dark:text-[#71717A] block text-[10px] uppercase font-semibold mb-1">
                        Responsible Secretariat / Department
                      </span>
                      <span className="text-stone-800 dark:text-[#D1D1D6] font-medium">
                        {scholarship.contacts.departmentOrPerson}
                      </span>
                    </div>
                  )}
                </div>

                {scholarship.contacts.notes && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/15 border border-amber-500/25 dark:border-[#C5A267]/30 text-xs text-stone-800 dark:text-[#D1D1D6]">
                    💡 <strong>Coordinator Advisory:</strong> {scholarship.contacts.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-stone-50 dark:bg-[#0E0E12] border-t border-stone-200 dark:border-[#22222A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#1A1A22] transition min-h-[44px] order-2 sm:order-1"
          >
            Close
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
            {scholarship.officialApplicationUrl && (
              <a
                href={scholarship.officialApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 dark:bg-[#C5A267] dark:hover:bg-[#D4B37F] text-stone-950 transition shadow-xs min-h-[44px]"
              >
                <span>Official Application Portal</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={() => {
                onTrack(scholarship);
                if (onChecklistChanged) onChecklistChanged();
              }}
              className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                isTracked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-stone-900 dark:bg-[#20202A] text-stone-50 dark:text-[#E4E4E7] hover:opacity-90 border dark:border-[#383848]'
              }`}
            >
              {isTracked ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tracked in Checklists</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to My Checklists</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
