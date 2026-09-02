import { Scholarship, UserProfile, MatchScoreResult } from '../types';

export function calculateMatchScore(scholarship: Scholarship, profile: UserProfile): MatchScoreResult {
  let score = 0;
  const unmetCriteria: string[] = [];
  const fitHighlights: string[] = [];

  // 1. Degree Level match (30 pts)
  const levelMatch = scholarship.degreeLevels.includes(profile.targetDegree);
  if (levelMatch) {
    score += 30;
    fitHighlights.push(`Direct degree match for ${profile.targetDegree}`);
  } else {
    unmetCriteria.push(`Degree mismatch: program is for ${scholarship.degreeLevels.join(', ')} while your target is ${profile.targetDegree}`);
  }

  // 2. Field of Study match (25 pts)
  const fieldMatch = 
    scholarship.fieldsOfStudy.includes('All / Any Field') ||
    scholarship.fieldsOfStudy.includes(profile.fieldOfStudy);
  
  if (fieldMatch) {
    score += 25;
    fitHighlights.push(`Field aligned: ${profile.fieldOfStudy}`);
  } else {
    unmetCriteria.push(`Field difference: covers ${scholarship.fieldsOfStudy.join(', ')}`);
  }

  // 3. GPA requirement (20 pts)
  let gpaMatch = true;
  if (scholarship.eligibilityCriteria.minGpa) {
    if (profile.gpa >= scholarship.eligibilityCriteria.minGpa) {
      score += 20;
      fitHighlights.push(`GPA (${profile.gpa.toFixed(2)}) meets or exceeds minimum requirement (${scholarship.eligibilityCriteria.minGpa.toFixed(2)})`);
    } else {
      gpaMatch = false;
      const diff = scholarship.eligibilityCriteria.minGpa - profile.gpa;
      if (diff <= 0.3) {
        score += 10; // partial points for borderline
        unmetCriteria.push(`Borderline GPA: requires min ${scholarship.eligibilityCriteria.minGpa.toFixed(2)} (you have ${profile.gpa.toFixed(2)}) - emphasize high impact projects`);
      } else {
        unmetCriteria.push(`Below GPA threshold: requires min ${scholarship.eligibilityCriteria.minGpa.toFixed(2)} (you have ${profile.gpa.toFixed(2)})`);
      }
    }
  } else {
    score += 20;
    fitHighlights.push('No strict GPA cutoff specified');
  }

  // 4. Work Experience (15 pts)
  let workExpMatch = true;
  if (scholarship.eligibilityCriteria.minWorkExperienceYears && scholarship.eligibilityCriteria.minWorkExperienceYears > 0) {
    if (profile.workExperienceYears >= scholarship.eligibilityCriteria.minWorkExperienceYears) {
      score += 15;
      fitHighlights.push(`Work experience (${profile.workExperienceYears} yrs) meets the ${scholarship.eligibilityCriteria.minWorkExperienceYears}+ years requirement`);
    } else {
      workExpMatch = false;
      unmetCriteria.push(`Requires at least ${scholarship.eligibilityCriteria.minWorkExperienceYears} years of work experience (you entered ${profile.workExperienceYears} yrs)`);
    }
  } else {
    score += 15;
    fitHighlights.push('No mandatory minimum work experience years');
  }

  // 5. Country / Target Region compatibility (10 pts)
  let countryMatch = true;
  if (profile.targetCountries && profile.targetCountries.length > 0) {
    const isTargeted = profile.targetCountries.some(tc => 
      scholarship.hostCountry.toLowerCase().includes(tc.toLowerCase()) ||
      tc.toLowerCase().includes(scholarship.hostCountry.toLowerCase()) ||
      tc === 'Worldwide' ||
      scholarship.hostCountry.toLowerCase().includes('multiple')
    );
    if (isTargeted) {
      score += 10;
      fitHighlights.push(`Host country (${scholarship.hostCountry}) matches your target destination list`);
    } else {
      countryMatch = false;
      score += 5;
    }
  } else {
    score += 10;
  }

  // 6. Funding Type check
  let fundingMatch = true;
  if (profile.fundingNeed === 'full_only' && scholarship.fundingType !== 'Fully Funded') {
    fundingMatch = false;
    unmetCriteria.push(`Provides ${scholarship.fundingType}, but your profile prioritizes Fully Funded only`);
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    levelMatch,
    fieldMatch,
    gpaMatch,
    workExpMatch,
    countryMatch,
    fundingMatch,
    unmetCriteria,
    fitHighlights,
  };
}

export function getMatchBadgeColor(score: number): { bg: string; text: string; label: string; border: string } {
  if (score >= 85) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30 dark:border-emerald-500/40',
      label: 'Premier Match'
    };
  }
  if (score >= 65) {
    return {
      bg: 'bg-amber-500/10 dark:bg-[#C5A267]/15',
      text: 'text-amber-800 dark:text-[#E5C38F]',
      border: 'border-amber-500/30 dark:border-[#C5A267]/40',
      label: 'Strong Fit'
    };
  }
  if (score >= 45) {
    return {
      bg: 'bg-stone-500/10 dark:bg-[#1E1E28]',
      text: 'text-stone-700 dark:text-[#D1D1D6]',
      border: 'border-stone-400/30 dark:border-[#383848]',
      label: 'Moderate Fit'
    };
  }
  return {
    bg: 'bg-stone-500/10 dark:bg-[#181820]',
    text: 'text-stone-600 dark:text-[#8E8E93]',
    border: 'border-stone-500/30 dark:border-[#282834]',
    label: 'Partial Match'
  };
}
