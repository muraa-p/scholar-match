import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  Scholarship,
  TrackedApplication,
  ApplicationStatus,
  ChecklistItem
} from './types';
import {
  initScholarshipDatabase,
  setExternalScholarships,
  queryScholarships,
  QueryFilters,
  ScholarshipCardProjection,
  getScholarshipChecklist,
  getThemePreference,
  saveThemePreference,
  defaultUserProfile,
} from './utils/db';
import { useAuth } from './lib/auth';
import {
  fetchScholarships,
  fetchProfile,
  saveProfile,
  fetchSavedIds,
  toggleSaved,
  fetchApplications,
  trackApplication,
  updateApplicationStatus,
  updateApplicationNotes,
  updateMotivationLetter,
  removeApplication,
  toggleChecklistItem as apiToggleChecklistItem,
  addChecklistItem as apiAddChecklistItem,
  deleteChecklistItem as apiDeleteChecklistItem,
  addCommunicationLog,
  toggleCommsReplied,
  addCustomScholarship,
} from './lib/dataService';

// Components
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScholarshipsExplorer } from './components/ScholarshipsExplorer';
import { ApplicationsTrackerView } from './components/ApplicationsTrackerView';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import { DynamicChecklistModal } from './components/DynamicChecklistModal';
import { AiSummaryModal } from './components/AiSummaryModal';
import { ProfileModal } from './components/ProfileModal';
import { AddScholarshipModal } from './components/AddScholarshipModal';
import { AuthPage } from './components/AuthPage';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // 1. Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getThemePreference());

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('scholarships');

  // 3. Application Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [trackedApplications, setTrackedApplications] = useState<TrackedApplication[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState<number>(0);

  // 4. Explorer Filters State
  const [filters, setFilters] = useState<QueryFilters>({
    query: '',
    degreeLevel: 'all',
    hostCountry: 'all',
    fundingType: 'all',
    minMatchScore: 0,
    onlySaved: false,
    onlyTracked: false,
    sortBy: 'match',
  });

  // 5. Modal Active States
  const [detailScholarship, setDetailScholarship] = useState<Scholarship | null>(null);
  const [checklistScholarship, setChecklistScholarship] = useState<Scholarship | null>(null);
  const [aiSummaryScholarship, setAiSummaryScholarship] = useState<Scholarship | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch scholarships + user data from Supabase when logged in
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setDataLoading(true);

    (async () => {
      try {
        const [scholarships, profile, savedIds, apps] = await Promise.all([
          fetchScholarships(),
          fetchProfile(user.id),
          fetchSavedIds(user.id),
          fetchApplications(user.id),
        ]);

        if (cancelled) return;

        // Inject scholarships into the query engine
        setExternalScholarships(scholarships);
        initScholarshipDatabase();

        setUserProfile(profile || defaultUserProfile);
        setSavedScholarshipIds(savedIds);
        setTrackedApplications(apps);

        // Show onboarding for new users who haven't filled their profile yet
        // (no DB row, or row with onboarding_completed=false)
        if (!profile || !profile.onboardingCompleted) {
          setShowOnboarding(true);
          setIsProfileModalOpen(true);
        }
      } catch (e) {
        console.error('Failed to load user data', e);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      setExternalScholarships(undefined);
    };
  }, [user?.id]);

  // Sync theme changes to DOM
  useEffect(() => {
    saveThemePreference(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Recompute projected scholarship cards
  const projectedScholarships: ScholarshipCardProjection[] = useMemo(() => {
    return queryScholarships(filters, userProfile, savedScholarshipIds, trackedApplications);
  }, [filters, userProfile, savedScholarshipIds, trackedApplications, dataVersion]);

  // Handler: Toggle Save / Bookmark (Supabase-backed)
  const handleToggleSave = useCallback(async (scholarshipId: string) => {
    if (!user) return;
    const nowSaved = await toggleSaved(user.id, scholarshipId);
    if (nowSaved) {
      setSavedScholarshipIds(prev => (prev.includes(scholarshipId) ? prev : [...prev, scholarshipId]));
    } else {
      setSavedScholarshipIds(prev => prev.filter(id => id !== scholarshipId));
    }
  }, [user]);

  // Handler: Track Application
  const handleTrack = useCallback(async (scholarship: Scholarship) => {
    if (!user) {
      return;
    }
    const existing = trackedApplications.find(a => a.scholarshipId === scholarship.id);
    if (existing) {
      await removeApplication(existing.id);
      setTrackedApplications(prev => prev.filter(a => a.id !== existing.id));
    } else {
      const fallbackChecklist = getScholarshipChecklist(scholarship);
      const newApp = await trackApplication(user.id, scholarship, fallbackChecklist);
      if (newApp) {
        setTrackedApplications(prev => [newApp, ...prev.filter(a => a.scholarshipId !== scholarship.id)]);
      }
    }
  }, [user, trackedApplications]);

  // Handler: Toggle Checklist Item
  const handleToggleChecklistItem = useCallback(async (scholarshipId: string, itemId: string) => {
    const app = trackedApplications.find(a => a.scholarshipId === scholarshipId);
    if (!app) return;
    await apiToggleChecklistItem(app.id, itemId);
    setTrackedApplications(prev =>
      prev.map(a => {
        if (a.scholarshipId === scholarshipId) {
          const updatedChecklist = a.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          return { ...a, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
        }
        return a;
      })
    );
  }, [trackedApplications]);

  // Handler: Add Custom Checklist Item
  const handleAddChecklistItem = useCallback(async (scholarshipId: string, title: string) => {
    const app = trackedApplications.find(a => a.scholarshipId === scholarshipId);
    if (!app) return;
    await apiAddChecklistItem(app.id, { title, category: 'custom' });
    setTrackedApplications(prev =>
      prev.map(a =>
        a.scholarshipId === scholarshipId
          ? { ...a, checklist: [...a.checklist, { id: `custom-${Date.now()}`, title, category: 'custom' as const, completed: false }] }
          : a
      )
    );
  }, [trackedApplications]);

  // Handler: Update Application Pipeline Status
  const handleUpdateAppStatus = useCallback(async (appId: string, status: ApplicationStatus) => {
    await updateApplicationStatus(appId, status);
    setTrackedApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  // Handler: Remove Tracked Application
  const handleRemoveApplication = useCallback(async (appId: string) => {
    await removeApplication(appId);
    setTrackedApplications(prev => prev.filter(a => a.id !== appId));
  }, []);

  // Handler: Save Profile
  const handleSaveProfile = useCallback(async (newProfile: UserProfile) => {
    if (user) {
      await saveProfile(user.id, newProfile);
    }
    setUserProfile({ ...newProfile, onboardingCompleted: true });
    setShowOnboarding(false);
    setDataVersion(v => v + 1);
  }, [user]);

  // Handler: Add Custom Scholarship
  // Handler: Add Custom Scholarship (persists to Supabase via protected API)
  const handleAddCustomScholarship = useCallback(async (newScholarship: Scholarship): Promise<{ id?: string; error?: string }> => {
    const result = await addCustomScholarship(newScholarship);
    if (result.error) return result;
    if (result.id) {
      setExternalScholarships(undefined);
      fetchScholarships(true).then(list => {
        setExternalScholarships([...list, { ...newScholarship, id: result.id! }]);
      });
      setDataVersion(v => v + 1);
    }
    return result;
  }, []);

  // Filter Updates
  const handleFilterChange = useCallback((newFilters: Partial<QueryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      query: '',
      degreeLevel: 'all',
      hostCountry: 'all',
      fundingType: 'all',
      minMatchScore: 0,
      onlySaved: false,
      onlyTracked: false,
      sortBy: 'match',
    });
  }, []);

  const handleOpenDetails = useCallback((s: Scholarship) => setDetailScholarship(s), []);
  const handleOpenAiSummary = useCallback((s: Scholarship) => setAiSummaryScholarship(s), []);
  const handleOpenProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const handleOpenAddModal = useCallback(() => setIsAddModalOpen(true), []);

  // If auth is still loading, show a brief loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 dark:border-[#2A2A34] border-t-[#C5A267] rounded-full animate-spin" />
      </div>
    );
  }

  // Gate behind login
  if (!user) {
    return <AuthPage onDone={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#0A0A0B] text-stone-900 dark:text-[#E4E4E7] flex flex-col font-sans transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        userProfile={userProfile}
        trackedCount={trackedApplications.length}
        savedCount={savedScholarshipIds.length}
        onOpenProfile={handleOpenProfileModal}
        onOpenAddModal={handleOpenAddModal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'scholarships' && (
          <ScholarshipsExplorer
            userProfile={userProfile}
            projectedScholarships={projectedScholarships}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onToggleSave={handleToggleSave}
            onTrack={handleTrack}
            onOpenDetails={handleOpenDetails}
            onOpenAiSummary={handleOpenAiSummary}
            onOpenProfile={handleOpenProfileModal}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            userProfile={userProfile}
            projectedScholarships={projectedScholarships}
            trackedApplications={trackedApplications}
            savedScholarshipIds={savedScholarshipIds}
            onNavigateToTab={setActiveTab}
            onOpenDetails={handleOpenDetails}
            onOpenAiSummary={handleOpenAiSummary}
            onToggleSave={handleToggleSave}
            onTrack={handleTrack}
            onOpenProfile={handleOpenProfileModal}
            onToggleChecklistItem={handleToggleChecklistItem}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsTrackerView
            applications={trackedApplications}
            projectedScholarships={projectedScholarships}
            onUpdateAppStatus={handleUpdateAppStatus}
            onToggleChecklistItem={handleToggleChecklistItem}
            onAddChecklistItem={handleAddChecklistItem}
            onRemoveApplication={handleRemoveApplication}
            onOpenDetails={handleOpenDetails}
            onOpenAiSummary={handleOpenAiSummary}
            onNavigateToExplore={() => setActiveTab('scholarships')}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-stone-200 dark:border-[#1C1C24] py-6 px-4 text-center text-xs text-stone-500 dark:text-[#71717A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ScholarMatch — Global Scholarship Discovery & Opportunity Portal</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-stone-800 dark:hover:text-[#D1D1D6] transition font-medium"
            >
              Academic Profile & Criteria
            </button>
          </div>
        </div>
      </footer>

      <ScholarshipDetailModal
        scholarship={detailScholarship}
        userProfile={userProfile}
        isOpen={!!detailScholarship}
        onClose={() => setDetailScholarship(null)}
        isSaved={!!detailScholarship && savedScholarshipIds.includes(detailScholarship.id)}
        isTracked={!!detailScholarship && trackedApplications.some(a => a.scholarshipId === detailScholarship.id)}
        onToggleSave={handleToggleSave}
        onTrack={handleTrack}
        onOpenAiSummary={s => {
          setDetailScholarship(null);
          setAiSummaryScholarship(s);
        }}
        onChecklistChanged={() => {
          setDataVersion(v => v + 1);
        }}
      />

      <DynamicChecklistModal
        scholarship={checklistScholarship}
        isOpen={!!checklistScholarship}
        onClose={() => setChecklistScholarship(null)}
        isTracked={!!checklistScholarship && trackedApplications.some(a => a.scholarshipId === checklistScholarship.id)}
        onTrack={handleTrack}
        onOpenAiSummary={s => {
          setChecklistScholarship(null);
          setAiSummaryScholarship(s);
        }}
        onChecklistChanged={() => {
          setDataVersion(v => v + 1);
        }}
      />

      <AiSummaryModal
        scholarship={aiSummaryScholarship}
        isOpen={!!aiSummaryScholarship}
        onClose={() => setAiSummaryScholarship(null)}
        isTracked={!!aiSummaryScholarship && trackedApplications.some(a => a.scholarshipId === aiSummaryScholarship.id)}
        onTrack={handleTrack}
        onOpenChecklist={s => {
          setAiSummaryScholarship(null);
          setChecklistScholarship(s);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen || showOnboarding}
        onClose={() => {
          if (showOnboarding) return;
          setIsProfileModalOpen(false);
        }}
        profile={userProfile}
        onSave={handleSaveProfile}
        isOnboarding={showOnboarding}
      />

      <AddScholarshipModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddScholarship={handleAddCustomScholarship}
      />
    </div>
  );
}
