import { supabase } from './supabase';
import {
  Scholarship,
  TrackedApplication,
  UserProfile,
  ChecklistItem,
  ApplicationStatus,
} from '../types';
import { initialScholarships } from '../data/scholarshipsData';
import { getDeadlineStatus, DeadlineStatus } from '../utils/deadline';

// ---------------------------------------------------------------------
// Mapping: DB row -> app type
// ---------------------------------------------------------------------

interface ScholarshipRow {
  id: string;
  external_id: string | null;
  title: string;
  provider: string;
  university: string | null;
  host_country: string;
  degree_levels: string[];
  fields_of_study: string[];
  funding_type: string;
  financial_coverage: Record<string, any>;
  deadline: string | null;
  deadline_status: string;
  summary: string | null;
  key_requirements: string[];
  eligibility_criteria: Record<string, any>;
  rejection_pitfalls: string[];
  insider_tips: string[];
  official_application_url: string | null;
  contacts: Record<string, any>;
  default_checklist: any[];
  is_custom: boolean;
}

function rowToScholarship(row: ScholarshipRow): Scholarship {
  // Recompute deadline status at load time so expired scholarships are
  // correctly hidden regardless of the stored (static) value.
  const liveDeadlineStatus = getDeadlineStatus(row.deadline);
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    university: row.university || undefined,
    hostCountry: row.host_country,
    degreeLevels: row.degree_levels as any,
    fieldsOfStudy: row.fields_of_study as any,
    fundingType: row.funding_type as any,
    financialCoverage: row.financial_coverage as any,
    deadline: row.deadline || '',
    deadlineStatus: liveDeadlineStatus,
    summary: row.summary || '',
    keyRequirements: row.key_requirements || [],
    eligibilityCriteria: row.eligibility_criteria as any,
    rejectionPitfalls: row.rejection_pitfalls || [],
    insiderTips: row.insider_tips || [],
    officialApplicationUrl: row.official_application_url || undefined,
    contacts: row.contacts as any,
    defaultChecklist: (row.default_checklist || []) as any,
    isCustom: row.is_custom || false,
  };
}

// ---------------------------------------------------------------------
// Scholarships
// ---------------------------------------------------------------------

// Simple in-memory cache for the session so the app doesn't re-fetch constantly.
let scholarshipsCache: Scholarship[] | null = null;

export async function fetchScholarships(
  force = false,
  opts: { includeExpired?: boolean } = {}
): Promise<Scholarship[]> {
  const { includeExpired = false } = opts;
  if (scholarshipsCache && !force) return scholarshipsCache;
  // Try Supabase first; fall back to static seed if DB unavailable.
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });
    if (error) throw error;
    const rows = (data as ScholarshipRow[]) || [];
    let mapped = rows.map(rowToScholarship);
    if (!includeExpired) {
      mapped = mapped.filter(s => s.deadlineStatus !== 'closed');
    }
    scholarshipsCache = mapped.length > 0 ? mapped : initialScholarships;
    return scholarshipsCache;
  } catch (e) {
    console.error('Failed to fetch scholarships, falling back to seed data', e);
    let fallback = initialScholarships;
    if (!includeExpired) {
      fallback = initialScholarships.filter(
        s => (getDeadlineStatus(s.deadline) as DeadlineStatus) !== 'closed'
      );
    }
    scholarshipsCache = fallback;
    return fallback;
  }
}

export function clearScholarshipsCache() {
  scholarshipsCache = null;
}

// ---------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return {
      name: data.name || 'Scholar Applicant',
      nationality: data.nationality || 'International',
      currentDegree: data.current_degree || 'Bachelor / Undergraduate',
      targetDegree: data.target_degree || 'Master / Postgraduate',
      gpa: Number(data.gpa ?? 3.6),
      fieldOfStudy: data.field_of_study || 'STEM & Computer Science',
      targetCountries: data.target_countries || [],
      workExperienceYears: data.work_experience_years || 0,
      englishProficiency: data.english_proficiency || 'ielts_toefl_ready',
      ieltsScore: data.ielts_score || undefined,
      fundingNeed: data.funding_need || 'full_only',
      targetYear: data.target_year || '2026/2027',
      previousRejectionsDescription: data.previous_rejections_description || undefined,
      onboardingCompleted: data.onboarding_completed || false,
    };
  } catch {
    return null;
  }
}

export async function saveProfile(userId: string, profile: UserProfile): Promise<void> {
  const row = {
    id: userId,
    name: profile.name,
    nationality: profile.nationality,
    current_degree: profile.currentDegree,
    target_degree: profile.targetDegree,
    gpa: profile.gpa,
    field_of_study: profile.fieldOfStudy,
    target_countries: profile.targetCountries,
    work_experience_years: profile.workExperienceYears,
    english_proficiency: profile.englishProficiency,
    ielts_score: profile.ieltsScore || null,
    funding_need: profile.fundingNeed,
    target_year: profile.targetYear,
    previous_rejections_description: profile.previousRejectionsDescription || null,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('user_profiles')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('Failed to save profile', error);
}

// ---------------------------------------------------------------------
// Saved scholarships
// ---------------------------------------------------------------------

export async function fetchSavedIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('saved_scholarships')
      .select('scholarship_id')
      .eq('user_id', userId);
    if (error) return [];
    return (data || []).map(r => r.scholarship_id);
  } catch {
    return [];
  }
}

export async function toggleSaved(userId: string, scholarshipId: string): Promise<boolean> {
  try {
    const saved = await fetchSavedIds(userId);
    const exists = saved.includes(scholarshipId);
    if (exists) {
      await supabase
        .from('saved_scholarships')
        .delete()
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId);
      return false;
    } else {
      await supabase
        .from('saved_scholarships')
        .insert({ user_id: userId, scholarship_id: scholarshipId });
      return true;
    }
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------
// Tracked applications
// ---------------------------------------------------------------------

interface ApplicationRow {
  id: string;
  scholarship_id: string;
  custom_title: string | null;
  status: string;
  applied_date: string | null;
  deadline: string | null;
  portal_url: string | null;
  personal_notes: string | null;
  draft_motivation_letter: string | null;
  ai_analysis_result: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

function rowToApplication(row: ApplicationRow): TrackedApplication {
  return {
    id: row.id,
    scholarshipId: row.scholarship_id,
    customTitle: row.custom_title || undefined,
    status: row.status as ApplicationStatus,
    appliedDate: row.applied_date || undefined,
    deadline: row.deadline || undefined,
    portalUrl: row.portal_url || undefined,
    personalNotes: row.personal_notes || undefined,
    draftMotivationLetter: row.draft_motivation_letter || undefined,
    aiAnalysisResult: row.ai_analysis_result as TrackedApplication['aiAnalysisResult'] || undefined,
    checklist: [],
    communicationLog: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchApplications(userId: string): Promise<TrackedApplication[]> {
  try {
    const { data, error } = await supabase
      .from('tracked_applications')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    const rows = (data as ApplicationRow[]) || [];
    const apps = rows.map(rowToApplication);
    return await hydrateApplications(apps);
  } catch {
    return [];
  }
}

// Load checklists + communication logs for each application
async function hydrateApplications(apps: TrackedApplication[]): Promise<TrackedApplication[]> {
  if (apps.length === 0) return apps;
  const ids = apps.map(a => a.id);

  const [checkRes, logRes] = await Promise.all([
    supabase
      .from('checklists')
      .select('*')
      .in('application_id', ids)
      .order('sort_order', { ascending: true }),
    supabase
      .from('communication_log')
      .select('*')
      .in('application_id', ids)
      .order('date', { ascending: false }),
  ]);

  const checklists = checkRes.data || [];
  const logs = logRes.data || [];

  return apps.map(app => {
    const checklist: ChecklistItem[] = checklists
      .filter(c => c.application_id === app.id)
      .map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        completed: c.completed,
        dueDate: c.due_date || undefined,
        notes: c.notes || undefined,
      }));
    const communicationLog = logs
      .filter(l => l.application_id === app.id)
      .map(l => ({
        id: l.id,
        date: l.date,
        recipient: l.recipient || '',
        topic: l.topic || '',
        notes: l.notes || '',
        replied: l.replied,
      }));
    return { ...app, checklist, communicationLog };
  });
}

export async function trackApplication(
  userId: string,
  scholarship: Scholarship,
  fallbackChecklist: ChecklistItem[]
): Promise<TrackedApplication | null> {
  try {
    // Upsert (unique user+scholarship)
    const { data, error } = await supabase
      .from('tracked_applications')
      .upsert(
        {
          user_id: userId,
          scholarship_id: scholarship.id,
          custom_title: scholarship.title,
          status: 'preparing',
          deadline: scholarship.deadline || null,
          portal_url: scholarship.officialApplicationUrl || null,
        },
        { onConflict: 'user_id,scholarship_id' }
      )
      .select()
      .single();
    if (error) throw error;

    const appId = data.id;

    // Insert default checklist if none exists
    const { count } = await supabase
      .from('checklists')
      .select('id', { count: 'exact', head: true })
      .eq('application_id', appId);
    if (!count) {
      await supabase.from('checklists').insert(
        fallbackChecklist.map((item, i) => ({
          application_id: appId,
          title: item.title,
          category: item.category,
          completed: item.completed,
          notes: item.notes || null,
          due_date: item.dueDate || null,
          sort_order: i,
        }))
      );
    }

    return (await fetchApplications(userId)).find(a => a.id === appId) || null;
  } catch (e) {
    console.error('Failed to track application', e);
    return null;
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<void> {
  await supabase
    .from('tracked_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId);
}

export async function updateApplicationNotes(applicationId: string, notes: string): Promise<void> {
  await supabase
    .from('tracked_applications')
    .update({ personal_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', applicationId);
}

export async function updateMotivationLetter(applicationId: string, letter: string): Promise<void> {
  await supabase
    .from('tracked_applications')
    .update({ draft_motivation_letter: letter, updated_at: new Date().toISOString() })
    .eq('id', applicationId);
}

export async function removeApplication(applicationId: string): Promise<void> {
  await supabase.from('tracked_applications').delete().eq('id', applicationId);
}

// ---------------------------------------------------------------------
// Checklist items
// ---------------------------------------------------------------------

export async function toggleChecklistItem(
  applicationId: string,
  itemId: string
): Promise<ChecklistItem[]> {
  const { data } = await supabase
    .from('checklists')
    .select('completed')
    .eq('id', itemId)
    .single();
  const completed = data ? !data.completed : false;
  await supabase
    .from('checklists')
    .update({ completed })
    .eq('id', itemId);
  return fetchChecklist(applicationId);
}

export async function addChecklistItem(
  applicationId: string,
  item: Omit<ChecklistItem, 'id' | 'completed'>
): Promise<ChecklistItem[]> {
  const { count } = await supabase
    .from('checklists')
    .select('id', { count: 'exact', head: true })
    .eq('application_id', applicationId);
  await supabase.from('checklists').insert({
    application_id: applicationId,
    title: item.title,
    category: item.category,
    notes: item.notes || null,
    due_date: item.dueDate || null,
    sort_order: count || 0,
  });
  return fetchChecklist(applicationId);
}

export async function deleteChecklistItem(
  applicationId: string,
  itemId: string
): Promise<ChecklistItem[]> {
  await supabase.from('checklists').delete().eq('id', itemId);
  return fetchChecklist(applicationId);
}

export async function fetchChecklist(applicationId: string): Promise<ChecklistItem[]> {
  const { data } = await supabase
    .from('checklists')
    .select('*')
    .eq('application_id', applicationId)
    .order('sort_order', { ascending: true });
  return (data || []).map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    completed: c.completed,
    dueDate: c.due_date || undefined,
    notes: c.notes || undefined,
  }));
}

// ---------------------------------------------------------------------
// Communication log
// ---------------------------------------------------------------------

export async function addCommunicationLog(
  applicationId: string,
  entry: { recipient: string; topic: string; notes: string; date: string }
): Promise<void> {
  await supabase.from('communication_log').insert({
    application_id: applicationId,
    date: entry.date,
    recipient: entry.recipient,
    topic: entry.topic,
    notes: entry.notes,
    replied: false,
  });
}

export async function toggleCommsReplied(logId: string): Promise<void> {
  await supabase.from('communication_log').update({ replied: true }).eq('id', logId);
}

export async function deleteCommunicationLog(logId: string): Promise<void> {
  await supabase.from('communication_log').delete().eq('id', logId);
}
