import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  FileText, 
  UserCheck, 
  Lightbulb, 
  Loader2,
  ExternalLink,
  Plus,
  ListChecks
} from 'lucide-react';
import { Scholarship } from '../types';
import { getCachedAiSummary, saveCachedAiSummary } from '../utils/db';
import { apiFetch } from '../lib/api';

interface AiSummaryModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChecklist: (scholarship: Scholarship) => void;
  onTrack: (scholarship: Scholarship) => void;
  isTracked: boolean;
}

interface SummaryData {
  scholarshipId: string;
  overview: string;
  keyHighlights: string[];
  essentialRequirements: string[];
  targetCandidateProfile: string;
  keyAdvice: string;
}

export const AiSummaryModal: React.FC<AiSummaryModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  onOpenChecklist,
  onTrack,
  isTracked,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !scholarship) {
      setSummaryData(null);
      setError(null);
      return;
    }

    // Check local cache first for instant free-tier performance
    const cached = getCachedAiSummary(scholarship.id);
    if (cached) {
      setSummaryData(cached);
      return;
    }

    // Fetch from lean server endpoint
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/api/ai/summarize', {
          method: 'POST',
          body: JSON.stringify({
            scholarshipId: scholarship.id,
            title: scholarship.title,
            provider: scholarship.provider,
            hostCountry: scholarship.hostCountry,
            fundingType: scholarship.fundingType,
            summary: scholarship.summary,
            keyRequirements: scholarship.keyRequirements,
            eligibilityCriteria: scholarship.eligibilityCriteria,
          }),
        });

        if (!res.ok) throw new Error('Failed to generate summary');
        const data = await res.json();
        setSummaryData(data);
        saveCachedAiSummary(scholarship.id, data);
      } catch (err) {
        console.error('Summary error:', err);
        // Fallback directly
        const fallback: SummaryData = {
          scholarshipId: scholarship.id,
          overview: `${scholarship.title} is a ${scholarship.fundingType} scholarship provided by ${scholarship.provider} in ${scholarship.hostCountry}.`,
          keyHighlights: [
            `Comprehensive ${scholarship.fundingType} package covering key academic and living expenses.`,
            `Open to international applicants targeting ${scholarship.degreeLevels.join(', ')}.`,
            `High prestige award recognized globally by top academic institutions.`
          ],
          essentialRequirements: scholarship.keyRequirements.slice(0, 4),
          targetCandidateProfile: `Ideal for motivated candidates with strong academic standing (${scholarship.eligibilityCriteria?.minGpa ? `GPA ${scholarship.eligibilityCriteria.minGpa}+` : 'competitive GPA'}) in ${scholarship.fieldsOfStudy.join(', ')}.`,
          keyAdvice: scholarship.insiderTips?.[0] || 'Start preparing documentation early and obtain 2 strong recommendation letters.'
        };
        setSummaryData(fallback);
        saveCachedAiSummary(scholarship.id, fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [isOpen, scholarship]);

  if (!isOpen || !scholarship) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        id="ai-summary-dialog"
        className="bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#24242E] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-stone-800 dark:text-[#D1D1D6]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-[#22222A] flex items-center justify-between bg-stone-50/70 dark:bg-[#0E0E12]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 dark:bg-[#C5A267]/20 border border-amber-500/30 dark:border-[#C5A267]/40 flex items-center justify-center text-amber-700 dark:text-[#E5C38F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                AI Summary & Requirements
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] truncate max-w-xs sm:max-w-md">
                {scholarship.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[#F4F4F5] hover:bg-stone-200 dark:hover:bg-[#181820] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-stone-600 dark:text-[#C5A267]" />
              <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
                Generating concise summary and requirement breakdown...
              </p>
            </div>
          ) : summaryData ? (
            <>
              {/* Executive Overview */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200/80 dark:border-[#262632]">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-1.5 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1 text-stone-500 dark:text-[#C5A267]" />
                  Executive Overview
                </h3>
                <p className="text-xs sm:text-sm text-stone-800 dark:text-[#E4E4E7] leading-relaxed">
                  {summaryData.overview}
                </p>
              </div>

              {/* Key Highlights */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2 flex items-center">
                  <Award className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-[#C5A267]" />
                  Key Program Highlights
                </h3>
                <div className="space-y-1.5">
                  {summaryData.keyHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs p-2.5 rounded-lg bg-stone-50 dark:bg-[#181820] border border-stone-200/60 dark:border-[#262632]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed text-stone-800 dark:text-[#D1D1D6]">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Requirements */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2 flex items-center">
                  <ListChecks className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                  Essential Requirements to Prepare
                </h3>
                <div className="space-y-1.5">
                  {summaryData.essentialRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs p-2.5 rounded-lg bg-stone-50 dark:bg-[#181820] border border-stone-200/60 dark:border-[#262632]">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-[#C5A267] mt-1.5 shrink-0" />
                      <span className="leading-relaxed text-stone-800 dark:text-[#D1D1D6]">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideal Candidate Profile & Actionable Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200/80 dark:border-[#262632]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-1 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-stone-600 dark:text-[#C5A267]" />
                    Target Profile
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-[#D1D1D6] leading-relaxed">
                    {summaryData.targetCandidateProfile}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/10 border border-amber-500/30 dark:border-[#C5A267]/25">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-[#E5C38F] mb-1 flex items-center">
                    <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-[#C5A267]" />
                    Key Advisor Tip
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-[#D1D1D6] leading-relaxed">
                    {summaryData.keyAdvice}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-stone-500 text-center py-6">Could not load summary.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-[#0E0E12] border-t border-stone-200 dark:border-[#22222A] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenChecklist(scholarship);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-300 dark:hover:bg-[#22222C] border border-stone-300/60 dark:border-[#282834] transition"
          >
            <ListChecks className="w-3.5 h-3.5 text-stone-600 dark:text-[#C5A267]" />
            <span>Open Dynamic Checklist</span>
          </button>

          <div className="flex items-center space-x-2">
            {scholarship.officialApplicationUrl && (
              <a
                href={scholarship.officialApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-[#8E8E93] dark:hover:text-[#F4F4F5] hover:bg-stone-200 dark:hover:bg-[#181820] border border-transparent dark:hover:border-[#2E2E38] transition"
                title="Open Official Portal"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={() => {
                onTrack(scholarship);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isTracked
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90'
              }`}
            >
              {isTracked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Tracker</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Tracker</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
