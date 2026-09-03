import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  Compass, 
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { Scholarship, UserProfile, TrackedApplication } from '../types';
import { apiFetch } from '../lib/api';

interface AiAssistantViewProps {
  scholarships: Scholarship[];
  userProfile: UserProfile;
  applications: TrackedApplication[];
  selectedScholarship: Scholarship | null;
  onSelectScholarship: (scholarship: Scholarship) => void;
  onSaveLetterToApp?: (scholarshipId: string, letter: string) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  scholarships,
  userProfile,
  applications,
  selectedScholarship,
  onSelectScholarship,
  onSaveLetterToApp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diagnostic' | 'sop_drafter' | 'essay_reviewer'>('diagnostic');
  const [currentScholarship, setCurrentScholarship] = useState<Scholarship>(
    selectedScholarship || scholarships[0]
  );

  // Diagnostic State
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // SOP Drafter State
  const [sopTone, setSopTone] = useState('persuasive_academic');
  const [sopCustomNotes, setSopCustomNotes] = useState('');
  const [loadingSop, setLoadingSop] = useState(false);
  const [sopResult, setSopResult] = useState<{ letterDraft: string; outline: string[]; tips: string[] } | null>(null);
  const [copiedSop, setCopiedSop] = useState(false);
  const [savedToApp, setSavedToApp] = useState(false);

  // Essay Reviewer State
  const [essayInput, setEssayInput] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Run AI Rejection Diagnostic
  const handleRunDiagnostic = async () => {
    setLoadingDiagnostic(true);
    try {
      const response = await apiFetch('/api/ai/diagnose-fit', {
        method: 'POST',
        body: JSON.stringify({
          profile: userProfile,
          scholarship: currentScholarship,
        }),
      });
      const data = await response.json();
      setDiagnosticResult(data);
    } catch (e) {
      console.error('Failed to run diagnostic', e);
    } finally {
      setLoadingDiagnostic(false);
    }
  };

  // Run AI SOP Drafter
  const handleGenerateSop = async () => {
    setLoadingSop(true);
    setSavedToApp(false);
    try {
      const response = await apiFetch('/api/ai/draft-sop', {
        method: 'POST',
        body: JSON.stringify({
          profile: userProfile,
          scholarship: currentScholarship,
          customNotes: sopCustomNotes,
          tone: sopTone,
        }),
      });
      const data = await response.json();
      setSopResult(data);
    } catch (e) {
      console.error('Failed to draft SOP', e);
    } finally {
      setLoadingSop(false);
    }
  };

  // Run AI Essay Reviewer
  const handleReviewEssay = async () => {
    if (!essayInput.trim() || essayInput.trim().length < 50) return;
    setLoadingReview(true);
    try {
      const response = await apiFetch('/api/ai/review-essay', {
        method: 'POST',
        body: JSON.stringify({
          essayText: essayInput,
          scholarshipTitle: currentScholarship.title,
          scholarshipRequirements: currentScholarship.keyRequirements,
        }),
      });
      const data = await response.json();
      setReviewResult(data);
    } catch (e) {
      console.error('Failed to review essay', e);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSop(true);
    setTimeout(() => setCopiedSop(false), 2000);
  };

  const handleSaveToApplication = () => {
    if (sopResult?.letterDraft && onSaveLetterToApp) {
      onSaveLetterToApp(currentScholarship.id, sopResult.letterDraft);
      setSavedToApp(true);
      setTimeout(() => setSavedToApp(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-850 dark:from-[#181822] dark:to-[#121217] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden border border-stone-800 dark:border-[#282834]">
        <div className="max-w-3xl relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 dark:bg-[#C5A267]/20 dark:text-[#E5C38F] border border-amber-500/30 dark:border-[#C5A267]/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-[#C5A267]" />
            <span>AI Rejection Prevention & Application Copilot</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-heading text-stone-100 dark:text-[#F4F4F5]">
            Why Applicants Fail & How to Win
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 dark:text-[#A1A1AA] leading-relaxed">
            Most scholarship candidates get rejected not because they lack talent, but because they fail to align with the committee's specific strategic mandate. Use our AI intelligence engine to diagnose your blind spots and generate winning essays.
          </p>
        </div>
      </div>

      {/* Target Scholarship Selection Header */}
      <div className="bg-white dark:bg-[#121217] p-4 rounded-2xl border border-stone-200 dark:border-[#24242E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-600 dark:text-[#C5A267] shrink-0" />
          <span className="text-xs font-bold text-stone-800 dark:text-[#D1D1D6]">
            Target Scholarship:
          </span>
        </div>

        <select
          value={currentScholarship.id}
          onChange={e => {
            const found = scholarships.find(s => s.id === e.target.value);
            if (found) {
              setCurrentScholarship(found);
              setDiagnosticResult(null);
              setSopResult(null);
            }
          }}
          className="flex-1 max-w-md px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
        >
          {scholarships.map(s => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.hostCountry})
            </option>
          ))}
        </select>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-[#22222A] pb-3">
        <button
          onClick={() => setActiveSubTab('diagnostic')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'diagnostic'
              ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] shadow-xs'
              : 'bg-white dark:bg-[#121217] text-stone-600 dark:text-[#8E8E93] border border-stone-200 dark:border-[#24242E] hover:border-[#C5A267]/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-[#E5C38F]" />
          <span>1. Rejection Diagnostic & Turnaround</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sop_drafter')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'sop_drafter'
              ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] shadow-xs'
              : 'bg-white dark:bg-[#121217] text-stone-600 dark:text-[#8E8E93] border border-stone-200 dark:border-[#24242E] hover:border-[#C5A267]/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Motivation Letter / SOP Drafter</span>
        </button>

        <button
          onClick={() => setActiveSubTab('essay_reviewer')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'essay_reviewer'
              ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] shadow-xs'
              : 'bg-white dark:bg-[#121217] text-stone-600 dark:text-[#8E8E93] border border-stone-200 dark:border-[#24242E] hover:border-[#C5A267]/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-[#C5A267]" />
          <span>3. Essay Reviewer & Scoring</span>
        </button>
      </div>

      {/* SUB-TAB 1: REJECTION DIAGNOSTIC & STRATEGY */}
      {activeSubTab === 'diagnostic' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                  Profile vs. Committee Expectation Diagnostic
                </h3>
                <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
                  Analyzing: <strong className="text-stone-800 dark:text-[#D4B37F]">{userProfile.name}</strong> ({userProfile.gpa.toFixed(2)} GPA, {userProfile.fieldOfStudy}) applying to <strong className="text-stone-800 dark:text-[#D4B37F]">{currentScholarship.title}</strong>
                </p>
              </div>

              <button
                onClick={handleRunDiagnostic}
                disabled={loadingDiagnostic}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 dark:bg-[#C5A267] dark:hover:bg-[#D4B37F] text-stone-950 dark:text-[#0A0A0B] transition shadow-xs disabled:opacity-50"
              >
                {loadingDiagnostic ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Selection Criteria...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Rejection Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Static Committee Rules (Always visible immediately) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/10 border border-amber-500/30 dark:border-[#C5A267]/25">
                <h4 className="text-xs font-bold text-amber-900 dark:text-[#E5C38F] uppercase tracking-wider mb-2 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-[#C5A267]" />
                  Known Pitfalls for {currentScholarship.title}
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-700 dark:text-[#D1D1D6]">
                  {currentScholarship.rejectionPitfalls.map((p, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-600 dark:text-[#C5A267] font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/25">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center">
                  <Lightbulb className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                  What the Committee Wants to See
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-700 dark:text-[#D1D1D6]">
                  {currentScholarship.insiderTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Output */}
          {diagnosticResult && (
            <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
              
              {/* Committee Perspective Banner */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-[#181820] border border-stone-200 dark:border-[#282834]">
                <h4 className="text-xs font-bold text-stone-900 dark:text-[#F4F4F5] uppercase tracking-wider mb-1">
                  Admissions Committee Perspective
                </h4>
                <p className="text-xs text-stone-700 dark:text-[#D1D1D6] leading-relaxed italic">
                  "{diagnosticResult.committeePerspective}"
                </p>
              </div>

              {/* Specific Risks & Pitfalls */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  Specific Rejection Risks for Your Profile
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {diagnosticResult.rejectionRisks.map((risk: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-stone-800 dark:text-[#D1D1D6] flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Your 4-Step Turnaround Action Plan
                </h4>
                <div className="space-y-2">
                  {diagnosticResult.actionPlan.map((step: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-stone-800 dark:text-[#D1D1D6] flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Custom Tasks */}
              {diagnosticResult.suggestedChecklist && (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200 dark:border-[#24242E] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#F4F4F5]">
                    Recommended Milestone Checklist Items
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-[#D1D1D6]">
                    {diagnosticResult.suggestedChecklist.map((task: string, i: number) => (
                      <li key={i} className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MOTIVATION LETTER / SOP DRAFTER */}
      {activeSubTab === 'sop_drafter' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
              Tailored Statement of Purpose / Motivation Drafter
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
              Generates an authentic narrative linking your specific GPA ({userProfile.gpa.toFixed(2)}), field ({userProfile.fieldOfStudy}), and experience to {currentScholarship.title}'s exact selection criteria.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                  Essay Tone & Framing
                </label>
                <select
                  value={sopTone}
                  onChange={e => setSopTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
                >
                  <option value="persuasive_academic">Academic Rigor & Persuasive (Balanced)</option>
                  <option value="leadership_impact">Leadership, Policy & Social Impact (Chevening/Fulbright style)</option>
                  <option value="technical_research">Laboratory & Research Proposal Focused (DAAD/MEXT/SINGA style)</option>
                  <option value="community_resilience">Overcoming Adversity & Community Give-back (Mastercard style)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                  Key Projects, Professors, or Courses to Mention (Optional)
                </label>
                <input
                  type="text"
                  value={sopCustomNotes}
                  onChange={e => setSopCustomNotes(e.target.value)}
                  placeholder="e.g. Led community clean water IoT project; Want to work with Prof. Miller"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateSop}
                disabled={loadingSop}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90 dark:hover:bg-[#D4B37F] transition disabled:opacity-50 shadow-xs"
              >
                {loadingSop ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Drafting Custom Motivation Letter...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400 dark:text-[#0A0A0B]" />
                    <span>Generate Statement Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Letter Output */}
          {sopResult && (
            <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 space-y-5 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-[#22222A] pb-4">
                <div>
                  <h4 className="text-sm font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                    Draft Motivation Letter for {currentScholarship.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
                    Customized for {userProfile.name} • {sopTone.replace('_', ' ')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyText(sopResult.letterDraft)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-200 dark:hover:bg-[#22222C] border dark:border-[#282834] transition"
                  >
                    {copiedSop ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-600 dark:text-[#C5A267]" />}
                    <span>{copiedSop ? 'Copied!' : 'Copy Draft'}</span>
                  </button>

                  <button
                    onClick={handleSaveToApplication}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{savedToApp ? 'Saved to Tracker ✓' : 'Save to App Notes'}</span>
                  </button>
                </div>
              </div>

              {/* Letter Text */}
              <div className="p-5 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200 dark:border-[#24242E] font-serif text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-[#D1D1D6] whitespace-pre-wrap">
                {sopResult.letterDraft}
              </div>

              {/* Narrative Outline & Custom Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-100 dark:bg-[#181820]/90 border dark:border-[#24242E]">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-[#F4F4F5] uppercase tracking-wider mb-2">
                    Narrative Structure Used
                  </h5>
                  <ul className="space-y-1 text-xs text-stone-600 dark:text-[#8E8E93]">
                    {sopResult.outline.map((item, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="font-bold text-stone-800 dark:text-[#D4B37F]">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/10 border border-amber-500/20 dark:border-[#C5A267]/25">
                  <h5 className="text-xs font-bold text-amber-900 dark:text-[#E5C38F] uppercase tracking-wider mb-2">
                    Personalization Advice
                  </h5>
                  <ul className="space-y-1 text-xs text-stone-700 dark:text-[#D1D1D6]">
                    {sopResult.tips.map((tip, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-600 dark:text-[#C5A267] font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: ESSAY REVIEWER & CRITIQUE */}
      {activeSubTab === 'essay_reviewer' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
              AI Scholarship Essay Reviewer & Score Analyzer
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
              Paste your personal statement or motivation letter draft below to receive constructive grading against {currentScholarship.title}'s criteria.
            </p>

            <div>
              <textarea
                rows={8}
                value={essayInput}
                onChange={e => setEssayInput(e.target.value)}
                placeholder="Paste your draft essay here (minimum 50 characters)..."
                className="w-full p-4 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
              <div className="flex justify-between items-center text-xs text-stone-400 dark:text-[#71717A] mt-1">
                <span>{essayInput.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>Requires min 50 characters</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleReviewEssay}
                disabled={loadingReview || essayInput.trim().length < 50}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90 dark:hover:bg-[#D4B37F] transition disabled:opacity-50 shadow-xs"
              >
                {loadingReview ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Critiquing Essay with Committee Standards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-400 dark:text-[#0A0A0B]" />
                    <span>Critique & Score Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Essay Review Output */}
          {reviewResult && (
            <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
              
              {/* Score Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#181820] border dark:border-[#262632] text-center">
                  <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] uppercase font-semibold block">Overall Quality</span>
                  <span className="text-xl font-bold font-mono text-stone-900 dark:text-[#F4F4F5]">
                    {reviewResult.overallScore}/100
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#181820] border dark:border-[#262632] text-center">
                  <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] uppercase font-semibold block">Clarity & Flow</span>
                  <span className="text-xl font-bold font-mono text-blue-600 dark:text-[#93B5FF]">
                    {reviewResult.clarityScore}/100
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#181820] border dark:border-[#262632] text-center">
                  <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] uppercase font-semibold block">Scholarship Alignment</span>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-[#C5A267]">
                    {reviewResult.alignmentScore}/100
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#181820] border dark:border-[#262632] text-center">
                  <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] uppercase font-semibold block">Quantifiable Impact</span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {reviewResult.impactScore}/100
                  </span>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200 dark:border-[#24242E]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#F4F4F5] mb-1">
                  Evaluator Summary
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-[#D1D1D6] leading-relaxed">
                  {reviewResult.summary}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/25 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Key Strengths
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-[#D1D1D6]">
                    {reviewResult.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/10 border border-amber-500/20 dark:border-[#C5A267]/25 space-y-2">
                  <h5 className="text-xs font-bold text-amber-900 dark:text-[#E5C38F] uppercase tracking-wider flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-[#C5A267]" />
                    Weaknesses / Risks
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-[#D1D1D6]">
                    {reviewResult.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-600 dark:text-[#C5A267] font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Specific Suggested Edits */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#F4F4F5]">
                  Targeted Revision Recommendations
                </h4>
                <div className="space-y-2">
                  {reviewResult.suggestedEdits.map((edit: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-stone-50 dark:bg-[#181820] border border-stone-200 dark:border-[#24242E] text-xs text-stone-800 dark:text-[#D1D1D6] flex items-start space-x-2.5">
                      <span className="w-4 h-4 rounded-full bg-stone-300 dark:bg-[#282836] text-stone-900 dark:text-[#D4B37F] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{edit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
