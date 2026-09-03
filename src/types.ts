export type DegreeLevel = 
  | 'High School / Pre-U'
  | 'Bachelor / Undergraduate'
  | 'Master / Postgraduate'
  | 'PhD / Doctorate'
  | 'Postdoc / Fellowship'
  | 'Short Course / Summer School';

export type FieldOfStudy = 
  | 'All / Any Field'
  | 'STEM & Computer Science'
  | 'Business, Finance & Economics'
  | 'Medicine & Healthcare'
  | 'Social Sciences, Public Policy & Law'
  | 'Arts & Humanities'
  | 'Environment & Agriculture';

export type FundingType = 'Fully Funded' | 'Partial Tuition' | 'Tuition Only' | 'Stipend Only' | 'Research Grant';

export type ApplicationStatus = 
  | 'considering'
  | 'preparing'
  | 'applied'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'archived';

export interface ContactInfo {
  email?: string;
  phone?: string;
  inquiryFormUrl?: string;
  departmentOrPerson?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'document' | 'test' | 'recommendation' | 'essay' | 'submission' | 'custom';
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  university?: string;
  hostCountry: string;
  degreeLevels: DegreeLevel[];
  fieldsOfStudy: FieldOfStudy[];
  fundingType: FundingType;
  financialCoverage: {
    tuition: boolean;
    livingStipend: boolean;
    stipendAmount?: string;
    airfare: boolean;
    healthInsurance: boolean;
    visaFees: boolean;
    otherBenefits?: string[];
  };
  deadline: string; // YYYY-MM-DD or descriptive
  deadlineStatus: 'open' | 'upcoming' | 'closing_soon' | 'closed';
  summary: string;
  keyRequirements: string[];
  eligibilityCriteria: {
    minGpa?: number; // on 4.0 scale
    targetNationalities: string[]; // e.g. ["Developing Countries", "All", "African Nations", "EU"]
    minWorkExperienceYears?: number;
    languageRequirement?: string;
    ageLimit?: string;
    returnHomeClause?: boolean;
  };
  rejectionPitfalls: string[]; // Common reasons why candidates get rejected for this award
  insiderTips: string[];
  officialApplicationUrl?: string;
  contacts: ContactInfo;
  defaultChecklist: Omit<ChecklistItem, 'id' | 'completed'>[];
  isCustom?: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  nationality: string;
  currentDegree: DegreeLevel;
  targetDegree: DegreeLevel;
  gpa: number; // Scale of 4.0
  fieldOfStudy: FieldOfStudy;
  targetCountries: string[];
  workExperienceYears: number;
  englishProficiency: 'native' | 'ielts_toefl_ready' | 'planning_to_take' | 'none';
  ieltsScore?: string;
  fundingNeed: 'full_only' | 'partial_ok';
  previousRejectionsDescription?: string;
  targetYear: string;
  onboardingCompleted?: boolean;
}

export interface TrackedApplication {
  id: string;
  scholarshipId: string;
  customTitle?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  deadline?: string;
  portalUrl?: string;
  checklist: ChecklistItem[];
  personalNotes?: string;
  communicationLog: {
    id: string;
    date: string;
    recipient: string;
    topic: string;
    notes: string;
    replied: boolean;
  }[];
  draftMotivationLetter?: string;
  aiAnalysisResult?: {
    matchScore: number;
    rejectionRisks: string[];
    actionPlan: string[];
    strengths: string[];
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MatchScoreResult {
  score: number; // 0 - 100
  levelMatch: boolean;
  fieldMatch: boolean;
  gpaMatch: boolean;
  workExpMatch: boolean;
  countryMatch: boolean;
  fundingMatch: boolean;
  unmetCriteria: string[];
  fitHighlights: string[];
}
