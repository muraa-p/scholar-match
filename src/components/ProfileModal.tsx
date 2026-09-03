import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Globe, 
  Award, 
  Briefcase, 
  Languages, 
  DollarSign, 
  AlertTriangle, 
  Save, 
  X,
  Sparkles,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { UserProfile, DegreeLevel, FieldOfStudy } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  isOnboarding?: boolean;
}
const DEGREE_OPTIONS: DegreeLevel[] = [
  'High School / Pre-U',
  'Bachelor / Undergraduate',
  'Master / Postgraduate',
  'PhD / Doctorate',
  'Postdoc / Fellowship',
  'Short Course / Summer School'
];

const FIELD_OPTIONS: FieldOfStudy[] = [
  'All / Any Field',
  'STEM & Computer Science',
  'Business, Finance & Economics',
  'Medicine & Healthcare',
  'Social Sciences, Public Policy & Law',
  'Arts & Humanities',
  'Environment & Agriculture'
];

const COUNTRIES_LIST = [
  'United Kingdom',
  'United States',
  'Germany',
  'Canada',
  'Australia',
  'Japan',
  'South Korea',
  'Singapore',
  'Switzerland',
  'France',
  'Netherlands',
  'Sweden',
  'Turkey',
  'Worldwide'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isOnboarding = false,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [customCountry, setCustomCountry] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync formData with profile prop when modal opens (not on every render)
  const prevOpenRef = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setFormData({ ...profile });
      setSavedSuccess(false);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, profile]);

  const toggleTargetCountry = (country: string) => {
    const current = formData.targetCountries || [];
    if (current.includes(country)) {
      setFormData({
        ...formData,
        targetCountries: current.filter(c => c !== country)
      });
    } else {
      setFormData({
        ...formData,
        targetCountries: [...current, country]
      });
    }
  };

  const handleAddCustomCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCountry.trim()) return;
    if (!formData.targetCountries.includes(customCountry.trim())) {
      setFormData({
        ...formData,
        targetCountries: [...formData.targetCountries, customCountry.trim()]
      });
    }
    setCustomCountry('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      style={{ visibility: isOpen ? 'visible' : 'hidden', pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div 
        id="profile-edit-dialog"
        className="bg-white dark:bg-[#121217] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-[#24242E] w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 dark:border-[#22222A] flex items-center justify-between bg-stone-50/70 dark:bg-[#0E0E12] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 dark:bg-[#1C1C26] border border-stone-800 dark:border-[#C5A267]/40 flex items-center justify-center text-amber-400 dark:text-[#C5A267]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                {isOnboarding ? 'Welcome! Set Up Your Profile' : 'Edit Academic Profile'}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-[#8E8E93]">
                {isOnboarding
                  ? 'Tell us about your academic background so we can match you with the best scholarships.'
                  : 'Your qualifications dynamically rank and match all global scholarships.'}
              </p>
            </div>
          </div>
          {!isOnboarding && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-[#F4F4F5] p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-[#181820] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Profile Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-stone-800 dark:text-[#D1D1D6]">
          {/* Info Callout */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-stone-100 dark:bg-[#161620] border border-stone-200 dark:border-[#262634] text-xs text-stone-600 dark:text-[#A1A1AA] flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-[#C5A267] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900 dark:text-[#F4F4F5]">Profile & Matching Info: </span>
              All credentials you save here (degree, field, GPA, nationality) instantly update match scores across all opportunities. Data persists safely in your local browser storage.
            </div>
          </div>

          {/* Basic Info (Name & Nationality) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Full Name / Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
                placeholder="e.g. Alex Zhang"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Nationality / Country of Citizenship
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
                placeholder="e.g. Kenya, India, Brazil, Pakistan, Philippines"
                required
              />
            </div>
          </div>

          {/* Academic Level & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Highest Completed Degree
              </label>
              <select
                value={formData.currentDegree}
                onChange={e => setFormData({ ...formData, currentDegree: e.target.value as DegreeLevel })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
              >
                {DEGREE_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Target Degree Seeking Scholarship For
              </label>
              <select
                value={formData.targetDegree}
                onChange={e => setFormData({ ...formData, targetDegree: e.target.value as DegreeLevel })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
              >
                {DEGREE_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Field of Study & GPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Field of Study / Discipline
              </label>
              <select
                value={formData.fieldOfStudy}
                onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value as FieldOfStudy })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
              >
                {FIELD_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-[#D1D1D6]">
                  Cumulative GPA (4.0 Scale)
                </label>
                <span className="text-sm font-mono font-bold text-amber-700 dark:text-[#D4B37F] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  {formData.gpa.toFixed(2)} / 4.00
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="4.0"
                step="0.05"
                value={formData.gpa}
                onChange={e => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                className="w-full accent-stone-900 dark:accent-[#C5A267] h-2 bg-stone-200 dark:bg-[#282834] rounded-lg cursor-pointer my-2"
              />
              <div className="flex justify-between text-[11px] text-stone-500 dark:text-[#71717A]">
                <span>2.0 (Passing)</span>
                <span>3.0 (Good)</span>
                <span>3.5 (Honours)</span>
                <span>4.0 (Top)</span>
              </div>
            </div>
          </div>

          {/* Work Experience & English Proficiency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Work / Research Experience
              </label>
              <select
                value={formData.workExperienceYears}
                onChange={e => setFormData({ ...formData, workExperienceYears: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
              >
                <option value={0}>None / Student</option>
                <option value={1}>Less than 1 year</option>
                <option value={2}>1–2 years</option>
                <option value={3}>2–3 years</option>
                <option value={5}>3–5 years</option>
                <option value={8}>5–8 years</option>
                <option value={10}>8+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                English Language Status
              </label>
              <select
                value={formData.englishProficiency}
                onChange={e => setFormData({ ...formData, englishProficiency: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267] min-h-[44px]"
              >
                <option value="native">Native Speaker / Medium of Instruction was English</option>
                <option value="ielts_toefl_ready">IELTS / TOEFL score ready</option>
                <option value="planning_to_take">Planning to take test</option>
                <option value="none">Not planned yet</option>
              </select>
              {formData.englishProficiency === 'ielts_toefl_ready' && (
                <input
                  type="text"
                  value={formData.ieltsScore || ''}
                  onChange={e => setFormData({ ...formData, ieltsScore: e.target.value })}
                  placeholder="e.g. IELTS 7.5 or TOEFL 105"
                  className="mt-2 w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] min-h-[40px]"
                />
              )}
            </div>
          </div>

          {/* Funding Priority */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
              Funding Requirement Priority
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs cursor-pointer transition min-h-[44px] ${
                formData.fundingNeed === 'full_only'
                  ? 'border-stone-900 bg-stone-100 dark:border-[#C5A267] dark:bg-[#1C1A14] text-stone-900 dark:text-[#E5C38F] font-semibold'
                  : 'border-stone-200 dark:border-[#24242E] text-stone-600 dark:text-[#8E8E93]'
              }`}>
                <input
                  type="radio"
                  name="fundingNeed"
                  checked={formData.fundingNeed === 'full_only'}
                  onChange={() => setFormData({ ...formData, fundingNeed: 'full_only' })}
                  className="accent-stone-900 dark:accent-[#C5A267]"
                />
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-[#C5A267]" />
                <span>Fully Funded Only (Tuition + Living Stipend)</span>
              </label>

              <label className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs cursor-pointer transition min-h-[44px] ${
                formData.fundingNeed === 'partial_ok'
                  ? 'border-stone-900 bg-stone-100 dark:border-[#C5A267] dark:bg-[#1C1A14] text-stone-900 dark:text-[#E5C38F] font-semibold'
                  : 'border-stone-200 dark:border-[#24242E] text-stone-600 dark:text-[#8E8E93]'
              }`}>
                <input
                  type="radio"
                  name="fundingNeed"
                  checked={formData.fundingNeed === 'partial_ok'}
                  onChange={() => setFormData({ ...formData, fundingNeed: 'partial_ok' })}
                  className="accent-stone-900 dark:accent-[#C5A267]"
                />
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-[#93B5FF]" />
                <span>Partial / Tuition Waivers Acceptable</span>
              </label>
            </div>
          </div>

          {/* Target Host Countries */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
              Target Destination Countries (Tap to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES_LIST.map(country => {
                const isSelected = formData.targetCountries?.includes(country);
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleTargetCountry(country)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition min-h-[36px] ${
                      isSelected
                        ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] font-semibold shadow-xs'
                        : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] hover:bg-stone-200 dark:hover:bg-[#22222C] border border-stone-200/60 dark:border-[#262632]'
                    }`}
                  >
                    {country}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Previous Rejection Experience */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-[#C5A267]/10 border border-amber-500/30 dark:border-[#C5A267]/30">
            <div className="flex items-center space-x-1.5 text-amber-800 dark:text-[#E5C38F] text-xs font-semibold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#C5A267]" />
              <span>Past Application Rejection History (Optional)</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-[#8E8E93] mb-2">
              Share previous challenges (e.g. generic SOP, missing reference, deadline miss). The AI diagnostics feature uses this to highlight key pitfalls to avoid.
            </p>
            <textarea
              rows={2}
              value={formData.previousRejectionsDescription || ''}
              onChange={e => setFormData({ ...formData, previousRejectionsDescription: e.target.value })}
              placeholder="e.g. Applied to Chevening and DAAD last year; got rejected at document stage due to lack of leadership examples in essays."
              className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300/50 dark:border-[#C5A267]/40 bg-white dark:bg-[#121217] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
            />
          </div>

          {/* Action Buttons - Fixed at bottom of modal */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-stone-200 dark:border-[#22222A]">
            {!isOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-[#8E8E93] hover:bg-stone-100 dark:hover:bg-[#1A1A22] transition min-h-[44px]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-95 dark:hover:bg-[#D4B37F] transition shadow-xs min-h-[44px]"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isOnboarding ? 'Save & Start Exploring' : 'Save Profile & Update Matches'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
