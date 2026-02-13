export type Topic =
  | "Hadith"
  | "Deen"
  | "Namaz"
  | "Hajj"
  | "Quran"
  | "History"
  | "Dua"
  | "Focus";

export type Subject = "Islam" | "Productivity";

export interface Article {
  id: string;
  title: string;
  short_text: string;
  full_text: string;
  reference: string;
  image: string | number; // string for URL, number for require()
}

export interface TopicData {
  name: Topic;
  description: string;
  articles: Article[];
}

export interface SubjectData {
  name: Subject;
  topics: TopicData[];
}

export interface LearningCard {
  id: string;
  subject: string;
  topic: string;
  title: string;
  short_text: string;
  full_text: string;
  reference: string;
  image: string | number;
  expandable?: boolean; // true = long-form article card, false = micro/quick-read card
  quoteType?: 'quote'; // if non-expandable and quoteType === 'quote', render as quote card
  iconPlacement?: 'top' | 'bottom'; // for quote cards: where to place the icon
  cardColor?: string; // custom color for the card background
}

export interface UserPreferences {
  interests: Topic[];
}

export interface UserStats {
  cardsLearned: number;
  streakDays: number;
  lastLearningDate: string | null;
  topicsFollowed: number;
}

// API model: Subject → Topic → Article (from backend / mockData)
export interface ArticleItem {
  id: string;
  title: string;
  expandable: boolean;
  preview: string;
  content: string;
  reference?: string;
  image?: string | number;
  quoteType?: 'quote'; // if non-expandable and quoteType === 'quote', render as quote card
  iconPlacement?: 'top' | 'bottom'; // for quote cards: where to place the icon
  cardColor?: string; // custom color for the card background
}

export interface TopicItem {
  id: string;
  title: string;
  articles: ArticleItem[];
}

export interface SubjectItem {
  id: string;
  title: string;
  topics: TopicItem[];
}

// Flattened article with subject/topic meta (for store feed)
export interface FeedArticleWithMeta {
  id: string;
  title: string;
  preview: string;
  content: string;
  reference?: string;
  image?: string | number;
  expandable?: boolean;
  quoteType?: 'quote';
  iconPlacement?: 'top' | 'bottom';
  cardColor?: string;
  subject: string;
  topic: string;
}
