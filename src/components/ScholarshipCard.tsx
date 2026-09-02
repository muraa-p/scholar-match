import React, { memo } from 'react';
import { 
  Globe, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Bookmark, 
  ListChecks, 
  Plus,
  ArrowRight,
  Building,
  GraduationCap
} from 'lucide-react';
import { Scholarship } from '../types';
import { getMatchBadgeColor } from '../utils/matchingEngine';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  matchScore: number;
  completedChecklistCount: number;
  totalChecklistCount: number;
  progressPercent: number;
  isSaved: boolean;
  isTracked: boolean;
  onToggleSave: (scholarshipId: string) => void;
  onTrack: (scholarship: Scholarship) => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onOpenAiSummary: (scholarship: Scholarship) => void;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = memo(({
  scholarship,
  matchScore,
  completedChecklistCount,
  totalChecklistCount,
  progressPercent,
  isSaved,
  isTracked,
  onToggleSave,
  onTrack,
  onOpenDetails,
}) => {
  const badgeStyle = getMatchBadgeColor(matchScore);

  return (
    <div 
      id={`scholarship-card-${scholarship.id}`}
      className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200/90 dark:border-[#24242E] hover:border-amber-500/50 dark:hover:border-[#C5A267]/50 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-5">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            {/* Match Score Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {matchScore}% Match
            </span>

            {/* Funding Type Badge */}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-[#181822] text-stone-700 dark:text-[#D1D1D6] border border-stone-200/80 dark:border-[#282834]">
              {scholarship.fundingType}
            </span>
          </div>

          {/* Bookmark / Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(scholarship.id);
            }}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            className={`p-2 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isSaved 
                ? 'text-amber-500 dark:text-[#C5A267] bg-amber-500/10 dark:bg-[#C5A267]/15' 
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-[#F4F4F5] hover:bg-stone-100 dark:hover:bg-[#181820]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title, Provider & Host University */}
        <div className="mb-2.5">
          <h3 
            onClick={() => onOpenDetails(scholarship)}
            className="text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5] group-hover:text-amber-800 dark:group-hover:text-[#D4B37F] cursor-pointer transition line-clamp-1"
          >
            {scholarship.title}
          </h3>
          
          {/* Explicit Provider & University Metadata */}
          <div className="mt-1.5 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-stone-700 dark:text-[#D1D1D6]">
              <Building className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-[#C5A267]" />
              <span className="font-semibold text-stone-800 dark:text-[#E4E4E7] truncate">
                {scholarship.provider}
              </span>
            </div>

            {scholarship.university && (
              <div className="flex items-center space-x-1.5 text-stone-600 dark:text-[#A1A1AA]">
                <GraduationCap className="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-[#8E8E93]" />
                <span className="truncate">
                  {scholarship.university}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-stone-500 dark:text-[#8E8E93] pt-0.5">
              <Globe className="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-[#8E8E93]" />
              <span className="font-medium text-stone-600 dark:text-[#A1A1AA] truncate">
                {scholarship.hostCountry}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-stone-600 dark:text-[#A1A1AA] line-clamp-2 leading-relaxed mb-3.5">
          {scholarship.summary}
        </p>

        {/* Key Requirement Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {scholarship.eligibilityCriteria.minGpa && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-[#181822] text-stone-700 dark:text-[#A1A1AA] border dark:border-[#24242E]">
              Min GPA {scholarship.eligibilityCriteria.minGpa.toFixed(1)}
            </span>
          )}
          {scholarship.financialCoverage.stipendAmount && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Stipend Covered
            </span>
          )}
          {scholarship.financialCoverage.airfare && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              Airfare Included
            </span>
          )}
          {scholarship.deadline && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-[#181822] text-stone-500 dark:text-[#8E8E93] border dark:border-[#24242E] flex items-center">
              <Calendar className="w-2.5 h-2.5 mr-1" />
              {scholarship.deadline}
            </span>
          )}
        </div>

        {/* Dynamic Checklist Progress Snapshot */}
        <div 
          onClick={() => onOpenDetails(scholarship)}
          className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#16161E] border border-stone-200/70 dark:border-[#22222C] cursor-pointer hover:border-stone-300 dark:hover:border-[#333342] transition"
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-stone-700 dark:text-[#D1D1D6] flex items-center">
              <ListChecks className="w-3.5 h-3.5 mr-1 text-stone-500 dark:text-[#C5A267]" />
              Checklist
            </span>
            <span className="font-mono text-stone-500 dark:text-[#8E8E93]">
              {completedChecklistCount}/{totalChecklistCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-200 dark:bg-[#22222E] h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100 
                  ? 'bg-emerald-500' 
                  : progressPercent > 0 
                    ? 'bg-amber-500 dark:bg-[#C5A267]' 
                    : 'bg-stone-300 dark:bg-[#323242]'
              }`}
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Bottom Actions */}
      <div className="px-5 py-3 bg-stone-50/80 dark:bg-[#0E0E12] border-t border-stone-200/80 dark:border-[#22222A] flex items-center justify-between gap-2">
        {/* Primary Action: View Opportunity Dossier */}
        <button
          onClick={() => onOpenDetails(scholarship)}
          className="flex items-center space-x-1.5 text-xs font-bold text-stone-900 dark:text-[#E5C38F] hover:underline min-h-[36px]"
        >
          <span>View Details & Links</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-1.5">
          {/* Direct External Link */}
          {scholarship.officialApplicationUrl && (
            <a
              href={scholarship.officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open official application website"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-[#8E8E93] dark:hover:text-[#F4F4F5] hover:bg-stone-200 dark:hover:bg-[#181820] transition min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Track Application Button */}
          <button
            id={`btn-track-${scholarship.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onTrack(scholarship);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition min-h-[36px] ${
              isTracked
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-stone-200 dark:bg-[#1E1E26] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-300 dark:hover:bg-[#282834]'
            }`}
          >
            {isTracked ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Tracked</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ScholarshipCard.displayName = 'ScholarshipCard';
