export type ContentCategory =
  | 'Hadis'
  | 'Dua'
  | 'Prophet Stories'
  | 'Quran Surah'
  | 'Islamic Facts';

export const CONTENT_CATEGORIES: readonly ContentCategory[] = [
  'Hadis',
  'Dua',
  'Prophet Stories',
  'Quran Surah',
  'Islamic Facts',
];

export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {
  Hadis: 'Hadis',
  Dua: 'Dua',
  'Prophet Stories': 'Prophet Stories',
  'Quran Surah': 'Quran Surah',
  'Islamic Facts': 'Islamic Facts',
};

export const FIXED_USER_EMAIL = 'tahir@sayy.ai';
