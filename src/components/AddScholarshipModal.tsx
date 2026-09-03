import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Globe, 
  DollarSign, 
  Calendar, 
  Mail, 
  ExternalLink,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Scholarship, DegreeLevel, FieldOfStudy, FundingType } from '../types';

interface AddScholarshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScholarship: (scholarship: Scholarship) => Promise<{ id?: string; error?: string }>;
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

export const AddScholarshipModal: React.FC<AddScholarshipModalProps> = ({
  isOpen,
  onClose,
  onAddScholarship,
}) => {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [hostCountry, setHostCountry] = useState('');
  const [selectedDegrees, setSelectedDegrees] = useState<DegreeLevel[]>(['Master / Postgraduate']);
  const [selectedFields, setSelectedFields] = useState<FieldOfStudy[]>(['All / Any Field']);
  const [fundingType, setFundingType] = useState<FundingType>('Fully Funded');
  const [stipendAmount, setStipendAmount] = useState('$1,200 / month');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [summary, setSummary] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [email, setEmail] = useState('');
  const [rejectionPitfall, setRejectionPitfall] = useState('');
  const [minGpa, setMinGpa] = useState<number>(3.2);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const toggleDegree = (degree: DegreeLevel) => {
    if (selectedDegrees.includes(degree)) {
      if (selectedDegrees.length > 1) {
        setSelectedDegrees(selectedDegrees.filter(d => d !== degree));
      }
    } else {
      setSelectedDegrees([...selectedDegrees, degree]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !provider.trim() || !hostCountry.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const newScholarship: Scholarship = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      provider: provider.trim(),
      hostCountry: hostCountry.trim(),
      degreeLevels: selectedDegrees,
      fieldsOfStudy: selectedFields,
      fundingType,
      financialCoverage: {
        tuition: true,
        livingStipend: fundingType === 'Fully Funded',
        stipendAmount: stipendAmount || undefined,
        airfare: fundingType === 'Fully Funded',
        healthInsurance: true,
        visaFees: false,
      },
      deadline: deadline || '2026-12-31',
      deadlineStatus: 'open',
      summary: summary.trim() || 'Custom added scholarship program.',
      keyRequirements: [
        'Complete academic transcript and degree certificate',
        'Statement of purpose / motivation letter',
        '2 Letters of recommendation',
        'Valid passport and proof of nationality'
      ],
      eligibilityCriteria: {
        minGpa,
        targetNationalities: ['All Eligible Candidates'],
      },
      rejectionPitfalls: [
        rejectionPitfall.trim() || 'Submitting a generic application without clear department and host country alignment.'
      ],
      insiderTips: [
        'Contact the department coordinator before submitting.',
        'Ensure all translated documents are officially certified.'
      ],
      officialApplicationUrl: officialUrl.trim() || undefined,
      contacts: {
        email: email.trim() || undefined,
        notes: 'Direct applicant-submitted contact info.',
      },
      defaultChecklist: [
        { title: 'Gather certified academic transcripts', category: 'document' },
        { title: 'Draft tailored Statement of Purpose', category: 'essay' },
        { title: 'Request 2 recommendation letters', category: 'recommendation' },
        { title: 'Submit online dossier or embassy package', category: 'submission' }
      ],
      isCustom: true,
    };

    const result = await onAddScholarship(newScholarship);
    setSaving(false);
    if (result?.error) {
      setSaveError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="add-scholarship-dialog"
        className="bg-white dark:bg-[#121217] rounded-2xl shadow-xl border border-stone-200 dark:border-[#24242E] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 border-b border-stone-200 dark:border-[#22222A] flex items-center justify-between bg-stone-50/50 dark:bg-[#0E0E12]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#181820] border dark:border-[#282834] flex items-center justify-center text-stone-800 dark:text-[#C5A267]">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">
                Add Custom Scholarship / Grant
              </h2>
              <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
                Save your own university grants or regional awards locally.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-[#F4F4F5] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Scholarship / Program Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Oxford Clarendon Fund"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Provider / University *
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={e => setProvider(e.target.value)}
                placeholder="e.g. University of Oxford"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Host Country *
              </label>
              <input
                type="text"
                required
                value={hostCountry}
                onChange={e => setHostCountry(e.target.value)}
                placeholder="e.g. United Kingdom"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Funding Type
              </label>
              <select
                value={fundingType}
                onChange={e => setFundingType(e.target.value as FundingType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              >
                <option value="Fully Funded">Fully Funded</option>
                <option value="Partial Tuition">Partial Tuition</option>
                <option value="Tuition Only">Tuition Only</option>
                <option value="Research Grant">Research Grant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
              Degree Levels (Click to select)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEGREE_OPTIONS.map(deg => (
                <button
                  type="button"
                  key={deg}
                  onClick={() => toggleDegree(deg)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition ${
                    selectedDegrees.includes(deg)
                      ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] font-semibold'
                      : 'bg-stone-100 dark:bg-[#181820] text-stone-600 dark:text-[#8E8E93] border dark:border-[#262632]'
                  }`}
                >
                  {deg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Official Application Portal URL
              </label>
              <input
                type="url"
                value={officialUrl}
                onChange={e => setOfficialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
                Contact / Coordinator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="scholarships@university.edu"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1">
              Short Summary & Purpose
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief description of the scholarship, target candidates, and benefits..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-700 dark:text-[#E5C38F] mb-1">
              Known Rejection Pitfall / Reason Candidates Fail
            </label>
            <input
              type="text"
              value={rejectionPitfall}
              onChange={e => setRejectionPitfall(e.target.value)}
              placeholder="e.g. Late referee submissions or applying without preliminary department supervisor endorsement"
              className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 dark:border-[#C5A267]/40 bg-amber-500/5 dark:bg-[#C5A267]/10 text-stone-900 dark:text-[#F4F4F5] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-stone-200 dark:border-[#22222A]">
            {saveError && (
              <div className="mr-auto flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="w-4 h-4" />
                {saveError}
              </div>
            )}
            {saved && (
              <div className="mr-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Saved to your account.
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-[#8E8E93] hover:bg-stone-100 dark:hover:bg-[#1A1A22] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || saved}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90 dark:hover:bg-[#D4B37F] transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Add Scholarship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
