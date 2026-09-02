import { 
  Scholarship, 
  TrackedApplication, 
  UserProfile, 
  ChecklistItem, 
  ApplicationStatus,
  DegreeLevel,
  FieldOfStudy,
  FundingType
} from '../types';
import { initialScholarships } from '../data/scholarshipsData';
import { calculateMatchScore } from './matchingEngine';

// Storage Keys
const PROFILE_KEY = 'scholarmatch_user_profile_v2';
const APPLICATIONS_KEY = 'scholarmatch_applications_v2';
const SAVED_KEY = 'scholarmatch_saved_ids_v2';
const CHECKLISTS_KEY = 'scholarmatch_dynamic_checklists_v2';
const CUSTOM_SCHOLARSHIPS_KEY = 'scholarmatch_custom_scholarships_v2';
const AI_SUMMARY_CACHE_KEY = 'scholarmatch_ai_summaries_v2';
const THEME_KEY = 'scholarmatch_theme_mode_v2';
const RECENT_SEARCHES_KEY = 'scholarmatch_recent_searches_v2';
const MAX_RECENT_SEARCHES = 3;

// In-Memory Query Cache with LRU & TTL (Optimization for Free-Tier Execution)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Inverted Search Index for 0ms Full-Text Lookups
class ScholarshipSearchIndex {
  private invertedIndex = new Map<string, Set<string>>();
  private allScholarships: Scholarship[] = [];

  public buildIndex(scholarships: Scholarship[]) {
    this.allScholarships = scholarships;
    this.invertedIndex.clear();

    for (const s of scholarships) {
      const tokens = this.tokenize(`${s.title} ${s.provider} ${s.hostCountry} ${s.fundingType} ${s.degreeLevels.join(' ')} ${s.fieldsOfStudy.join(' ')} ${s.keyRequirements.join(' ')} ${s.summary}`);
      for (const token of tokens) {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, new Set<string>());
        }
        this.invertedIndex.get(token)!.add(s.id);
      }
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  public search(query: string): Set<string> | null {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return null;

    let resultIds: Set<string> | null = null;
    for (const token of tokens) {
      const matches = new Set<string>();
      for (const [indexedWord, idSet] of this.invertedIndex.entries()) {
        if (indexedWord.includes(token)) {
          idSet.forEach(id => matches.add(id));
        }
      }

      if (resultIds === null) {
        resultIds = matches;
      } else {
        // Intersection
        resultIds = new Set([...resultIds].filter(id => matches.has(id)));
      }
    }
    return resultIds;
  }
}

const searchIndex = new ScholarshipSearchIndex();

// Default User Profile
export const defaultUserProfile: UserProfile = {
  name: 'Scholar Applicant',
  nationality: 'International',
  currentDegree: 'Bachelor / Undergraduate',
  targetDegree: 'Master / Postgraduate',
  gpa: 3.6,
  fieldOfStudy: 'STEM & Computer Science',
  targetCountries: ['United Kingdom', 'United States', 'Germany', 'Japan', 'Australia'],
  workExperienceYears: 2,
  englishProficiency: 'ielts_toefl_ready',
  ieltsScore: '7.5',
  fundingNeed: 'full_only',
  targetYear: '2026/2027',
};

// Database Initialization
export function initScholarshipDatabase() {
  const all = getRawScholarships();
  searchIndex.buildIndex(all);
}

// 1. Raw Scholarship Data
// Module-level override so the app can supply scholarships fetched from the
// database while keeping all matching/search logic (which reads this) intact.
let externalScholarships: Scholarship[] | undefined;

export function setExternalScholarships(list: Scholarship[] | undefined) {
  externalScholarships = list;
  queryCache.clear();
  initScholarshipDatabase();
}

export function getRawScholarships(): Scholarship[] {
  try {
    if (externalScholarships && externalScholarships.length > 0) {
      return externalScholarships;
    }
    const customRaw = localStorage.getItem(CUSTOM_SCHOLARSHIPS_KEY);
    const custom: Scholarship[] = customRaw ? JSON.parse(customRaw) : [];
    return [...initialScholarships, ...custom];
  } catch (e) {
    return initialScholarships;
  }
}

export function saveCustomScholarship(scholarship: Scholarship): void {
  try {
    const customRaw = localStorage.getItem(CUSTOM_SCHOLARSHIPS_KEY);
    const custom: Scholarship[] = customRaw ? JSON.parse(customRaw) : [];
    custom.unshift(scholarship);
    localStorage.setItem(CUSTOM_SCHOLARSHIPS_KEY, JSON.stringify(custom));
    queryCache.clear(); // invalidate cache
    initScholarshipDatabase();
  } catch (e) {
    console.error('Failed to save custom scholarship', e);
  }
}

// 2. User Profile Storage
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultUserProfile;
    return { ...defaultUserProfile, ...JSON.parse(raw) };
  } catch {
    return defaultUserProfile;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    queryCache.clear(); // invalidate match scores in cache
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

// 3. Saved / Bookmarked Scholarships
export function loadSavedScholarshipIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveScholarship(scholarshipId: string): boolean {
  try {
    const saved = new Set(loadSavedScholarshipIds());
    let isNowSaved = false;
    if (saved.has(scholarshipId)) {
      saved.delete(scholarshipId);
      isNowSaved = false;
    } else {
      saved.add(scholarshipId);
      isNowSaved = true;
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    return isNowSaved;
  } catch {
    return false;
  }
}

// 4. Dynamic Checklist Database (Tied specifically to each scholarship's requirements)
export type DynamicChecklistMap = Record<string, ChecklistItem[]>;

export function loadAllDynamicChecklists(): DynamicChecklistMap {
  try {
    const raw = localStorage.getItem(CHECKLISTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getScholarshipChecklist(scholarship: Scholarship): ChecklistItem[] {
  const allChecklists = loadAllDynamicChecklists();
  
  if (allChecklists[scholarship.id] && allChecklists[scholarship.id].length > 0) {
    return allChecklists[scholarship.id];
  }

  // Initialize from default requirement checklist
  const generated: ChecklistItem[] = (scholarship.defaultChecklist || []).map((item, index) => ({
    id: `req-${scholarship.id}-${index}`,
    title: item.title,
    category: item.category || 'document',
    completed: false,
    notes: '',
  }));

  // If scholarship has no default checklist, synthesize from key requirements
  if (generated.length === 0 && scholarship.keyRequirements?.length > 0) {
    scholarship.keyRequirements.forEach((req, idx) => {
      generated.push({
        id: `req-${scholarship.id}-${idx}`,
        title: req,
        category: 'document',
        completed: false,
      });
    });
  }

  // Always ensure final portal submission item exists
  if (!generated.some(i => i.category === 'submission')) {
    generated.push({
      id: `req-${scholarship.id}-submit`,
      title: `Submit official application before deadline (${scholarship.deadline})`,
      category: 'submission',
      completed: false,
    });
  }

  return generated;
}

export function saveScholarshipChecklist(scholarshipId: string, checklist: ChecklistItem[]): void {
  try {
    const all = loadAllDynamicChecklists();
    all[scholarshipId] = checklist;
    localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(all));

    // Also sync to tracked application if present
    const apps = loadTrackedApplications();
    const targetApp = apps.find(a => a.scholarshipId === scholarshipId);
    if (targetApp) {
      targetApp.checklist = checklist;
      targetApp.updatedAt = new Date().toISOString();
      saveTrackedApplications(apps);
    }
  } catch (e) {
    console.error('Failed to save scholarship checklist', e);
  }
}

export function toggleChecklistItem(scholarshipId: string, itemId: string): ChecklistItem[] {
  const scholarships = getRawScholarships();
  const scholarship = scholarships.find(s => s.id === scholarshipId);
  if (!scholarship) return [];

  const current = getScholarshipChecklist(scholarship);
  const updated = current.map(item => 
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );
  saveScholarshipChecklist(scholarshipId, updated);
  return updated;
}

export function addChecklistItem(scholarshipId: string, item: Omit<ChecklistItem, 'id' | 'completed'>): ChecklistItem[] {
  const scholarships = getRawScholarships();
  const scholarship = scholarships.find(s => s.id === scholarshipId);
  if (!scholarship) return [];

  const current = getScholarshipChecklist(scholarship);
  const newItem: ChecklistItem = {
    id: `custom-${Date.now()}`,
    title: item.title,
    category: item.category || 'custom',
    completed: false,
    notes: item.notes || '',
    dueDate: item.dueDate,
  };
  const updated = [...current, newItem];
  saveScholarshipChecklist(scholarshipId, updated);
  return updated;
}

export function deleteChecklistItem(scholarshipId: string, itemId: string): ChecklistItem[] {
  const scholarships = getRawScholarships();
  const scholarship = scholarships.find(s => s.id === scholarshipId);
  if (!scholarship) return [];

  const current = getScholarshipChecklist(scholarship);
  const updated = current.filter(item => item.id !== itemId);
  saveScholarshipChecklist(scholarshipId, updated);
  return updated;
}

// 5. Tracked Applications Database
export function loadTrackedApplications(): TrackedApplication[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) {
      // Seed default active application for immediate out-of-the-box user experience
      const chevening = initialScholarships.find(s => s.id === 'chevening-uk');
      if (chevening) {
        const seedChecklist = getScholarshipChecklist(chevening);
        if (seedChecklist.length > 0) seedChecklist[0].completed = true; // 1 step done
        const seedApp: TrackedApplication = {
          id: 'app-seed-1',
          scholarshipId: chevening.id,
          status: 'preparing',
          deadline: chevening.deadline,
          portalUrl: chevening.officialApplicationUrl,
          checklist: seedChecklist,
          personalNotes: 'Focus on connecting software background with digital public infrastructure.',
          communicationLog: [
            {
              id: 'comm-1',
              date: '2026-08-20',
              recipient: 'chevening.enquiries@fco.gov.uk',
              topic: 'Work experience calculation for hybrid remote contracts',
              notes: 'Confirmed client invoices and contracts are accepted.',
              replied: true,
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveTrackedApplications([seedApp]);
        return [seedApp];
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTrackedApplications(apps: TrackedApplication[]): void {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save applications', e);
  }
}

export function trackScholarship(scholarship: Scholarship, initialStatus: ApplicationStatus = 'preparing'): TrackedApplication {
  const apps = loadTrackedApplications();
  const existing = apps.find(a => a.scholarshipId === scholarship.id);
  if (existing) return existing;

  const checklist = getScholarshipChecklist(scholarship);
  const newApp: TrackedApplication = {
    id: `app-${Date.now()}`,
    scholarshipId: scholarship.id,
    customTitle: scholarship.title,
    status: initialStatus,
    deadline: scholarship.deadline,
    portalUrl: scholarship.officialApplicationUrl,
    checklist,
    communicationLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  apps.unshift(newApp);
  saveTrackedApplications(apps);
  return newApp;
}

export function removeTrackedApplication(appId: string): void {
  const apps = loadTrackedApplications().filter(a => a.id !== appId);
  saveTrackedApplications(apps);
}

// 6. Selective Projected Data & Optimized Query Engine
export interface ScholarshipCardProjection {
  scholarship: Scholarship;
  matchScore: number;
  matchHighlights: string[];
  unmetCriteria: string[];
  totalChecklistCount: number;
  completedChecklistCount: number;
  progressPercent: number;
  isSaved: boolean;
  isTracked: boolean;
}

export interface QueryFilters {
  query?: string;
  degreeLevel?: string;
  hostCountry?: string;
  fundingType?: string;
  minMatchScore?: number;
  onlySaved?: boolean;
  onlyTracked?: boolean;
  sortBy?: 'match' | 'deadline' | 'title';
}

export function queryScholarships(
  filters: QueryFilters, 
  profile: UserProfile,
  savedIdsList?: string[],
  trackedAppsList?: TrackedApplication[]
): ScholarshipCardProjection[] {
  const all = getRawScholarships();
  const savedIds = new Set(savedIdsList || loadSavedScholarshipIds());
  const trackedApps = trackedAppsList || loadTrackedApplications();
  const trackedIds = new Set(trackedApps.map(a => a.scholarshipId));
  const dynamicChecklists = loadAllDynamicChecklists();

  // 1. Text Search using Inverted Index
  let matchedIds: Set<string> | null = null;
  if (filters.query && filters.query.trim().length > 0) {
    matchedIds = searchIndex.search(filters.query.trim());
  }

  let filtered = all.filter(s => {
    if (matchedIds !== null && !matchedIds.has(s.id)) return false;

    if (filters.degreeLevel && filters.degreeLevel !== 'all') {
      if (!s.degreeLevels.includes(filters.degreeLevel as DegreeLevel)) return false;
    }

    if (filters.hostCountry && filters.hostCountry !== 'all') {
      if (!s.hostCountry.toLowerCase().includes(filters.hostCountry.toLowerCase())) return false;
    }

    if (filters.fundingType && filters.fundingType !== 'all') {
      if (s.fundingType !== filters.fundingType) return false;
    }

    if (filters.onlySaved && !savedIds.has(s.id)) return false;
    if (filters.onlyTracked && !trackedIds.has(s.id)) return false;

    return true;
  });

  // 2. Compute Projections & Match Scores
  const projected: ScholarshipCardProjection[] = filtered.map(s => {
    const match = calculateMatchScore(s, profile);
    const trackedApp = trackedApps.find(a => a.scholarshipId === s.id);
    const checklist = trackedApp ? trackedApp.checklist : (dynamicChecklists[s.id] || getScholarshipChecklist(s));
    const totalCount = checklist.length;
    const completedCount = checklist.filter(c => c.completed).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      scholarship: s,
      matchScore: match.score,
      matchHighlights: match.fitHighlights,
      unmetCriteria: match.unmetCriteria,
      totalChecklistCount: totalCount,
      completedChecklistCount: completedCount,
      progressPercent,
      isSaved: savedIds.has(s.id),
      isTracked: trackedIds.has(s.id),
    };
  });

  // 3. Score threshold filter
  let finalResult = projected;
  if (filters.minMatchScore && filters.minMatchScore > 0) {
    finalResult = finalResult.filter(p => p.matchScore >= filters.minMatchScore!);
  }

  // 4. Sorting
  const sortBy = filters.sortBy || 'match';
  finalResult.sort((a, b) => {
    if (sortBy === 'match') {
      return b.matchScore - a.matchScore;
    }
    if (sortBy === 'deadline') {
      return (a.scholarship.deadline || '').localeCompare(b.scholarship.deadline || '');
    }
    return a.scholarship.title.localeCompare(b.scholarship.title);
  });

  return finalResult;
}

// 7. AI Summaries Local Cache (Avoids redundant requests and minimizes quota usage)
export function getCachedAiSummary(scholarshipId: string) {
  try {
    const raw = localStorage.getItem(AI_SUMMARY_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[scholarshipId] || null;
  } catch {
    return null;
  }
}

export function saveCachedAiSummary(scholarshipId: string, summary: any) {
  try {
    const raw = localStorage.getItem(AI_SUMMARY_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[scholarshipId] = summary;
    localStorage.setItem(AI_SUMMARY_CACHE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to cache AI summary', e);
  }
}

// 8. Theme Preference
export function getThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Keep native controls (scrollbars, form fields, dialogs) in sync
    const root = document.documentElement;
    if (root) root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

// 9. Full Backup Export / Import (Zero Server Quota)
export function exportBackupData(): string {
  const data = {
    profile: loadUserProfile(),
    applications: loadTrackedApplications(),
    savedScholarships: loadSavedScholarshipIds(),
    dynamicChecklists: loadAllDynamicChecklists(),
    customScholarships: getRawScholarships().filter(s => s.isCustom),
    recentSearches: loadRecentSearches(),
    exportedAt: new Date().toISOString(),
    version: '2.0-optimized',
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profile) saveUserProfile(parsed.profile);
    if (Array.isArray(parsed.applications)) saveTrackedApplications(parsed.applications);
    if (Array.isArray(parsed.savedScholarships)) localStorage.setItem(SAVED_KEY, JSON.stringify(parsed.savedScholarships));
    if (parsed.dynamicChecklists) localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(parsed.dynamicChecklists));
    if (Array.isArray(parsed.customScholarships)) localStorage.setItem(CUSTOM_SCHOLARSHIPS_KEY, JSON.stringify(parsed.customScholarships));
    if (Array.isArray(parsed.recentSearches)) localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(parsed.recentSearches.slice(0, MAX_RECENT_SEARCHES)));
    
    queryCache.clear();
    initScholarshipDatabase();
    return { success: true, message: 'All scholarship and application checklist data restored successfully!' };
  } catch (e) {
    return { success: false, message: 'Invalid JSON backup format. Please verify your file.' };
  }
}

// 10. Recent Searches Management (Saves the last 3 user search query strings)
export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === 'string' && item.trim().length > 0).slice(0, MAX_RECENT_SEARCHES);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): string[] {
  try {
    const trimmed = query.trim();
    if (!trimmed) return loadRecentSearches();

    const current = loadRecentSearches();
    // Filter out case-insensitive duplicate of current query
    const filtered = current.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    // Prepend new query to the front and cap at max 3
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeRecentSearch(queryToRemove: string): string[] {
  try {
    const current = loadRecentSearches();
    const updated = current.filter(item => item.toLowerCase() !== queryToRemove.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.error('Failed to clear recent searches', e);
  }
}

