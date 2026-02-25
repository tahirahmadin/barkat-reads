import type { ContentCategory } from '../constants/categories';

export type { ContentCategory } from '../constants/categories';

export type CardType = 'flash_card' | 'explain_card';

/** Where to place the image/icon on the card: above the quote text (top) or below it (bottom). */
export type IconPlacement = 'top' | 'bottom';

export interface LearningCard {
  id: string;
  category: ContentCategory;
  cardType: CardType;
  title: string;
  short_text: string;
  full_text: string;
  reference: string;
  image: string | number;
  /** Image/icon position on card. Default 'top'. */
  iconPlacement?: IconPlacement;
  /** Override background color for this card (e.g. '#8B5A3C'). If set, used instead of category color. */
  cardColor?: string;
}

export interface UserStats {
  cardsLearned: number;
  streakDays: number;
  lastLearningDate: string | null;
  topicsFollowed: number;
}

export interface UserPreferences {
  interests: ContentCategory[];
}

/** API/backend card shape (category-wise JSON, Cards API) */
export interface CardFromAPI {
  id: string;
  category: string;
  cardType: string;
  title: string;
  preview: string;
  content: string;
  reference?: string;
  image?: string | number;
  /** 'top' | 'bottom' - where to show image/icon on the card. Default 'top'. */
  iconPlacement?: string;
  /** Optional background color for the card (e.g. '#8B5A3C'). Overrides category color when set. */
  cardColor?: string;
  /** Whether this card is bookmarked for the current user (from backend feed). */
  isBookmarked?: boolean;
}
