import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ContentCategory, LearningCard, UserStats, CardFromAPI } from '../types';
import { CONTENT_CATEGORIES } from '../constants/categories';
import { fetchCards, fetchProgress, fetchCategoryStats, markCardFinished, addBookmark, removeBookmark, updateCurrentUser, getCurrentUser } from '../api/serverActions';
import { validateCards } from '../api/validateCards';

const namazImage = require('../../assets/learn/namaz.jpg');

export type PreferredLanguage = 'English' | 'Hindi';

interface AppState {
  userEmail: string | null;
  authToken: string | null;
  userAge: number | null;
  preferredLanguage: PreferredLanguage | null;
  preferences: ContentCategory[];
  hasCompletedOnboarding: boolean;

  loading: boolean;
  error: string | null;
  allCards: LearningCard[];
  learnedCardIds: string[];
  bookmarkedCardIds: string[];
  finishedDetailCardIds: string[];
  detailOpenedCardIds: string[];

  dailyLimit: number;
  cardsLearnedToday: number;
  lastLearningDate: string | null;
  stats: UserStats;

  /** Per-category total and completed from API progress/user-progress-stats (when logged in). */
  categoryStats: Record<ContentCategory, { total: number; completed: number }> | null;

  /** Overview from progress/user-progress-stats: streak and consumed (total learnt). */
  statsOverview: { streak: number; consumed: number; topic: number } | null;

  loadContent: () => Promise<void>;
  loadCategoryStats: () => Promise<void>;
  setAuth: (params: { token: string | null; email?: string | null }) => void;
  initSession: () => Promise<void>;
  setPreferences: (categories: ContentCategory[]) => void;
  setUserAge: (age: number) => void;
  setPreferredLanguage: (language: PreferredLanguage) => void;
  completeOnboarding: () => void;
  markCardAsLearned: (cardId: string) => void;
  markDetailAsFinished: (cardId: string) => void;
  markDetailOpened: (cardId: string) => void;
  bookmarkCard: (cardId: string) => void;
  unbookmarkCard: (cardId: string) => void;
  resetDailyLimit: () => void;
  resetProgress: () => void;
  logout: () => void;
  getAvailableCards: () => LearningCard[];
  getBookmarkedCards: () => LearningCard[];
  updateStreak: () => void;
}

function normalizeCategoryStatsKey(key: string): ContentCategory | null {
  const k = String(key).toLowerCase();
  if (k === 'hadis' || k === 'hadith') return 'Hadis';
  if (k === 'dua') return 'Dua';
  if (k === 'prophet stories' || k === 'prophet_stories' || k === 'stories') return 'Prophet Stories';
  if (k === 'quran surah' || k === 'quran_surah' || k === 'quran') return 'Quran Surah';
  if (k === 'islamic facts' || k === 'islamic_facts' || k === 'facts') return 'Islamic Facts';
  if (CONTENT_CATEGORIES.includes(key as ContentCategory)) return key as ContentCategory;
  return null;
}

/** Convert API card shape to LearningCard (used by feed and bookmarks). */
export function cardFromAPIToLearningCard(card: CardFromAPI): LearningCard {
  const placement = card.iconPlacement === 'bottom' ? 'bottom' : 'top';
  const cardColor =
    typeof card.cardColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(card.cardColor) ? card.cardColor : undefined;
  return {
    id: card.id,
    category: card.category as ContentCategory,
    cardType: card.cardType as LearningCard['cardType'],
    title: card.title,
    short_text: card.preview,
    full_text: card.content,
    reference: card.reference ?? '',
    image: card.image ?? namazImage,
    iconPlacement: placement,
    cardColor,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userEmail: null,
      authToken: null,
      userAge: null,
      preferredLanguage: null,
      preferences: [],
      hasCompletedOnboarding: false,
      loading: false,
      error: null,
      allCards: [],
      learnedCardIds: [],
      bookmarkedCardIds: [],
      finishedDetailCardIds: [],
      detailOpenedCardIds: [],
      dailyLimit: 5,
      cardsLearnedToday: 0,
      lastLearningDate: null,
      stats: {
        cardsLearned: 0,
        streakDays: 0,
        lastLearningDate: null,
        topicsFollowed: 0,
      },
      categoryStats: null,
      statsOverview: null,

      setAuth: ({ token, email }) => {
        set((state) => ({
          authToken: token,
          userEmail: email ?? state.userEmail,
        }));
      },

      initSession: async () => {
        const token = get().authToken;
        if (!token) return;
        try {
          const me = await getCurrentUser(token);
          if (me.success && me.data) {
            const backendPrefs = me.data.preferences ?? [];
            if (backendPrefs.length > 0) {
              const mapped: ContentCategory[] = backendPrefs
                .map((p) => {
                  const v = String(p).toLowerCase();
                  if (v === 'hadis' || v === 'hadith') return 'Hadis';
                  if (v === 'dua') return 'Dua';
                  if (v === 'prophet stories' || v === 'prophet_stories' || v === 'stories')
                    return 'Prophet Stories';
                  if (v === 'quran surah' || v === 'quran_surah' || v === 'quran')
                    return 'Quran Surah';
                  if (v === 'islamic facts' || v === 'islamic_facts' || v === 'facts')
                    return 'Islamic Facts';
                  return null;
                })
                .filter((x): x is ContentCategory => x !== null);

              if (mapped.length > 0) {
                set((state) => ({
                  preferences: state.preferences.length ? state.preferences : mapped,
                  hasCompletedOnboarding: true,
                }));
              }
            }
          }
        } catch (e) {
          console.log('[initSession] Failed to hydrate user profile', e);
        }
      },

      setUserAge: (age) => set({ userAge: age }),
      setPreferredLanguage: (language) => set({ preferredLanguage: language }),

      loadContent: async () => {
        console.log('[loadContent] Start');
        set({ loading: true, error: null });
        const authToken = get().authToken;
        const progressRes = await fetchProgress(authToken ?? undefined);
        if (progressRes.success && progressRes.data) {
          const p = progressRes.data;
          set((state) => ({
            learnedCardIds: p.learnedCardIds ?? state.learnedCardIds,
            bookmarkedCardIds: [...new Set([...(state.bookmarkedCardIds ?? []), ...(p.savedCardIds ?? [])])],
            finishedDetailCardIds: p.finishedDetailCardIds ?? state.finishedDetailCardIds,
            detailOpenedCardIds: p.detailOpenedCardIds ?? state.detailOpenedCardIds,
            stats: p.stats ?? state.stats,
            lastLearningDate: p.lastLearningDate ?? state.lastLearningDate,
          }));
        }
        const res = await fetchCards(authToken ?? undefined);
        console.log('[loadContent] fetchCards result:', res.success, 'count:', res.data?.length ?? 0, 'error:', res.error);
        if (res.success && res.data) {
          const validated = validateCards(res.data);
          const allCards: LearningCard[] = validated.map(cardFromAPIToLearningCard);
          console.log('[loadContent] Setting allCards from backend:', allCards.length);
          const bookmarkedIdsFromFeed = validated
            .filter((c) => c.isBookmarked)
            .map((c) => c.id);
          set((state) => ({
            allCards,
            loading: false,
            error: null,
            bookmarkedCardIds:
              bookmarkedIdsFromFeed.length > 0
                ? [...new Set([...state.bookmarkedCardIds, ...bookmarkedIdsFromFeed])]
                : state.bookmarkedCardIds,
          }));
        } else {
          console.log('[loadContent] Setting error, clearing cards:', res.error);
          set({ allCards: [], error: res.error ?? 'Failed to fetch content', loading: false });
        }
        if (authToken) {
          get().loadCategoryStats();
        }
        const state = get();
        console.log('[loadContent] Done. allCards:', state.allCards.length, 'getAvailableCards would return:', state.preferences.length === 0 ? state.allCards.length : state.allCards.filter((c) => state.preferences.includes(c.category)).length);
      },

      loadCategoryStats: async () => {
        const token = get().authToken;
        if (!token) {
          set({ categoryStats: null, statsOverview: null });
          return;
        }
        const res = await fetchCategoryStats(token);
        if (!res.success || !res.data?.categories) {
          set((state) => ({ categoryStats: state.categoryStats, statsOverview: state.statsOverview }));
          return;
        }
        const overview = res.data.overview;
        const mapped: Record<ContentCategory, { total: number; completed: number }> = {
          Hadis: { total: 0, completed: 0 },
          Dua: { total: 0, completed: 0 },
          'Prophet Stories': { total: 0, completed: 0 },
          'Quran Surah': { total: 0, completed: 0 },
          'Islamic Facts': { total: 0, completed: 0 },
        };
        Object.entries(res.data.categories).forEach(([key, value]) => {
          if (!value) return;
          const cat = normalizeCategoryStatsKey(key);
          if (cat) {
            mapped[cat] = {
              total: value.total ?? 0,
              completed: value.completed ?? 0,
            };
          }
        });
        set({
          categoryStats: mapped,
          statsOverview:
            overview &&
            typeof overview.streak === 'number' &&
            typeof overview.consumed === 'number' &&
            typeof overview.topic === 'number'
              ? { streak: overview.streak, consumed: overview.consumed, topic: overview.topic }
              : null,
        });
      },

      setPreferences: (categories) => {
        set({ preferences: categories });
        get().updateStreak();

        // Sync user preferences (and age/language when available) to backend user profile.
        const token = get().authToken;
        if (token) {
          const state = get();

          // Map frontend categories to backend preference slugs.
          const prefSlugs = categories.map((c) => {
            if (c === 'Hadis') return 'hadith';
            if (c === 'Dua') return 'dua';
            if (c === 'Prophet Stories') return 'stories';
            if (c === 'Quran Surah') return 'quran_surah';
            if (c === 'Islamic Facts') return 'islamic_facts';
            return null;
          }).filter((x): x is string => x !== null);

          const language =
            state.preferredLanguage === 'Hindi' ? 'hindi' : 'english';

          updateCurrentUser(
            {
              age: state.userAge ?? undefined,
              language,
              preferences: prefSlugs.length > 0 ? prefSlugs : undefined,
            },
            token
          ).catch((e) => {
            console.log('[setPreferences] Failed to sync user profile', e);
          });
        }
      },

      markDetailAsFinished: (cardId) => {
        set((state) => {
          if (state.finishedDetailCardIds.includes(cardId)) return state;
          return {
            finishedDetailCardIds: [...state.finishedDetailCardIds, cardId],
            stats: {
              ...state.stats,
              cardsLearned: state.stats.cardsLearned + 1,
            },
          };
        });
        const today = new Date().toDateString();
        const state = get();
        if (state.lastLearningDate !== today) {
          set({ cardsLearnedToday: 0, lastLearningDate: today });
        } else {
          set((s) => ({ cardsLearnedToday: s.cardsLearnedToday + 1 }));
        }
        get().updateStreak();

        const token = get().authToken;
        if (token) {
          markCardFinished(cardId, token).catch((e) => {
            console.log('[markDetailAsFinished] Failed to sync card-finished', e);
          });
        }
      },

      markDetailOpened: (cardId) => {
        set((state) =>
          state.detailOpenedCardIds.includes(cardId)
            ? state
            : { detailOpenedCardIds: [...state.detailOpenedCardIds, cardId] }
        );
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      markCardAsLearned: (cardId) => {
        const state = get();
        const today = new Date().toDateString();

        // Reset daily count if it's a new day
        if (state.lastLearningDate !== today) {
          set({ cardsLearnedToday: 0, lastLearningDate: today });
        }

        // Check daily limit
        if (state.cardsLearnedToday >= state.dailyLimit) {
          return; // Don't allow learning more cards today
        }

        // Add to learned if not already learned
        if (!state.learnedCardIds.includes(cardId)) {
          set((current) => ({
            learnedCardIds: [...current.learnedCardIds, cardId],
            cardsLearnedToday: current.cardsLearnedToday + 1,
            lastLearningDate: today,
            stats: {
              ...current.stats,
              cardsLearned: current.stats.cardsLearned + 1,
            },
          }));
          get().updateStreak();

          // Sync with backend progress (card-finished) when authenticated.
          const token = get().authToken;
          if (token) {
            markCardFinished(cardId, token).catch((e) => {
              console.log('[markCardAsLearned] Failed to sync card-finished', e);
            });
          }
        }
      },

      bookmarkCard: (cardId) => {
        const state = get();
        if (state.bookmarkedCardIds.includes(cardId)) return;

        set({
          bookmarkedCardIds: [...state.bookmarkedCardIds, cardId],
        });

        const token = get().authToken;
        if (token) {
          addBookmark(cardId, token).catch((e) => {
            console.log('[bookmarkCard] Failed to sync bookmark', e);
          });
        }
      },

      unbookmarkCard: (cardId) => {
        const state = get();
        if (!state.bookmarkedCardIds.includes(cardId)) return;

        set({
          bookmarkedCardIds: state.bookmarkedCardIds.filter((id) => id !== cardId),
        });

        const token = get().authToken;
        if (token) {
          removeBookmark(cardId, token).catch((e) => {
            console.log('[unbookmarkCard] Failed to sync bookmark removal', e);
          });
        }
      },

      resetDailyLimit: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastLearningDate !== today) {
          set({ cardsLearnedToday: 0, lastLearningDate: today });
        }
      },

      resetProgress: () => {
        set({
          learnedCardIds: [],
          bookmarkedCardIds: [],
          finishedDetailCardIds: [],
          detailOpenedCardIds: [],
          cardsLearnedToday: 0,
          lastLearningDate: null,
          stats: {
            cardsLearned: 0,
            streakDays: 0,
            lastLearningDate: null,
            topicsFollowed: get().preferences.length,
          },
        });
      },

      logout: () => {
        set({
          userEmail: null,
          authToken: null,
          userAge: null,
          preferredLanguage: null,
          hasCompletedOnboarding: false,
          preferences: [],
          learnedCardIds: [],
          bookmarkedCardIds: [],
          finishedDetailCardIds: [],
          detailOpenedCardIds: [],
          cardsLearnedToday: 0,
          lastLearningDate: null,
          stats: {
            cardsLearned: 0,
            streakDays: 0,
            lastLearningDate: null,
            topicsFollowed: 0,
          },
        });
      },

      getAvailableCards: () => {
        const state = get();
        if (state.preferences.length === 0) return state.allCards;
        const filtered = state.allCards.filter((card) =>
          state.preferences.includes(card.category)
        );
        // If stored preferences don't match any card (e.g. old persisted values), show all cards
        if (filtered.length === 0 && state.allCards.length > 0) return state.allCards;
        return filtered;
      },

      getBookmarkedCards: () => {
        const state = get();
        return state.allCards.filter((card) =>
          state.bookmarkedCardIds.includes(card.id)
        );
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = state.stats.streakDays;

        if (state.lastLearningDate === today) {
          // Learning today
          if (state.stats.lastLearningDate === yesterdayStr) {
            // Continued streak
            newStreak = state.stats.streakDays + 1;
          } else if (state.stats.lastLearningDate !== today) {
            // New streak
            newStreak = 1;
          }
        }

        set({
          stats: {
            ...state.stats,
            streakDays: newStreak,
            lastLearningDate: today,
            topicsFollowed: state.preferences.length,
          },
        });
      },
    }),
    {
      name: 'barkat-learn-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        authToken: state.authToken,
        userEmail: state.userEmail,
        userAge: state.userAge,
        preferredLanguage: state.preferredLanguage,
        preferences: state.preferences,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        learnedCardIds: state.learnedCardIds,
        bookmarkedCardIds: state.bookmarkedCardIds,
        finishedDetailCardIds: state.finishedDetailCardIds,
        detailOpenedCardIds: state.detailOpenedCardIds,
        dailyLimit: state.dailyLimit,
        cardsLearnedToday: state.cardsLearnedToday,
        lastLearningDate: state.lastLearningDate,
        stats: state.stats,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const s = persistedState as Record<string, unknown>;
        if (s && typeof s === 'object' && Array.isArray(s.savedCardIds) && !Array.isArray(s.bookmarkedCardIds)) {
          return { ...s, bookmarkedCardIds: s.savedCardIds, savedCardIds: undefined };
        }
        return persistedState as Record<string, unknown>;
      },
      version: 1,
    }
  )
);
