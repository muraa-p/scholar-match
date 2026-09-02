import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Search, 
  CheckSquare, 
  User, 
  Sun, 
  Moon, 
  PlusCircle,
  Menu,
  X,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types';

export type ActiveTab = 'dashboard' | 'scholarships' | 'applications';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userProfile: UserProfile;
  trackedCount: number;
  savedCount: number;
  onOpenProfile: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  userProfile,
  trackedCount,
  onOpenProfile,
  onOpenAddModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-[#22222A] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: Brand Logo & Title */}
          <div 
            id="brand-logo"
            onClick={() => handleTabClick('scholarships')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0 min-h-[44px]"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 dark:bg-[#16161C] border border-stone-800 dark:border-[#C5A267]/40 flex items-center justify-center text-amber-400 dark:text-[#D4B37F] shadow-xs group-hover:scale-105 transition">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-[#F4F4F5]">
                ScholarMatch
              </span>
              <span className="text-[10px] text-stone-500 dark:text-[#8E8E93] hidden sm:block leading-none">
                Global Opportunities
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (Hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-100 dark:bg-[#121217] p-1 rounded-xl border border-stone-200/80 dark:border-[#26262F]">
            {/* Scholarships Explorer Tab */}
            <button
              id="nav-tab-scholarships"
              onClick={() => handleTabClick('scholarships')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
                activeTab === 'scholarships'
                  ? 'bg-white dark:bg-[#1E1E26] text-stone-900 dark:text-[#F5F5F7] dark:border dark:border-[#C5A267]/40 shadow-xs'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-stone-600 dark:text-[#C5A267]" />
              <span>Explore Scholarships</span>
            </button>

            {/* Dashboard Tab */}
            <button
              id="nav-tab-dashboard"
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-[#1E1E26] text-stone-900 dark:text-[#F5F5F7] dark:border dark:border-[#C5A267]/40 shadow-xs'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-stone-600 dark:text-[#C5A267]" />
              <span>Dashboard</span>
            </button>

            {/* Applications & Checklists Tab */}
            <button
              id="nav-tab-applications"
              onClick={() => handleTabClick('applications')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
                activeTab === 'applications'
                  ? 'bg-white dark:bg-[#1E1E26] text-stone-900 dark:text-[#F5F5F7] dark:border dark:border-[#C5A267]/40 shadow-xs'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:text-stone-900 dark:hover:text-[#D1D1D6]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-stone-600 dark:text-[#C5A267]" />
              <span>My Checklists</span>
              {trackedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-100 dark:bg-[#C5A267] dark:text-[#0A0A0B] font-bold ml-1">
                  {trackedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Actions, Profile, Theme Toggle & Mobile Hamburger */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 z-10">
            {/* Add Custom Scholarship (Desktop view) */}
            <button
              onClick={onOpenAddModal}
              title="Add Custom Scholarship Opportunity"
              className="hidden lg:flex p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-[#D1D1D6] hover:bg-stone-100 dark:hover:bg-[#181820] border border-stone-200/80 dark:border-[#242430] transition items-center space-x-1 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-stone-500 dark:text-[#C5A267]" />
              <span>Add Award</span>
            </button>

            {/* Profile Button (Always visible & accessible across all screen sizes) */}
            <button
              id="btn-navbar-profile"
              onClick={onOpenProfile}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-[#1C1C26] dark:hover:bg-[#252533] text-stone-50 dark:text-[#F4F4F5] border border-stone-800 dark:border-[#C5A267]/40 transition shadow-xs min-h-[44px] shrink-0"
              title="Edit Profile & Eligibility Matching Criteria"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 dark:text-[#D4B37F] flex items-center justify-center text-[10px] font-bold shrink-0">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col text-left leading-tight max-w-[80px] xs:max-w-[100px] sm:max-w-[120px]">
                <span className="text-xs font-bold truncate">
                  {userProfile.name || 'Profile'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-stone-300 dark:text-[#A1A1AA] truncate">
                  GPA: {userProfile.gpa.toFixed(1)}
                </span>
              </div>
            </button>

            {/* Dark / Light Theme Toggle (Always visible & accessible on all screens) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-stone-600 hover:text-stone-900 dark:text-[#8E8E93] dark:hover:text-[#F4F4F5] hover:bg-stone-100 dark:hover:bg-[#181820] border border-stone-200/60 dark:border-[#242430] transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#D4B37F]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle Button (Visible on md and smaller) */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 dark:text-[#D1D1D6] hover:bg-stone-100 dark:hover:bg-[#181820] border border-stone-200/80 dark:border-[#242430] transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-stone-900 dark:text-[#F4F4F5]" />
              ) : (
                <Menu className="w-5 h-5 text-stone-900 dark:text-[#F4F4F5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer"
          className="md:hidden border-t border-stone-200 dark:border-[#22222A] bg-white dark:bg-[#0E0E14] px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150"
        >
          {/* Navigation Links */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-[#71717A] px-2">
              Navigation
            </span>

            {/* Explore Scholarships Link */}
            <button
              id="mobile-nav-scholarships"
              onClick={() => handleTabClick('scholarships')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                activeTab === 'scholarships'
                  ? 'bg-amber-500/10 dark:bg-[#C5A267]/15 text-amber-900 dark:text-[#E5C38F] border border-amber-500/25 dark:border-[#C5A267]/30 font-bold'
                  : 'text-stone-700 dark:text-[#D1D1D6] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Search className="w-4 h-4 text-amber-600 dark:text-[#C5A267]" />
                <span>Explore Scholarships</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 opacity-60" />
            </button>

            {/* Dashboard Link */}
            <button
              id="mobile-nav-dashboard"
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/10 dark:bg-[#C5A267]/15 text-amber-900 dark:text-[#E5C38F] border border-amber-500/25 dark:border-[#C5A267]/30 font-bold'
                  : 'text-stone-700 dark:text-[#D1D1D6] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4 text-amber-600 dark:text-[#C5A267]" />
                <span>Dashboard Overview</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 opacity-60" />
            </button>

            {/* My Checklists / Applications Tracker Link */}
            <button
              id="mobile-nav-applications"
              onClick={() => handleTabClick('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                activeTab === 'applications'
                  ? 'bg-amber-500/10 dark:bg-[#C5A267]/15 text-amber-900 dark:text-[#E5C38F] border border-amber-500/25 dark:border-[#C5A267]/30 font-bold'
                  : 'text-stone-700 dark:text-[#D1D1D6] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CheckSquare className="w-4 h-4 text-amber-600 dark:text-[#C5A267]" />
                <span>My Checklists & Applications</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {trackedCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 text-stone-100 dark:bg-[#C5A267] dark:text-[#0A0A0B] font-bold">
                    {trackedCount} Active
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-stone-400 opacity-60" />
              </div>
            </button>
          </div>

          {/* Quick Actions & Profile Section in Mobile Drawer */}
          <div className="pt-3 border-t border-stone-200 dark:border-[#22222A] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-[#71717A] px-2">
              Quick Actions
            </span>

            {/* Add Custom Award */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAddModal();
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] hover:bg-stone-100 dark:hover:bg-[#181820] border border-stone-200/80 dark:border-[#242430] transition min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-amber-600 dark:text-[#C5A267]" />
              <span>Add Custom Scholarship Award</span>
            </button>

            {/* Customize Match Profile */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-[#16161E] text-stone-800 dark:text-[#E4E4E7] hover:bg-stone-200 dark:hover:bg-[#20202A] border border-stone-200 dark:border-[#262634] transition min-h-[44px]"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-600 dark:text-[#C5A267]" />
                <span>Edit Profile & Match Preferences</span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">
                {userProfile.gpa.toFixed(1)} GPA
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
