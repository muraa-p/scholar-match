import { Scholarship } from '../types';

export const initialScholarships: Scholarship[] = [
  {
    id: 'chevening-uk',
    title: 'Chevening UK Government Scholarships',
    provider: 'UK Foreign, Commonwealth & Development Office (FCDO)',
    university: 'All 140+ Accredited UK Universities',
    hostCountry: 'United Kingdom',
    degreeLevels: ['Master / Postgraduate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '£1,100 - £1,400 / month',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Arrival allowance', 'Departure allowance', 'Chevening networking events'],
    },
    deadline: '2026-11-05',
    deadlineStatus: 'open',
    summary: 'The UK government’s global scholarship programme offering future leaders a fully-funded 1-year Master’s degree at any UK university. Focuses strongly on leadership potential, networking capability, and a concrete plan to return home to make positive change.',
    keyRequirements: [
      'Undergraduate degree (equivalent to UK 2:1 honours or above ~3.3+ GPA)',
      'Minimum 2 years of verifiable work experience (at least 2,800 hours)',
      'Apply to 3 eligible UK university courses and receive 1 unconditional offer',
      'Return to country of citizenship for minimum 2 years post-graduation',
      '4 distinct 500-word essays: Leadership/Influence, Networking, Studying in the UK, and Career Plan'
    ],
    eligibilityCriteria: {
      minGpa: 3.2,
      targetNationalities: ['Developing Countries', 'Commonwealth Countries', '160+ Eligible Countries'],
      minWorkExperienceYears: 2,
      languageRequirement: 'Meet individual university English requirement',
      returnHomeClause: true,
    },
    rejectionPitfalls: [
      'Submitting generic leadership essays that describe job responsibilities rather than specific initiatives, obstacles overcome, and quantifiable impact.',
      'Failing to reach the 2,800 hours work experience threshold or including unsupported freelance hours.',
      'Career plan that lacks clear short-term (1-2 yr), medium-term (3-5 yr), and long-term (5-10 yr) alignment with UK development priorities in your home country.',
      'Choosing courses that are not clearly linked to your undergraduate degree or professional trajectory without explanation.',
      'Vague answers in the networking essay (committee looks for mutual exchange, not just consuming contacts).'
    ],
    insiderTips: [
      'Use the STAR technique (Situation, Task, Action, Result) in every essay prompt.',
      'Clearly articulate how the UK and your home country will mutually benefit from your education.',
      'Secure strong references early who can testify to your leadership and interpersonal skills.'
    ],
    officialApplicationUrl: 'https://www.chevening.org/scholarships/',
    contacts: {
      email: 'chevening.enquiries@fco.gov.uk',
      inquiryFormUrl: 'https://www.chevening.org/contact-us/',
      departmentOrPerson: 'Chevening Secretariat UK',
      notes: 'Response time is typically 3-5 business days during application cycles.'
    },
    defaultChecklist: [
      { title: 'Confirm 2,800 hours work experience documentation', category: 'document' },
      { title: 'Draft Leadership & Influence essay (500 words)', category: 'essay' },
      { title: 'Draft Relationship Building & Networking essay (500 words)', category: 'essay' },
      { title: 'Draft Studying in the UK essay with 3 course choices', category: 'essay' },
      { title: 'Draft Career Plan essay (Short, Mid, Long term)', category: 'essay' },
      { title: 'Apply to 3 chosen UK universities directly', category: 'submission' },
      { title: 'Request 2 reference letters from supervisors/mentors', category: 'recommendation' },
      { title: 'Obtain official academic transcripts and certified degree certificate', category: 'document' },
      { title: 'Submit Chevening online portal application before deadline', category: 'submission' }
    ]
  },
  {
    id: 'fulbright-foreign-student',
    title: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State / Foreign Scholarship Board',
    university: 'Accredited US Universities & Graduate Schools',
    hostCountry: 'United States',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '$1,800 - $2,600 / month (varies by US city)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['J-1 visa sponsorship', 'Book and relocation allowance', 'Enrichment seminars'],
    },
    deadline: '2026-06-15',
    deadlineStatus: 'upcoming',
    summary: 'Flagship international educational exchange program sponsored by the U.S. government, enabling graduate students and young professionals to study in the U.S. for one or more years. Emphasizes mutual cultural understanding, leadership, and public diplomacy.',
    keyRequirements: [
      'Bachelor’s degree with strong academic record (typically 3.4+ GPA)',
      'Competitive TOEFL iBT (85-100+) or IELTS (6.5-7.5+)',
      'Statement of Purpose / Study Objective essay (detailed research/study plan)',
      'Personal Statement (narrative explaining your life journey, resilience, and identity)',
      '3 letters of recommendation',
      'Return to home country for 2 years (2-Year Home Country Physical Presence Requirement J-1 visa)'
    ],
    eligibilityCriteria: {
      minGpa: 3.3,
      targetNationalities: ['155+ Partner Countries across Asia, Africa, Europe, Americas'],
      languageRequirement: 'TOEFL iBT 85+ or IELTS 6.5+ (some commissions sponsor test)',
      returnHomeClause: true,
    },
    rejectionPitfalls: [
      'Mixing up the Personal Statement with the Study Objective (Study Objective is academic/technical; Personal Statement is biographical and cultural).',
      'Inability to clearly justify why the study MUST be conducted in the USA rather than domestically or elsewhere.',
      'Weak or passive letters of recommendation that lack concrete examples of applicant resilience, intellectual curiosity, or cultural diplomacy.',
      'Failing to show cultural adaptability or openness to cross-cultural exchange during the interview round.'
    ],
    insiderTips: [
      'Check your local U.S. Embassy / Fulbright Commission page as deadlines and country-specific priorities vary.',
      'In the Study Objective, identify specific American research methodologies, archives, or professors you want to engage with.'
    ],
    officialApplicationUrl: 'https://foreign.fulbrightonline.org/',
    contacts: {
      email: 'fulbright@iie.org',
      inquiryFormUrl: 'https://foreign.fulbrightonline.org/contact-us',
      departmentOrPerson: 'Institute of International Education (IIE)',
      notes: 'Contact your home country US Embassy Fulbright Officer for country-specific queries.'
    },
    defaultChecklist: [
      { title: 'Draft Study Objective / Research Proposal', category: 'essay' },
      { title: 'Draft Personal Statement (Life narrative & cultural ambassador role)', category: 'essay' },
      { title: 'Request 3 academic & professional reference letters', category: 'recommendation' },
      { title: 'Take or register for TOEFL / IELTS examination', category: 'test' },
      { title: 'Prepare official certified transcripts with grading scale', category: 'document' },
      { title: 'Update academic CV (US 2-page format)', category: 'document' },
      { title: 'Submit local US Embassy / Fulbright Commission portal package', category: 'submission' }
    ]
  },
  {
    id: 'daad-epos-germany',
    title: 'DAAD EPOS Development-Related Postgraduate Courses',
    provider: 'German Academic Exchange Service (DAAD)',
    university: 'Selected German Public Universities & TU9',
    hostCountry: 'Germany',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: [
      'STEM & Computer Science',
      'Business, Finance & Economics',
      'Environment & Agriculture',
      'Medicine & Healthcare',
      'Social Sciences, Public Policy & Law'
    ],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '€934 / month (Master), €1,300 / month (PhD)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Study & research allowance', 'Rent subsidy', 'German language course prep'],
    },
    deadline: '2026-09-30',
    deadlineStatus: 'open',
    summary: 'A prestigious German government scholarship for professionals from developing and emerging countries. Offers full funding for selected development-focused Master’s and PhD programs taught in English or German at top German universities.',
    keyRequirements: [
      'Bachelor’s degree completed within the last 6 years with above-average grades (~3.2+ GPA)',
      'At least 2 years of relevant professional work experience after the bachelor’s degree',
      'Detailed Motivation Letter (max 2 pages) showing relationship between degree and home country development',
      'Europass format CV signed and dated',
      'DAAD application form and letter of recommendation from current employer'
    ],
    eligibilityCriteria: {
      minGpa: 3.0,
      targetNationalities: ['DAC List of ODA Recipients (Developing & Emerging Nations)'],
      minWorkExperienceYears: 2,
      languageRequirement: 'IELTS 6.0+ or TOEFL 80+ for English courses / DSH-2 for German',
      returnHomeClause: true,
    },
    rejectionPitfalls: [
      'Bachelor degree was completed more than 6 years before the application date without continuous employment.',
      'Work experience was completed during studies rather than post-graduation.',
      'Submitting a standard chronological CV instead of the mandatory signed Europass CV format.',
      'Motivation letter does not directly explain how the specific German curriculum addresses developmental deficits in the applicant’s home region.',
      'Applying directly to DAAD when the specific course requires applying directly to the university first.'
    ],
    insiderTips: [
      'You can apply for up to 3 EPOS courses, but you must rank them clearly and use tailored motivation letters.',
      'Ensure your employer provides a letter confirming your employment and granting leave for study.'
    ],
    officialApplicationUrl: 'https://www.daad.de/en/information-services-for-higher-education-institutions/programmes/epos/',
    contacts: {
      email: 'postgraduate-courses@daad.de',
      inquiryFormUrl: 'https://www.daad.de/en/the-daad/contact-us/',
      departmentOrPerson: 'DAAD Section ST42 (Development-Related Postgraduate Courses)',
      notes: 'For course-specific questions, email the respective university EPOS coordinator directly.'
    },
    defaultChecklist: [
      { title: 'Create & hand-sign Europass CV', category: 'document' },
      { title: 'Draft DAAD Motivation Letter (2 pages linking studies to country development)', category: 'essay' },
      { title: 'Obtain Employer Recommendation & Leave Confirmation Letter', category: 'recommendation' },
      { title: 'Obtain Academic Recommendation from University Professor', category: 'recommendation' },
      { title: 'Provide proof of min. 2 years post-grad employment contracts/letters', category: 'document' },
      { title: 'Authenticate degree certificates and transcripts (English/German)', category: 'document' },
      { title: 'Submit to host university portal following specific EPOS course instructions', category: 'submission' }
    ]
  },
  {
    id: 'erasmus-mundus-joint-masters',
    title: 'Erasmus Mundus Joint Master Degrees (EMJMD)',
    provider: 'European Commission (European Union)',
    university: 'European University Consortiums (2-4 Institutions)',
    hostCountry: 'Multiple EU Countries (2-4 countries per program)',
    degreeLevels: ['Master / Postgraduate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '€1,400 / month for 24 months',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Full participation fees waived', 'Travel allowance up to €3,000/yr'],
    },
    deadline: '2026-01-15',
    deadlineStatus: 'upcoming',
    summary: 'High-level integrated international study programmes delivered by international consortiums of universities. Students study across at least 2 different European countries and receive joint or multiple degrees with full EU funding.',
    keyRequirements: [
      'First higher education degree (Bachelor’s) or equivalent in relevant field',
      'Proof of English proficiency (IELTS 6.5-7.5 / TOEFL 90-100)',
      'Motivation Letter customized for the specific consortium curriculum',
      '2-3 Academic/Professional Reference Letters',
      'Compliance with the 12-month rule (residence limit for Partner Country scholarships)'
    ],
    eligibilityCriteria: {
      minGpa: 3.2,
      targetNationalities: ['All Nationalities Worldwide (Program & Partner Countries)'],
      minWorkExperienceYears: 0,
      languageRequirement: 'IELTS 6.5+ or TOEFL 90+',
    },
    rejectionPitfalls: [
      'Using a generic template across multiple Erasmus programs without referencing specific professors, laboratory modules, or mobility tracks in each semester.',
      'Applying to more than 3 EMJMD programs in the same application cycle (instant disqualification rule in some consortiums).',
      'Mismatch in prerequisite coursework (e.g. missing quantitative credits for data/economics masters).',
      'Weak motivation for the multi-country mobility requirement (failing to explain why studying in 3 distinct cultural ecosystems is essential for your research).'
    ],
    insiderTips: [
      'Search the Erasmus Mundus catalogue (EMJM) to find the exact niche consortium matching your undergraduate coursework.',
      'Explicitly explain how you will adapt to living in 2-3 different countries over 2 years.'
    ],
    officialApplicationUrl: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
    contacts: {
      email: 'eacea-info@ec.europa.eu',
      inquiryFormUrl: 'https://ec.europa.eu/info/contact_en',
      departmentOrPerson: 'European Education and Culture Executive Agency (EACEA)',
      notes: 'Each consortium has its own direct coordinator email listed on their program website.'
    },
    defaultChecklist: [
      { title: 'Select top 1-3 EMJMD consortiums from the official EU catalog', category: 'custom' },
      { title: 'Review specific prerequisite courses & credit requirements', category: 'document' },
      { title: 'Draft Consortium Motivation Letter with chosen mobility track & thesis plan', category: 'essay' },
      { title: 'Obtain 2 academic reference letters on official university letterhead', category: 'recommendation' },
      { title: 'Verify Residence Certificate (to prove non-EU residency for 12-month rule)', category: 'document' },
      { title: 'Submit application on the specific consortium portal', category: 'submission' }
    ]
  },
  {
    id: 'mext-japan-research',
    title: 'MEXT Japanese Government Research Scholarship',
    provider: 'Ministry of Education, Culture, Sports, Science and Technology (Japan)',
    university: 'National & Public Universities of Japan',
    hostCountry: 'Japan',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '¥143,000 - ¥145,000 / month (~$1,000-$1,100)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['6 months intensive Japanese language training included'],
    },
    deadline: '2026-05-20',
    deadlineStatus: 'upcoming',
    summary: 'The Japanese government’s premier full scholarship for international graduate students. Available through Embassy Recommendation (via Japanese Embassy in your country) or University Recommendation.',
    keyRequirements: [
      'Bachelor’s or Master’s degree with strong academic record (GPA 3.2+ / 80%+)',
      'Under 35 years of age on April 1 of the arrival year',
      'Thorough Research Field and Study Plan (rigorous research proposal)',
      'Pass written language exams (English and/or Japanese) and interview at local Japanese Embassy',
      'Obtain Letter of Acceptance from Japanese university professor after passing preliminary stage'
    ],
    eligibilityCriteria: {
      minGpa: 3.2,
      targetNationalities: ['Countries with Japanese diplomatic relations'],
      ageLimit: 'Under 35 years of age',
      languageRequirement: 'English or Japanese proficiency',
    },
    rejectionPitfalls: [
      'Submitting a superficial or undergraduate-style research proposal without clear methodology, research questions, and literature review.',
      'Proposing a research topic that no Japanese professor or laboratory currently conducts.',
      'Failing the basic embassy written examinations (English grammar and Japanese language test).',
      'Unprofessional formatting or missing official embassy-certified medical examination forms.'
    ],
    insiderTips: [
      'Research existing Japanese academic papers in your field to cite Japanese professors in your proposal.',
      'Even if applying for an English-taught lab, demonstrating a basic knowledge of Japanese shows commitment.'
    ],
    officialApplicationUrl: 'https://www.studyinjapan.go.jp/en/planning/scholarship/mext-scholarship/',
    contacts: {
      email: 'mext@mext.go.jp',
      inquiryFormUrl: 'https://www.studyinjapan.go.jp/en/other/inquiry.html',
      departmentOrPerson: 'Embassy of Japan / MEXT International Student Division',
      notes: 'Inquiries should be directed to the Cultural & Educational Section of your local Japanese Embassy.'
    },
    defaultChecklist: [
      { title: 'Write structured Research Field & Study Program (Kenkyu Keikaku)', category: 'essay' },
      { title: 'Obtain MEXT Prescribed Recommendation Letter format', category: 'recommendation' },
      { title: 'Complete MEXT Prescribed Medical Certificate by licensed physician', category: 'document' },
      { title: 'Prepare for Embassy written exam (English & Japanese test papers)', category: 'test' },
      { title: 'Submit physical dossier to Japanese Embassy in home country', category: 'submission' },
      { title: 'Contact Japanese professors for provisional Letter of Acceptance (post-prelim)', category: 'custom' }
    ]
  },
  {
    id: 'gates-cambridge',
    title: 'Gates Cambridge Scholarship',
    provider: 'Bill & Melinda Gates Foundation / University of Cambridge',
    university: 'University of Cambridge',
    hostCountry: 'United Kingdom',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '£20,000 / year (~£1,666 / month)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Discretionary academic development funding', 'Family allowance if applicable'],
    },
    deadline: '2026-12-03',
    deadlineStatus: 'open',
    summary: 'One of the world’s most prestigious postgraduate awards. Aims to build a global network of future leaders committed to improving the lives of others through outstanding intellectual ability and commitment to social impact.',
    keyRequirements: [
      'Outstanding intellectual ability (First Class Honours / US GPA 3.8+ or equivalent top 5%)',
      'Admission to a full-time postgraduate course at the University of Cambridge',
      'Commitment to improving the lives of others (proven track record of social engagement)',
      'Leadership capacity',
      'Gates Cambridge reference in addition to 2 academic references'
    ],
    eligibilityCriteria: {
      minGpa: 3.8,
      targetNationalities: ['All Nationalities outside the UK'],
      languageRequirement: 'Cambridge university course English requirements',
    },
    rejectionPitfalls: [
      'Applying with strong grades but zero demonstrable commitment to social contribution or advocacy.',
      'Treating the Gates reference as a regular academic reference (the Gates referee MUST speak specifically to leadership and social impact).',
      'Failing to gain course admission to the University of Cambridge first.',
      'Lack of clear rationale for why Cambridge is uniquely equipped for your research.'
    ],
    insiderTips: [
      'The 500-word Gates statement must balance academic vision with your core values and commitment to public good.',
      'Prepare rigorously for the panel interview with alumni and Cambridge professors.'
    ],
    officialApplicationUrl: 'https://www.gatescambridge.org/apply/overview/',
    contacts: {
      email: 'info@gatescambridge.org',
      inquiryFormUrl: 'https://www.gatescambridge.org/about/contact-us/',
      departmentOrPerson: 'Gates Cambridge Trust, Ground Floor, The Pitt Building, Cambridge',
      notes: 'General queries: info@gatescambridge.org | Telephone: +44 1223 338467'
    },
    defaultChecklist: [
      { title: 'Submit Cambridge Graduate Application form with Gates funding box checked', category: 'submission' },
      { title: 'Draft Gates Cambridge Statement (500 words on social commitment & leadership)', category: 'essay' },
      { title: 'Draft Course-specific Research Proposal or Personal Statement', category: 'essay' },
      { title: 'Secure 2 Academic References for Cambridge admission', category: 'recommendation' },
      { title: 'Secure 1 dedicated Gates Cambridge Referee (assessing leadership & social impact)', category: 'recommendation' },
      { title: 'Provide certified transcripts and degree credentials', category: 'document' }
    ]
  },
  {
    id: 'australia-awards',
    title: 'Australia Awards Scholarships',
    provider: 'Department of Foreign Affairs and Trade (DFAT Australia)',
    university: 'Participating Australian Higher Education Institutions',
    hostCountry: 'Australia',
    degreeLevels: ['Bachelor / Undergraduate', 'Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: [
      'Environment & Agriculture',
      'Medicine & Healthcare',
      'STEM & Computer Science',
      'Social Sciences, Public Policy & Law',
      'Business, Finance & Economics'
    ],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'AUD $30,000 / year contribution to living expenses',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Establishment allowance ($5,000)', 'Introductory Academic Program (IAP)'],
    },
    deadline: '2026-04-30',
    deadlineStatus: 'upcoming',
    summary: 'Long-term awards administered by the Australian Government offering study and research opportunities to individuals from developing countries in the Indo-Pacific, Africa, and Middle East, to drive sustainable development.',
    keyRequirements: [
      'Minimum academic qualification equivalent to Australian bachelor’s or master’s degree',
      'Minimum IELTS 6.5 (no band below 6.0) or TOEFL equivalent',
      'Demonstrated leadership skills and strong development contribution plan for home country',
      'Commitment to leave Australia for at least 2 years following scholarship completion',
      'Align study program with bilateral priority development sectors identified for your country'
    ],
    eligibilityCriteria: {
      minGpa: 3.1,
      targetNationalities: ['Eligible participating countries in Indo-Pacific, South Asia, Africa'],
      returnHomeClause: true,
      languageRequirement: 'IELTS 6.5 (all bands 6.0+) or TOEFL iBT 84',
    },
    rejectionPitfalls: [
      'Selecting a field of study that does not align with your specific country’s priority sectors published in the Australia Awards Country Profile.',
      'Failing to show a clear Reintegration Plan detailing how skills will be applied in your government, NGO, or sector back home.',
      'Applying with an IELTS score where one sub-band is 5.5 (strictly screened out).',
      'Incomplete employment and education verification forms.'
    ],
    insiderTips: [
      'Carefully read the specific Country Profile PDF for your nation on the Australia Awards site before drafting essays.',
      'Show understanding of Australian expertise in your field (e.g. water management, mining governance, public health).'
    ],
    officialApplicationUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
    contacts: {
      email: 'australiaawards@dfat.gov.au',
      inquiryFormUrl: 'https://www.dfat.gov.au/about-us/contact-us',
      departmentOrPerson: 'DFAT Australia Awards Section / In-country Secretariat',
      notes: 'Contact the Australia Awards in-country office for application guidance.'
    },
    defaultChecklist: [
      { title: 'Check Country Profile to confirm priority study sectors', category: 'document' },
      { title: 'Draft Development Impact & Reintegration Plan', category: 'essay' },
      { title: 'Achieve IELTS 6.5+ (minimum 6.0 in all components)', category: 'test' },
      { title: 'Obtain Employer Endorsement and Re-entry letter', category: 'recommendation' },
      { title: 'Certify all transcripts, diplomas, and citizenship documents', category: 'document' },
      { title: 'Submit OASIS online application before deadline', category: 'submission' }
    ]
  },
  {
    id: 'mastercard-foundation-scholars',
    title: 'Mastercard Foundation Scholars Program',
    provider: 'Mastercard Foundation',
    university: 'Partner Universities (McGill, Toronto, Edinburgh, Berkeley, Sciences Po)',
    hostCountry: 'Multiple (USA, Canada, UK, France, African Universities)',
    degreeLevels: ['Bachelor / Undergraduate', 'Master / Postgraduate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'Full living allowance + accommodation',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Laptop, books, mentorship, leadership camp, internship support'],
    },
    deadline: '2026-01-31',
    deadlineStatus: 'upcoming',
    summary: 'A transformative initiative educating and developing young people from Africa who are economically disadvantaged and committed to giving back to their communities through social change and leadership.',
    keyRequirements: [
      'Citizen and resident of an African country',
      'Demonstrated significant financial need and socioeconomic barrier',
      'Proven commitment to community leadership and give-back philosophy',
      'Strong academic potential and completion of secondary/undergraduate degree',
      'Must apply directly through partner institutions (e.g., McGill, Toronto, Edinburgh, UC Berkeley, Sciences Po, Ashesi)'
    ],
    eligibilityCriteria: {
      minGpa: 3.2,
      targetNationalities: ['African Citizens'],
      returnHomeClause: true,
    },
    rejectionPitfalls: [
      'Applying generally on the Mastercard Foundation website (applications are strictly handled by partner universities).',
      'Failing to document financial hardship with honest, verifiable family/income details.',
      'Essays that focus only on personal academic ambition rather than tangible community transformation and give-back history.',
      'Missing the early partner university application deadlines.'
    ],
    insiderTips: [
      'Apply to 2-3 partner universities with Mastercard Scholar programs to increase your odds.',
      'Quantify your community impact: how many students did you tutor, what initiative did you start, who was helped?'
    ],
    officialApplicationUrl: 'https://mastercardfdn.org/all/scholars/',
    contacts: {
      email: 'scholars@mastercardfdn.org',
      inquiryFormUrl: 'https://mastercardfdn.org/contact-us/',
      departmentOrPerson: 'Mastercard Foundation Scholars Program Team',
      notes: 'For application status, contact the admissions office of your target partner institution.'
    },
    defaultChecklist: [
      { title: 'Select 2-3 partner universities from the official list', category: 'custom' },
      { title: 'Gather proof of financial need / socioeconomic circumstance documents', category: 'document' },
      { title: 'Draft Community Leadership & Give-Back Essay', category: 'essay' },
      { title: 'Request 2 reference letters emphasizing character & community impact', category: 'recommendation' },
      { title: 'Submit partner university admission & MCF scholarship form', category: 'submission' }
    ]
  },
  {
    id: 'swiss-government-excellence',
    title: 'Swiss Government Excellence Scholarships',
    provider: 'Federal Commission for Scholarships for Foreign Students (FCS)',
    university: 'Swiss Cantonal Universities, ETH Zurich & EPFL',
    hostCountry: 'Switzerland',
    degreeLevels: ['PhD / Doctorate', 'Postdoc / Fellowship'],
    fieldsOfStudy: ['All / Any Field', 'STEM & Computer Science', 'Medicine & Healthcare'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'CHF 1,920 / month (~$2,150 / month)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Housing allowance (CHF 300 once)', 'Public transport half-fare card'],
    },
    deadline: '2026-11-15',
    deadlineStatus: 'open',
    summary: 'Aimed at young researchers from abroad who have completed a Master’s degree or PhD. Enables candidates to conduct doctoral or postdoctoral research at one of the Swiss public universities, federal institutes of technology (ETH Zurich, EPFL), or research institutes.',
    keyRequirements: [
      'Master’s degree or equivalent completed before 31 July of scholarship year',
      'Mandatory support letter from an academic host professor at a Swiss university willing to supervise',
      'Comprehensive, high-level research proposal including timeframe',
      'Born after 31 December 1989 (for PhD applicants)',
      'Confidential letter of reference from two independent professors'
    ],
    eligibilityCriteria: {
      minGpa: 3.5,
      targetNationalities: ['Over 180 Countries'],
      ageLimit: 'Born after 31 Dec 1989 (PhD)',
      languageRequirement: 'English, French, German, or Italian depending on research lab',
    },
    rejectionPitfalls: [
      'Applying without an official written confirmation letter from a Swiss professor agreeing to host you.',
      'Research proposal is poorly defined or lacks a realistic schedule within the 3-year Swiss doctorate timeframe.',
      'Submitting applications online when the Swiss Embassy in your home country requires physical paper copies in triplicate.',
      'Letters of recommendation submitted directly by the candidate rather than in sealed envelopes or official forms.'
    ],
    insiderTips: [
      'Start contacting prospective Swiss professors 6-9 months before the deadline with a concise 1-page research pitch and your CV.',
      'Verify if your home country Swiss Embassy requires an initial email pre-screening before giving out application packages.'
    ],
    officialApplicationUrl: 'https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html',
    contacts: {
      email: 'sbfi@sbfi.admin.ch',
      inquiryFormUrl: 'https://www.sbfi.admin.ch/sbfi/en/home/services/contact.html',
      departmentOrPerson: 'Federal Commission for Scholarships for Foreign Students FCS',
      notes: 'Official application packages can only be obtained directly from your local Swiss Embassy.'
    },
    defaultChecklist: [
      { title: 'Contact and secure written support letter from Swiss Host Professor', category: 'custom' },
      { title: 'Draft detailed 5-page Research Proposal with Gantt chart & methodology', category: 'essay' },
      { title: 'Request application package from local Swiss Embassy', category: 'document' },
      { title: 'Obtain 2 FCS Confidential Reference Letters in sealed envelopes', category: 'recommendation' },
      { title: 'Complete FCS Health Certificate signed by doctor', category: 'document' },
      { title: 'Submit 3 full paper dossiers (1 original + 2 copies) to Swiss Embassy', category: 'submission' }
    ]
  },
  {
    id: 'gks-korea',
    title: 'Global Korea Scholarship (GKS / KGSP)',
    provider: 'National Institute for International Education (NIIED), Ministry of Education, Korea',
    university: 'Designated Korean Universities (Seoul National, KAIST, Yonsei, Korea Univ)',
    hostCountry: 'South Korea',
    degreeLevels: ['Bachelor / Undergraduate', 'Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'KRW 1,000,000 - 1,500,000 / month (~$800-$1,150)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['1 year Korean language training fully funded', 'Settlement allowance KRW 200,000', 'Degree completion grant'],
    },
    deadline: '2026-03-15',
    deadlineStatus: 'upcoming',
    summary: 'Designed to provide international students with opportunities to conduct undergraduate or graduate studies in higher educational institutions in Korea, promoting international educational exchange and mutual friendship.',
    keyRequirements: [
      'Cumulative GPA above 80% or ranking in top 20% of previous graduating class',
      'Under 25 years old (Undergraduate) or Under 40 years old (Graduate)',
      'Personal Statement and Statement of Purpose / Study Plan',
      '1-2 Recommendation Letters in sealed envelopes',
      'Pass Embassy Track or University Track quota evaluation'
    ],
    eligibilityCriteria: {
      minGpa: 3.2,
      targetNationalities: ['Citizens of partner countries (Korean citizens not eligible)'],
      ageLimit: 'Under 40 for Graduate / Under 25 for Undergrad',
      languageRequirement: 'TOPIK or English test (TOPIK level 3+ preferred but not mandatory for entry)',
    },
    rejectionPitfalls: [
      'Document authentication issues: NIIED strictly rejects photocopies that lack Apostille or Korean Consular legalization.',
      'Applying to both Embassy Track and University Track simultaneously in the same cycle (results in automatic disqualification).',
      'Study plan that is generic and neglects the mandatory 1-year Korean language preliminary training period.',
      'Unsigned forms or missing official medical assessment.'
    ],
    insiderTips: [
      'Embassy track allows you to choose 3 Korean universities, while University track applies to 1 university directly.',
      'Having TOPIK Level 3+ or IELTS 7.0+ gives significant bonus points in the document screening.'
    ],
    officialApplicationUrl: 'https://www.studyinkorea.go.kr/en/scholarship/gks_about.do',
    contacts: {
      email: 'kgspniied@korea.kr',
      inquiryFormUrl: 'https://www.studyinkorea.go.kr/en/community/qna.do',
      departmentOrPerson: 'NIIED GKS Team, Seoul, Republic of Korea',
      notes: 'Consult the Korean Embassy in your home country for country-specific quotas.'
    },
    defaultChecklist: [
      { title: 'Decide between Embassy Track (3 universities) or University Track (1 university)', category: 'custom' },
      { title: 'Draft GKS Personal Statement according to Form 2', category: 'essay' },
      { title: 'Draft Statement of Purpose / Korean Language Study Plan (Form 3)', category: 'essay' },
      { title: 'Obtain Apostille / Consular Legalization for Degree Certificate & Transcript', category: 'document' },
      { title: 'Obtain Proof of Citizenship for applicant and both parents', category: 'document' },
      { title: 'Obtain 1-2 Recommendation Letters in signed/sealed envelopes (Form 5)', category: 'recommendation' },
      { title: 'Submit certified physical dossier to Embassy or University', category: 'submission' }
    ]
  },
  {
    id: 'singa-singapore',
    title: 'Singapore International Graduate Award (SINGA)',
    provider: 'A*STAR, NTU, NUS, SUTD, SMU',
    university: 'National University of Singapore (NUS), NTU, SUTD & SMU',
    hostCountry: 'Singapore',
    degreeLevels: ['PhD / Doctorate'],
    fieldsOfStudy: ['STEM & Computer Science', 'Medicine & Healthcare'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'SGD $2,700 / month (increases to $3,200 after qualifying exam)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['One-time airfare grant SGD $1,500', 'Settlement allowance SGD $1,000'],
    },
    deadline: '2026-06-01',
    deadlineStatus: 'upcoming',
    summary: 'A collaboration between Singapore’s Agency for Science, Technology & Research (A*STAR) and Singapore’s top universities (NUS, NTU, SUTD, SMU). Supports international PhD students in biomedical sciences and physical sciences & engineering in world-class research facilities.',
    keyRequirements: [
      'Open to all international graduates with a passion for research and excellent academic results',
      'Strong undergraduate and/or Master’s degree in STEM fields',
      'Good reports from 2 academic referees',
      'Research proposal aligned with A*STAR or university research projects',
      'No GRE, IELTS, TOEFL required for initial application (though recommended)'
    ],
    eligibilityCriteria: {
      minGpa: 3.4,
      targetNationalities: ['All international students (Singapore citizens/PRs not eligible)'],
      languageRequirement: 'Good reports in spoken and written English',
    },
    rejectionPitfalls: [
      'Selecting research project areas without reviewing the supervisor’s recent publications or A*STAR lab focus.',
      'Referees fail to submit their online recommendation before the referee deadline.',
      'Underestimating the technical interview, which involves deep dive into undergraduate fundamentals and experimental design.',
      'Weak foundational knowledge in laboratory techniques or computational skills.'
    ],
    insiderTips: [
      'Reach out directly to prospective supervisors at A*STAR, NUS, or NTU before applying to express interest in their specific SINGA project.',
      'Highlight any undergraduate publications, conference posters, or software repositories on your CV.'
    ],
    officialApplicationUrl: 'https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa',
    contacts: {
      email: 'singa_enquiries@hq.a-star.edu.sg',
      inquiryFormUrl: 'https://www.a-star.edu.sg/Contact-Us',
      departmentOrPerson: 'A*STAR Graduate Academy, 1 Fusionopolis Way, Singapore',
      notes: 'Email response time is usually 2-4 working days.'
    },
    defaultChecklist: [
      { title: 'Browse A*STAR / NUS / NTU / SUTD research projects and identify 3 supervisors', category: 'custom' },
      { title: 'Contact prospective lab supervisor with CV and short statement', category: 'custom' },
      { title: 'Prepare Research Proposal / Statement of Research Intent', category: 'essay' },
      { title: 'Enter details of 2 Academic Referees on SINGA portal', category: 'recommendation' },
      { title: 'Upload certified transcripts, graduation certificates, and passport copy', category: 'document' },
      { title: 'Submit online application and monitor referee submission status', category: 'submission' }
    ]
  },
  {
    id: 'turkiye-burslari',
    title: 'Türkiye Scholarships (Türkiye Bursları)',
    provider: 'Presidency for Turks Abroad and Related Communities (YTB)',
    university: 'Top Turkish Public & Private Universities',
    hostCountry: 'Turkey',
    degreeLevels: ['Bachelor / Undergraduate', 'Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'TRY 3,500 - 6,000 / month + Free accommodation',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Free university dormitory accommodation', '1 year Turkish language course (C1 level)'],
    },
    deadline: '2026-02-20',
    deadlineStatus: 'upcoming',
    summary: 'A government-funded, competitive higher education scholarship program for international students to pursue full-time or short-term programs at top universities in Turkey. Offers combined university placement and scholarship package.',
    keyRequirements: [
      'Minimum academic achievement: 70% for Bachelor, 75% for Master/PhD, 90% for Health Sciences',
      'Under 21 (Bachelor), Under 30 (Master), Under 35 (PhD)',
      'Letter of Intent explaining why Turkey, choice of 12 university departments, and career goals',
      'Academic transcripts, diplomas, international test scores (if available)',
      'Face-to-face or online interview with Turkish academic committee'
    ],
    eligibilityCriteria: {
      minGpa: 3.0,
      targetNationalities: ['Citizens of all countries (except Turkish citizens)'],
      ageLimit: 'Under 21 (UG), Under 30 (Master), Under 35 (PhD)',
    },
    rejectionPitfalls: [
      'Choosing 12 universities without checking department language of instruction (some require SAT or English proof; Turkish-taught programs require language prep).',
      'Copy-pasting letters of intent from online forums without specific interest in Turkey’s regional role or university curriculum.',
      'Low academic score in core subjects related to the chosen field (e.g. applying to Engineering with weak mathematics scores).',
      'Poor performance in the short math/logic test administered prior to the interview for undergraduate applicants.'
    ],
    insiderTips: [
      'Fill every optional field in the TBBS system (awards, social projects, certificates, language certificates) to boost your ranking score.',
      'Select a balanced mix of top-tier universities (METU, Bogazici, ITU, Istanbul Uni) and reputable provincial universities.'
    ],
    officialApplicationUrl: 'https://www.turkiyeburslari.gov.tr/',
    contacts: {
      email: 'info@turkiyeburslari.gov.tr',
      inquiryFormUrl: 'https://www.turkiyeburslari.gov.tr/contact',
      departmentOrPerson: 'YTB Türkiye Scholarships Call Center (+90 850 455 0 982)',
      notes: 'Support available in Turkish, English, Arabic, French, Russian.'
    },
    defaultChecklist: [
      { title: 'Create account on TBBS portal and complete 10 profile sections', category: 'document' },
      { title: 'Select 12 university departments across Turkey', category: 'custom' },
      { title: 'Draft Letter of Intent (Personal background, Why Turkey, Future career plan)', category: 'essay' },
      { title: 'Upload academic transcripts, certificates, extracurricular activities, and awards', category: 'document' },
      { title: 'Obtain 1-2 Academic Reference Letters', category: 'recommendation' },
      { title: 'Submit online application and prepare for in-person Embassy interview', category: 'submission' }
    ]
  },
  {
    id: 'swedish-institute-sisgp',
    title: 'Swedish Institute Scholarships for Global Professionals (SISGP)',
    provider: 'Swedish Institute (Government of Sweden)',
    university: 'Eligible Swedish Universities (KTH, Lund, Uppsala, Chalmers)',
    hostCountry: 'Sweden',
    degreeLevels: ['Master / Postgraduate'],
    fieldsOfStudy: ['All / Any Field', 'STEM & Computer Science', 'Environment & Agriculture', 'Social Sciences, Public Policy & Law', 'Business, Finance & Economics'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'SEK 12,000 / month (~$1,150 / month)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Travel grant of SEK 10,000-15,000', 'Membership in SI Network for Future Global Leaders (NFGL)'],
    },
    deadline: '2026-02-28',
    deadlineStatus: 'upcoming',
    summary: 'A highly competitive Swedish government scholarship for ambitious professionals from 41 eligible countries. Covers full tuition, monthly living expenses, travel grant, and health insurance for full-time 1-year or 2-year Master’s programmes in Sweden.',
    keyRequirements: [
      'Citizenship of an eligible SI country (41 developing/partner countries)',
      'Minimum of 3,000 hours of demonstrated work experience prior to application',
      'Demonstrated leadership experience (from current or previous employment or civil society)',
      'Admitted to an eligible Swedish Master’s programme via University Admissions Sweden',
      'Mandatory use of official SI templates for CV, Proof of Work Experience, and Letters of Reference'
    ],
    eligibilityCriteria: {
      minGpa: 3.2,
      targetNationalities: ['41 Eligible Countries (Armenia, Bangladesh, Bolivia, Brazil, Cambodia, Colombia, Egypt, Ghana, Kenya, Nigeria, Pakistan, Philippines, Vietnam, etc.)'],
      minWorkExperienceYears: 2,
      languageRequirement: 'Meet University Admissions Sweden English requirement (IELTS 6.5 / TOEFL 90)',
    },
    rejectionPitfalls: [
      'Not using the exact official Swedish Institute PDF templates for CV, Proof of Work, or Reference Letters.',
      'Failing to submit the University Admissions Sweden master application first and pay the university application fee.',
      'Work experience calculation that fails to reach the 3,000 hours threshold or lacks official employer stamp.',
      'Selecting a master’s program not on the official list of ~700 eligible SI Master’s degrees.'
    ],
    insiderTips: [
      'Download the official SI Work Experience and Leadership template months in advance so your employer has time to sign and stamp it.',
      'Your leadership examples do not require being a senior manager; leading a project, mentoring juniors, or founding an initiative qualifies.'
    ],
    officialApplicationUrl: 'https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/',
    contacts: {
      email: 'sischolarships@si.se',
      inquiryFormUrl: 'https://si.se/en/about-si/contact-us/',
      departmentOrPerson: 'Swedish Institute Scholarship Unit, Stockholm',
      notes: 'Support team typically replies within 2-3 business days during the open call window.'
    },
    defaultChecklist: [
      { title: 'Apply to up to 4 eligible Swedish Master’s programs on universityadmissions.se', category: 'submission' },
      { title: 'Complete official SI CV template (max 3 pages)', category: 'document' },
      { title: 'Complete official SI Proof of Work Experience & Leadership form (signed & stamped)', category: 'document' },
      { title: 'Obtain 2 official SI Reference Letters on prescribed SI forms', category: 'recommendation' },
      { title: 'Upload copy of valid passport', category: 'document' },
      { title: 'Submit SI scholarship portal application using your 8-digit University Admissions application number', category: 'submission' }
    ]
  },
  {
    id: 'eiffel-excellence-france',
    title: 'Eiffel Excellence Scholarship Program',
    provider: 'French Ministry for Europe and Foreign Affairs (Campus France)',
    university: 'French Universities & Grandes Écoles',
    hostCountry: 'France',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['STEM & Computer Science', 'Business, Finance & Economics', 'Social Sciences, Public Policy & Law'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '€1,181 / month (Master) | €1,800 / month (PhD)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Housing allowance subsidy', 'Cultural activities and travel card', 'Campus France priority arrival support'],
    },
    deadline: '2026-01-10',
    deadlineStatus: 'upcoming',
    summary: 'France’s premier scholarship tool developed by the Ministry of Foreign Affairs to enable French higher education institutions to attract top foreign students for Master’s and PhD programs in engineering, sciences, economics, management, law, and political science.',
    keyRequirements: [
      'Foreign nationality (French dual citizens not eligible)',
      'Age limit: Up to 25 years old for Master’s candidates; up to 30 years old for PhD candidates',
      'Excellence of the student as evidenced by past academic achievements (top 10% class rank / GPA 3.5+)',
      'Direct nomination by a French higher education institution (students cannot apply directly to Campus France)',
      'Language proficiency required by the specific master program (English or French)'
    ],
    eligibilityCriteria: {
      minGpa: 3.5,
      targetNationalities: ['All international students (non-French)'],
      ageLimit: 'Under 25 (Master) / Under 30 (PhD)',
      languageRequirement: 'B2/C1 English or French depending on course',
    },
    rejectionPitfalls: [
      'Attempting to submit an application directly to Campus France (all applications must be screened and officially submitted by the French university).',
      'Applying to a French institution after their internal Eiffel pre-selection deadline (which is usually in November/December, before the January national deadline).',
      'Age limit exceeded on the date of committee evaluation.',
      'Applying to non-eligible study fields (arts/humanities without policy/law component are generally excluded).'
    ],
    insiderTips: [
      'Contact the international relations office of your chosen French Grande École or University in October/November to ask for Eiffel endorsement.',
      'French universities are only allowed to nominate a limited quota of students, so reaching out early with a stellar academic dossier is vital.'
    ],
    officialApplicationUrl: 'https://www.campusfrance.org/en/the-eiffel-scholarship-program',
    contacts: {
      email: 'candidatures.eiffel@campusfrance.org',
      inquiryFormUrl: 'https://www.campusfrance.org/en/contact-us',
      departmentOrPerson: 'Campus France Eiffel Scholarship Unit, Paris',
      notes: 'Direct queries should be channeled through the international admissions bureau of your French university.'
    },
    defaultChecklist: [
      { title: 'Identify eligible French universities / Grandes Écoles and apply for course admission', category: 'submission' },
      { title: 'Request French university to submit your file for Eiffel Scholarship endorsement', category: 'custom' },
      { title: 'Provide certified transcripts, ranking certificate (top 10%), and degree diplomas', category: 'document' },
      { title: 'Draft tailored Resume/CV and Statement of Professional Objectives in France', category: 'essay' },
      { title: 'Provide 2 academic reference letters to French university coordinator', category: 'recommendation' }
    ]
  },
  {
    id: 'knight-hennessy-stanford',
    title: 'Knight-Hennessy Scholars at Stanford University',
    provider: 'Knight-Hennessy Scholars / Stanford University',
    university: 'Stanford University',
    hostCountry: 'United States',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '$40,000+ / year living stipend + Stanford tuition',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Global leadership development program at Denning House', 'Conference and research travel grant'],
    },
    deadline: '2026-10-08',
    deadlineStatus: 'open',
    summary: 'The largest fully endowed graduate fellowship in the world. Prepares a diverse, multidisciplinary community of emerging leaders to address complex global challenges while pursuing any graduate degree at Stanford University (JD, MA, MBA, MD, MFA, MS, PhD).',
    keyRequirements: [
      'Open to citizens of all countries worldwide',
      'Earned first bachelor’s degree within the last 7 years',
      'Must apply separately to both Knight-Hennessy Scholars and an eligible full-time Stanford graduate degree program',
      'Demonstrated independence of thought, purposeful leadership, and civic mindset',
      'Online application with 3 short-answer prompts, 2 essays, video statement, and 2 reference letters'
    ],
    eligibilityCriteria: {
      minGpa: 3.7,
      targetNationalities: ['All Nationalities Worldwide'],
      languageRequirement: 'Stanford graduate department TOEFL/GRE requirements',
    },
    rejectionPitfalls: [
      'Applying to Knight-Hennessy but failing to submit the Stanford graduate program department application by its respective deadline.',
      'Essays that present generic leadership credentials instead of authentic storytelling showing self-awareness, moral courage, and vulnerability.',
      'Bachelor’s degree was conferred more than 7 years prior to the application deadline.',
      'Recommenders who merely repeat resume points rather than providing detailed anecdotes of your character under pressure.'
    ],
    insiderTips: [
      'In the "Connect the Dots" essay, reflect deeply on the pivotal life moments that shaped who you are today.',
      'Show clear multidisciplinary curiosity — explain how collaborating with doctors, engineers, and policymakers at Stanford will enhance your vision.'
    ],
    officialApplicationUrl: 'https://knight-hennessy.stanford.edu/admissions',
    contacts: {
      email: 'kh-admissions@stanford.edu',
      inquiryFormUrl: 'https://knight-hennessy.stanford.edu/contact',
      departmentOrPerson: 'Denning House, 580 Lomita Drive, Stanford University, CA 94305',
      notes: 'Weekly online Q&A webinars and information sessions available during application cycles.'
    },
    defaultChecklist: [
      { title: 'Submit online Knight-Hennessy Scholars application', category: 'submission' },
      { title: 'Submit separate Stanford University graduate department degree application', category: 'submission' },
      { title: 'Draft KHS Essay 1: "Connect the dots that brought you to where you are today"', category: 'essay' },
      { title: 'Draft KHS Essay 2: "How will your Stanford degree enable you to effect change?"', category: 'essay' },
      { title: 'Record and submit the 2-minute spontaneous video statement', category: 'custom' },
      { title: 'Secure 2 KHS recommendation letters from mentors who know your character', category: 'recommendation' }
    ]
  },
  {
    id: 'eth-zurich-esop',
    title: 'ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)',
    provider: 'ETH Zurich (Swiss Federal Institute of Technology)',
    university: 'ETH Zurich (Swiss Federal Institute of Technology)',
    hostCountry: 'Switzerland',
    degreeLevels: ['Master / Postgraduate'],
    fieldsOfStudy: ['STEM & Computer Science', 'Environment & Agriculture'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'CHF 12,000 / semester (~CHF 2,000 / month = $2,250/mo)',
      airfare: false,
      healthInsurance: true,
      visaFees: false,
      otherBenefits: ['Full tuition waiver CHF 730/semester', 'Mentorship and network of ETH Foundation'],
    },
    deadline: '2026-12-15',
    deadlineStatus: 'open',
    summary: 'ETH Zurich supports outstanding students wishing to pursue a Master’s degree with the Excellence Scholarship & Opportunity Programme (ESOP). Awarded purely based on outstanding academic achievement (Grade A / Top 10% of bachelor class).',
    keyRequirements: [
      'Very good result in Bachelor’s degree (top 10% of Bachelor’s degree programme = Grade A / GPA 3.8+)',
      'Pre-proposal for a Master’s thesis (substantive 3-4 page research proposal with scientific methodology)',
      'Two independent letters of recommendation from professors',
      'Apply during the December international application window for Master’s admission at ETH Zurich'
    ],
    eligibilityCriteria: {
      minGpa: 3.8,
      targetNationalities: ['All Nationalities Worldwide'],
      languageRequirement: 'C1 English proficiency (IELTS 7.0+ / TOEFL 100+)',
    },
    rejectionPitfalls: [
      'Submitting a superficial or plagiarized master thesis pre-proposal (must follow scientific citation standards and include novel hypotheses).',
      'GPA is below the top 10% class threshold (ETH strictly filters applicants based on mathematics and technical rigor).',
      'Missing the December 15 international application deadline.',
      'References not submitted directly by professors via the eApply portal.'
    ],
    insiderTips: [
      'The Master’s thesis pre-proposal is the decisive evaluation factor; formulate a crisp scientific problem statement, state of the art, and experimental methodology.',
      'Check the ETH Zurich professor directories to cite relevant research labs at ETH in your proposal.'
    ],
    officialApplicationUrl: 'https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html',
    contacts: {
      email: 'studienfinanzierung@sts.ethz.ch',
      inquiryFormUrl: 'https://ethz.ch/en/utils/contact.html',
      departmentOrPerson: 'ETH Zurich Financial Aid Office, Rämistrasse 101, 8092 Zurich',
      notes: 'Telephone: +41 44 632 20 40 | Email queries answered within 3-4 working days.'
    },
    defaultChecklist: [
      { title: 'Submit ETH Zurich Master’s degree application via eApply portal', category: 'submission' },
      { title: 'Write 3-4 page Master’s Thesis Pre-Proposal with scientific bibliography', category: 'essay' },
      { title: 'Provide official class rank certificate proving top 10% standing', category: 'document' },
      { title: 'Obtain 2 academic reference letters from university professors', category: 'recommendation' },
      { title: 'Provide official English C1 test certificate (TOEFL 100+ / IELTS 7.0+)', category: 'test' }
    ]
  },
  {
    id: 'vanier-canada-graduate',
    title: 'Vanier Canada Graduate Scholarships (Vanier CGS)',
    provider: 'Government of Canada (CIHR, NSERC, SSHRC)',
    university: 'Canadian Universities with Vanier CGS Quotas (U of T, UBC, McGill)',
    hostCountry: 'Canada',
    degreeLevels: ['PhD / Doctorate'],
    fieldsOfStudy: ['STEM & Computer Science', 'Medicine & Healthcare', 'Social Sciences, Public Policy & Law'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'CAD $50,000 / year for 3 years',
      airfare: false,
      healthInsurance: true,
      visaFees: false,
      otherBenefits: ['Prestigious Canadian doctoral credential recognized worldwide'],
    },
    deadline: '2026-11-01',
    deadlineStatus: 'open',
    summary: 'The Government of Canada launched the Vanier Canada Graduate Scholarships program to strengthen Canada’s ability to attract and retain world-class doctoral students and establish Canada as a global centre of excellence in research and higher learning.',
    keyRequirements: [
      'Nominated by only one Canadian institution with a Vanier CGS quota',
      'Pursuing first doctoral degree (including joint MD/PhD, DVM/PhD)',
      'First-class academic average (GPA 3.7+ / A- equivalent) in each of the last two years of full-time study',
      'Demonstrated high leadership skills and proven potential for academic excellence',
      'Two Leadership Reference Letters and two Academic Reference Letters'
    ],
    eligibilityCriteria: {
      minGpa: 3.7,
      targetNationalities: ['Canadian citizens, permanent residents, and foreign citizens'],
      languageRequirement: 'English or French proficiency meeting Canadian university requirements',
    },
    rejectionPitfalls: [
      'Applying directly to the Vanier secretariat rather than being nominated by a Canadian university graduate studies department.',
      'Missing the internal university deadline (often in September/October, well before the national deadline in November).',
      'Leadership reference letters that focus only on academic awards rather than civic initiative, team leadership, or community mobilization.',
      'Research proposal that does not clearly explain the broader societal and economic impacts for Canada and the world.'
    ],
    insiderTips: [
      'Reach out to prospective Canadian PhD supervisors in the summer (July/August) to secure their commitment to nominate you.',
      'Structure the 2-page Research Proposal with clear subheadings: Background, Objectives, Methodology, and Significance.'
    ],
    officialApplicationUrl: 'https://vanier.gc.ca/en/home-accueil.html',
    contacts: {
      email: 'vanier@cihr-irsc.gc.ca',
      inquiryFormUrl: 'https://vanier.gc.ca/en/contact-contactez.html',
      departmentOrPerson: 'Vanier CGS Secretariat, Ottawa, ON, Canada',
      notes: 'Inquiries regarding institutional quotas should be directed to the target university graduate office.'
    },
    defaultChecklist: [
      { title: 'Contact Canadian university supervisor and secure commitment to sponsor Vanier nomination', category: 'custom' },
      { title: 'Complete ResearchNet online application dossier', category: 'submission' },
      { title: 'Draft 2-page Doctoral Research Proposal & bibliography', category: 'essay' },
      { title: 'Draft 2-page Personal Leadership Statement', category: 'essay' },
      { title: 'Obtain 2 Leadership Reference Letters and 2 Academic Assessment Letters', category: 'recommendation' },
      { title: 'Upload certified official transcripts from all post-secondary institutions', category: 'document' }
    ]
  },
  {
    id: 'manaaki-new-zealand',
    title: 'Manaaki New Zealand Scholarships',
    provider: 'Ministry of Foreign Affairs and Trade (MFAT New Zealand)',
    university: 'New Zealand Universities (Auckland, Otago, Canterbury, Victoria)',
    hostCountry: 'New Zealand',
    degreeLevels: ['Bachelor / Undergraduate', 'Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: [
      'Environment & Agriculture',
      'STEM & Computer Science',
      'Social Sciences, Public Policy & Law',
      'Business, Finance & Economics'
    ],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'NZD $531 / week (~NZD $2,300 / month = $1,400/mo)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Establishment allowance (NZD $3,000)', 'Medical & travel insurance', 'Thesis & research allowance for postgrads'],
    },
    deadline: '2026-02-28',
    deadlineStatus: 'upcoming',
    summary: 'Funded through the New Zealand Aid Programme, Manaaki New Zealand Scholarships build potential leaders who will contribute to the sustainable development of their home countries across the Pacific, Asia, Africa, Caribbean, and Latin America.',
    keyRequirements: [
      'Citizen of an eligible country and have resided there for at least 2 years',
      'Minimum 18 years old at the time of commencing scholarship',
      'Minimum 1 year of full-time work experience (or 2 years part-time) related to chosen study field',
      'Commitment to return to home country for at least 2 years following scholarship completion',
      'Proposed study must align with New Zealand’s priority sectors for your country (Renewable Energy, Climate Resilience, Food Security, Governance)'
    ],
    eligibilityCriteria: {
      minGpa: 3.0,
      targetNationalities: ['Eligible countries in Pacific, Asia, Africa, Latin America, Caribbean'],
      minWorkExperienceYears: 1,
      returnHomeClause: true,
      languageRequirement: 'IELTS 6.5 (no band below 6.0) or TOEFL 90 (writing 21+)',
    },
    rejectionPitfalls: [
      'Applying for a subject area not listed under your specific country’s priority development sectors.',
      'Failing the initial online eligibility test on the MFAT portal (must answer honestly and meet all residency/work criteria).',
      'Weak explanation of how the qualification will be practically implemented in your home community upon return.',
      'Submitting incomplete work experience records.'
    ],
    insiderTips: [
      'Complete the Manaaki online eligibility questionnaire early to receive your portal access token.',
      'Highlight concrete development challenges in your home country that New Zealand has world-class expertise in solving.'
    ],
    officialApplicationUrl: 'https://www.nzscholarships.govt.nz/',
    contacts: {
      email: 'scholarships@mfat.govt.nz',
      inquiryFormUrl: 'https://www.nzscholarships.govt.nz/en/new-zealand-scholarships/contact-us/',
      departmentOrPerson: 'MFAT Scholarships Team, Wellington, New Zealand',
      notes: 'Detailed country-specific priority guides available on the official website.'
    },
    defaultChecklist: [
      { title: 'Complete online Manaaki Eligibility Self-Assessment test', category: 'document' },
      { title: 'Check Country Priority Sectors and select approved NZ university course', category: 'custom' },
      { title: 'Draft Development Contribution and Home Reintegration Essays', category: 'essay' },
      { title: 'Prepare certified proof of citizenship and 2 years home residency', category: 'document' },
      { title: 'Obtain IELTS / TOEFL score report meeting NZ university requirements', category: 'test' },
      { title: 'Submit MFAT online scholarship application before portal closing', category: 'submission' }
    ]
  },
  {
    id: 'rhodes-oxford',
    title: 'Rhodes Scholarship at University of Oxford',
    provider: 'The Rhodes Trust / University of Oxford',
    university: 'University of Oxford',
    hostCountry: 'United Kingdom',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['All / Any Field'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '£19,092 / year (~£1,591 / month)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Oxford University application fee waiver', 'Leadership retreat and Warden seminars at Rhodes House'],
    },
    deadline: '2026-10-01',
    deadlineStatus: 'open',
    summary: 'The world’s oldest and most renowned international graduate fellowship. Selects exceptional young people from around the globe with outstanding intellect, character, leadership, and commitment to service to study at the University of Oxford.',
    keyRequirements: [
      'First-class honours degree or equivalent (GPA 3.8+ / top 5%)',
      'Between 18 and 24 years old (or up to 27 for candidates completing second degree)',
      'Proven literary and scholastic attainments, energy to use one’s talents to the full (sports/arts), and devotion to duty',
      'Personal statement (strict guidelines on zero AI/third-party coaching)',
      'Academic statement of study and 4 to 6 letters of recommendation'
    ],
    eligibilityCriteria: {
      minGpa: 3.8,
      targetNationalities: ['Rhodes Constituencies (Global, India, US, Canada, Southern Africa, West Africa, East Africa, Pakistan, Syria/Jordan/Lebanon, China, Australia, etc.)'],
      ageLimit: 'Age 18-24 (exceptions up to 27)',
      languageRequirement: 'Oxford University English proficiency standards',
    },
    rejectionPitfalls: [
      'Personal statement that violates the strict Rhodes Trust certification rules regarding independent authorship.',
      'Applying with brilliant academic grades but zero demonstrable record of standing up for others or leadership in high-friction environments.',
      'Weak academic rationale for the specific Oxford degree.',
      'Inability to handle the rigorous final round in-person interviews and social dinner with national selection trustees.'
    ],
    insiderTips: [
      'The Rhodes Trust looks for "moral force of character and instincts to lead". Showcase authentic moments where you took risks to help others.',
      'Read extensively on current global affairs to prepare for wide-ranging questions during the selection dinner and interview.'
    ],
    officialApplicationUrl: 'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
    contacts: {
      email: 'scholarship.queries@rhodeshouse.ox.ac.uk',
      inquiryFormUrl: 'https://www.rhodeshouse.ox.ac.uk/contact-us/',
      departmentOrPerson: 'Rhodes House, South Parks Road, Oxford, OX1 3RG, UK',
      notes: 'Contact the National Secretary for your specific constituency for interview logistics.'
    },
    defaultChecklist: [
      { title: 'Check constituency eligibility criteria and age requirements', category: 'document' },
      { title: 'Draft Rhodes Personal Statement (adhering strictly to independent authorship rules)', category: 'essay' },
      { title: 'Draft Academic Statement of Study at Oxford (rationalizing course selection)', category: 'essay' },
      { title: 'Secure 4 to 6 recommendation letters (at least 3 academic referees)', category: 'recommendation' },
      { title: 'Provide certified university transcripts and proof of age/citizenship', category: 'document' },
      { title: 'Submit Rhodes Trust online portal application before constituency deadline', category: 'submission' }
    ]
  },
  {
    id: 'lester-b-pearson-toronto',
    title: 'Lester B. Pearson International Scholarship',
    provider: 'University of Toronto',
    university: 'University of Toronto',
    hostCountry: 'Canada',
    degreeLevels: ['Bachelor / Undergraduate'],
    fieldsOfStudy: ['All / Any Field', 'STEM & Computer Science', 'Business, Finance & Economics', 'Arts & Humanities'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: 'Full residence room and board + incidentals',
      airfare: false,
      healthInsurance: true,
      visaFees: false,
      otherBenefits: ['Full book allowance and incidental fees covered for 4 undergraduate years'],
    },
    deadline: '2026-01-15',
    deadlineStatus: 'upcoming',
    summary: 'The University of Toronto’s most prestigious and competitive international undergraduate award. Recognizes outstanding high school students worldwide who demonstrate exceptional academic achievement, creative thinking, and community leadership.',
    keyRequirements: [
      'International student nominated by their secondary school (high school)',
      'Currently in final year of secondary school or graduated no earlier than June of preceding year',
      'Demonstrated exceptional academic achievement, creativity, and enthusiasm for learning',
      'Apply to undergraduate studies at University of Toronto (OUAC / U of T portal)',
      'Complete Pearson online student application after school nomination is received'
    ],
    eligibilityCriteria: {
      minGpa: 3.8,
      targetNationalities: ['All international students (non-Canadian citizens requiring study permit)'],
      languageRequirement: 'U of T English language facility requirements (IELTS 6.5+ / TOEFL 100+)',
    },
    rejectionPitfalls: [
      'Failing to get officially nominated by your high school counselor/principal (schools must submit the nomination form first).',
      'Submitting the U of T application for admission after the Pearson scholarship document deadline.',
      'Essays that only list accomplishments without showing originality, intellectual curiosity, or empathy.',
      'High school failing to complete the verification letter.'
    ],
    insiderTips: [
      'Speak to your high school counselor in September/October to ensure your school is registered as a nominating institution with U of T.',
      'Highlight unique independent projects, research, arts, or grassroots social ventures you spearheaded.'
    ],
    officialApplicationUrl: 'https://future.utoronto.ca/pearson/about/',
    contacts: {
      email: 'pearson.scholarship@utoronto.ca',
      inquiryFormUrl: 'https://future.utoronto.ca/contact-us/',
      departmentOrPerson: 'University of Toronto Admissions & Award Office',
      notes: 'Schools that are not yet registered can request a school nomination verification form.'
    },
    defaultChecklist: [
      { title: 'Secure official high school nomination from guidance counselor or principal', category: 'custom' },
      { title: 'Submit University of Toronto undergraduate application via OUAC or U of T portal', category: 'submission' },
      { title: 'Receive unique Pearson scholarship link and complete student application', category: 'submission' },
      { title: 'Draft Pearson Creative Essay & Leadership Philosophy Statement', category: 'essay' },
      { title: 'Submit official high school transcripts and predicted grades', category: 'document' }
    ]
  },
  {
    id: 'kaust-fellowship-saudi',
    title: 'KAUST Fellowship for MS and PhD',
    provider: 'King Abdullah University of Science and Technology',
    university: 'King Abdullah University of Science and Technology (KAUST)',
    hostCountry: 'Saudi Arabia',
    degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'],
    fieldsOfStudy: ['STEM & Computer Science', 'Environment & Agriculture'],
    fundingType: 'Fully Funded',
    financialCoverage: {
      tuition: true,
      livingStipend: true,
      stipendAmount: '$20,000 - $30,000 / year ($1,666 - $2,500 / month)',
      airfare: true,
      healthInsurance: true,
      visaFees: true,
      otherBenefits: ['Free on-campus private housing/apartment', 'Relocation support and annual return flights', 'State-of-the-art laboratory access on the Red Sea'],
    },
    deadline: '2026-01-07',
    deadlineStatus: 'upcoming',
    summary: 'All admitted graduate students at KAUST receive the KAUST Fellowship, which provides full financial support throughout the duration of their graduate studies (MS and PhD degrees in world-class STEM disciplines).',
    keyRequirements: [
      'Bachelor’s or Master’s degree in relevant STEM discipline with strong GPA (typically 3.5+ on 4.0 scale)',
      'Official TOEFL iBT score minimum 79 or IELTS minimum 6.5 (institution code 4107)',
      'Statement of Purpose describing academic interests and future career goals',
      '3 Letters of Recommendation from academic professors',
      'Official transcripts from all post-secondary institutions attended'
    ],
    eligibilityCriteria: {
      minGpa: 3.5,
      targetNationalities: ['All Nationalities Worldwide'],
      languageRequirement: 'TOEFL iBT 79+ or IELTS 6.5+ (exempt for English native speakers / degrees from English universities)',
    },
    rejectionPitfalls: [
      'Applying with weak foundations in core mathematics or fundamental sciences.',
      'Statement of Purpose that is generic and does not mention specific KAUST research centers or faculty laboratories.',
      'Recommenders failing to submit recommendation forms on the online portal.',
      'Poor performance in the technical academic interview conducted by KAUST faculty.'
    ],
    insiderTips: [
      'Browse KAUST faculty profiles and cite 2-3 professors whose recent Red Sea or supercomputing research intersects with your interests.',
      'GRE scores are not strictly mandatory but submitting a strong quantitative GRE score (160+) strongly boosts your application.'
    ],
    officialApplicationUrl: 'https://admissions.kaust.edu.sa/fellowship.html',
    contacts: {
      email: 'admissions@kaust.edu.sa',
      inquiryFormUrl: 'https://admissions.kaust.edu.sa/contact-us.html',
      departmentOrPerson: 'KAUST Office of Admissions, Thuwal 23955, Kingdom of Saudi Arabia',
      notes: 'Response time is typically 2-3 business days.'
    },
    defaultChecklist: [
      { title: 'Submit KAUST online graduate admissions application', category: 'submission' },
      { title: 'Draft Statement of Purpose referencing target KAUST research centers', category: 'essay' },
      { title: 'Upload official transcripts with graduation certificates in English', category: 'document' },
      { title: 'Enter details for 3 academic referees on the admissions portal', category: 'recommendation' },
      { title: 'Provide official IELTS 6.5+ or TOEFL 79+ score report', category: 'test' },
      { title: 'Prepare for technical video interview with faculty committee', category: 'custom' }
    ]
  }
];
