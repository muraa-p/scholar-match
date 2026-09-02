import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initialScholarships } from '../src/data/scholarshipsData';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log(`Seeding ${initialScholarships.length} scholarships...`);

  for (const s of initialScholarships) {
    const row = {
      external_id: s.id,
      title: s.title,
      provider: s.provider,
      university: s.university || null,
      host_country: s.hostCountry,
      degree_levels: s.degreeLevels,
      fields_of_study: s.fieldsOfStudy,
      funding_type: s.fundingType,
      financial_coverage: s.financialCoverage,
      deadline: s.deadline,
      deadline_status: s.deadlineStatus,
      summary: s.summary,
      key_requirements: s.keyRequirements,
      eligibility_criteria: s.eligibilityCriteria,
      rejection_pitfalls: s.rejectionPitfalls,
      insider_tips: s.insiderTips,
      official_application_url: s.officialApplicationUrl || null,
      contacts: s.contacts,
      default_checklist: s.defaultChecklist || [],
      source_name: 'seed',
      is_custom: false,
      is_active: true,
    };

    const { error } = await admin
      .from('scholarships')
      .upsert(row, { onConflict: 'external_id' });

    if (error) {
      console.error(`  ✗ ${s.title}: ${error.message}`);
    } else {
      console.log(`  ✓ ${s.title}`);
    }
  }

  const { count } = await admin.from('scholarships').select('id', { count: 'exact', head: true });
  console.log(`\nTotal scholarships in DB: ${count}`);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
