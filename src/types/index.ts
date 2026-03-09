import type { ContentCategory } from '../constants/categories';

export type { ContentCategory } from '../constants/categories';

export type CardType = 'flash_card' | 'explain_card';

/** Horizontal title position for explain_card: left, center, right. */
export type TitleInX = 'left' | 'center' | 'right';

/** Vertical title position for explain_card: top, center, bottom. */
export type TitleInY = 'top' | 'center' | 'bottom';

/** Title size for explain_card: normal (default) or big. */
export type TitleSize = 'normal' | 'big';

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
  /** Horizontal title position for explain_card. Default 'center'. */
  titleInX?: TitleInX;
  /** Vertical title position for explain_card. Default 'center'. */
  titleInY?: TitleInY;
  /** Title size for explain_card. Default 'normal'. */
  titleSize?: TitleSize;
  /** Number of people who have read this card (optional, from API). */
  reads?: number;
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
  /** Some backends send icon URL instead of image; we use either. */
  icon?: string | number;
  /** 'top' | 'bottom' - where to show image/icon on the card. Default 'top'. */
  iconPlacement?: string;
  /** Optional background color for the card (e.g. '#8B5A3C'). Overrides category color when set. */
  cardColor?: string;
  /** Horizontal title position: 'left' | 'center' | 'right'. */
  titleInX?: string;
  /** Vertical title position: 'top' | 'center' | 'bottom'. */
  titleInY?: string;
  /** Title size for explain_card: 'normal' | 'big'. */
  titleSize?: string;
  /** Whether this card is bookmarked for the current user (from backend feed). */
  isBookmarked?: boolean;
  /** Number of people who have read this card. */
  reads?: number;
}
