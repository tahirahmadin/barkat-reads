/**
 * Categories are driven by the backend. This file only provides:
 * - Helpers to map between display names and slugs for filtering/sync
 */

/** Category display name (e.g. from cards API). Use string so backend can add new categories. */
export type ContentCategory = string;

/** Map card category (display name) to backend preference slug. Used for filtering and sync. */
export function categoryNameToSlug(category: string): string {
  const k = String(category).toLowerCase().replace(/-/g, ' ');
  if (k === 'hadis' || k === 'hadith') return 'hadith';
  if (k === 'dua') return 'dua';
  if (k === 'prophet stories' || k === 'prophet_stories' || k === 'stories') return 'prophet-stories';
  if (k === 'quran surah' || k === 'quran_surah' || k === 'quran') return 'quran-surah';
  if (k === 'islamic facts' || k === 'islamic_facts' || k === 'facts') return 'islamic-facts';
  return k.replace(/\s+/g, '-');
}

/** Map slug to display name (e.g. for screen title when categoryLabel not passed). */
export function slugToDisplayName(slug: string): string {
  const v = String(slug).toLowerCase().replace(/-/g, ' ');
  if (v === 'hadis' || v === 'hadith') return 'Hadis';
  if (v === 'dua') return 'Dua';
  if (v === 'prophet stories' || v === 'prophet_stories' || v === 'stories') return 'Prophet Stories';
  if (v === 'quran surah' || v === 'quran_surah' || v === 'quran') return 'Quran Surah';
  if (v === 'islamic facts' || v === 'islamic_facts' || v === 'facts') return 'Islamic Facts';
  return slug;
}

/** Normalize API category value to a consistent display name for cards. */
export function normalizeCategoryDisplayName(apiValue: string): string {
  const lower = String(apiValue).toLowerCase();
  if (lower === 'hadis' || lower === 'hadith') return 'Hadis';
  if (lower === 'dua') return 'Dua';
  if (lower === 'prophet stories' || lower === 'prophet_stories' || lower === 'stories') return 'Prophet Stories';
  if (lower === 'quran surah' || lower === 'quran_surah' || lower === 'quran') return 'Quran Surah';
  if (lower === 'islamic facts' || lower === 'islamic_facts' || lower === 'facts') return 'Islamic Facts';
  if (apiValue.length > 0) return apiValue.charAt(0).toUpperCase() + apiValue.slice(1).toLowerCase();
  return 'Islamic Facts';
}

export const FIXED_USER_EMAIL = 'tahir@sayy.ai';
