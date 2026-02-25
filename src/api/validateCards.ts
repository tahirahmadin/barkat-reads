import type { CardFromAPI } from '../types';
import { CONTENT_CATEGORIES } from '../constants/categories';

const VALID_CARD_TYPES = new Set(['flash_card', 'explain_card']);
const DEFAULT_CATEGORY = 'Islamic Facts';
const DEFAULT_CARD_TYPE = 'flash_card';

/**
 * Validates and normalizes a single card from API.
 * Invalid category/cardType are replaced with defaults; never throws.
 */
export function validateCard(card: CardFromAPI): CardFromAPI {
  const rawCategory = typeof card.category === 'string' ? card.category : '';
  const lower = rawCategory.toLowerCase();
  let normalizedCategory: (typeof CONTENT_CATEGORIES)[number] = DEFAULT_CATEGORY;

  if (lower === 'hadis' || lower === 'hadith') normalizedCategory = 'Hadis';
  else if (lower === 'dua') normalizedCategory = 'Dua';
  else if (lower === 'prophet stories' || lower === 'prophet_stories' || lower === 'stories')
    normalizedCategory = 'Prophet Stories';
  else if (lower === 'quran surah' || lower === 'quran_surah' || lower === 'quran')
    normalizedCategory = 'Quran Surah';
  else if (
    lower === 'islamic facts' ||
    lower === 'islamic_facts' ||
    lower === 'facts'
  )
    normalizedCategory = 'Islamic Facts';
  else if (
    typeof card.category === 'string' &&
    CONTENT_CATEGORIES.includes(card.category as (typeof CONTENT_CATEGORIES)[number])
  ) {
    normalizedCategory = card.category as (typeof CONTENT_CATEGORIES)[number];
  }

  const category = normalizedCategory;
  const cardType =
    typeof card.cardType === 'string' && VALID_CARD_TYPES.has(card.cardType)
      ? card.cardType
      : DEFAULT_CARD_TYPE;

  if (card.category !== category || card.cardType !== cardType) {
    if (__DEV__) {
      console.warn('[validateCards] Invalid card:', card.id, { got: { category: card.category, cardType: card.cardType }, defaulted: { category, cardType } });
    }
  }

  const iconPlacement =
    card.iconPlacement === 'bottom' || card.iconPlacement === 'top' ? card.iconPlacement : undefined;
  const cardColor =
    typeof card.cardColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(card.cardColor) ? card.cardColor : undefined;
  return {
    id: card.id ?? '',
    category,
    cardType,
    title: typeof card.title === 'string' ? card.title : '',
    preview: typeof card.preview === 'string' ? card.preview : '',
    content: typeof card.content === 'string' ? card.content : '',
    reference: card.reference,
    image: card.image,
    iconPlacement,
    cardColor,
    isBookmarked: card.isBookmarked === true,
  };
}

/**
 * Validates an array of cards. Returns only valid cards; invalid fields are defaulted per card.
 */
export function validateCards(cards: CardFromAPI[]): CardFromAPI[] {
  if (!Array.isArray(cards)) return [];
  return cards.map(validateCard);
}
