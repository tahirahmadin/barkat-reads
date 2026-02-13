import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningCard, Topic, UserStats, SubjectItem, FeedArticleWithMeta } from '../types';
import { fetchSubjects } from '../api/serverActions';

const namazImage = require('../../assets/learn/namaz.jpg');

interface AppState {
  // User preferences
  preferences: Topic[];
  hasCompletedOnboarding: boolean;

  // Content (scalable: from API)
  subjects: SubjectItem[];
  feedArticles: FeedArticleWithMeta[];
  loading: boolean;
  error: string | null;

  // Cards (derived from feedArticles for UI)
  allCards: LearningCard[];
  learnedCardIds: string[];
  savedCardIds: string[];

  // Daily limit
  dailyLimit: number;
  cardsLearnedToday: number;
  lastLearningDate: string | null;

  // Stats
  stats: UserStats;

  // Actions
  loadContent: () => Promise<void>;
  setPreferences: (topics: Topic[]) => void;
  completeOnboarding: () => void;
  markCardAsLearned: (cardId: string) => void;
  saveCard: (cardId: string) => void;
  unsaveCard: (cardId: string) => void;
  resetDailyLimit: () => void;
  resetProgress: () => void;
  logout: () => void;
  getAvailableCards: () => LearningCard[];
  getSavedCards: () => LearningCard[];
  updateStreak: () => void;
}

function feedArticleToLearningCard(article: FeedArticleWithMeta): LearningCard {
  return {
    id: article.id,
    subject: article.subject,
    topic: article.topic,
    title: article.title,
    short_text: article.preview,
    full_text: article.content,
    reference: article.reference ?? '',
    image: article.image ?? namazImage,
    expandable: article.expandable,
    quoteType: article.quoteType,
    iconPlacement: article.iconPlacement,
    cardColor: article.cardColor,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: [],
      hasCompletedOnboarding: false,
      subjects: [],
      feedArticles: [],
      loading: false,
      error: null,
      allCards: [],
      learnedCardIds: [],
      savedCardIds: [],
      dailyLimit: 5,
      cardsLearnedToday: 0,
      lastLearningDate: null,
      stats: {
        cardsLearned: 0,
        streakDays: 0,
        lastLearningDate: null,
        topicsFollowed: 0,
      },

      loadContent: async () => {
        set({ loading: true, error: null });
        const res = await fetchSubjects();

        if (res.success && res.data) {
          const subjects = res.data;
          const feedArticles: FeedArticleWithMeta[] = subjects.flatMap((subject) =>
            subject.topics.flatMap((topic) =>
              topic.articles.map((article) => ({
                id: article.id,
                title: article.title,
                preview: article.preview,
                content: article.content,
                reference: article.reference,
                image: article.image,
                expandable: article.expandable,
                quoteType: article.quoteType,
                iconPlacement: article.iconPlacement,
                cardColor: article.cardColor,
                subject: subject.title,
                topic: topic.title,
              }))
            )
          );
          const allCards: LearningCard[] = feedArticles.map(feedArticleToLearningCard);
          set({
            subjects,
            feedArticles,
            allCards,
            loading: false,
            error: null,
          });
        } else {
          set({
            error: res.error ?? 'Failed to fetch content',
            loading: false,
          });
        }
      },

      setPreferences: (topics) => {
        set({ preferences: topics });
        get().updateStreak();
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
          set((state) => ({
            learnedCardIds: [...state.learnedCardIds, cardId],
            cardsLearnedToday: state.cardsLearnedToday + 1,
            lastLearningDate: today,
            stats: {
              ...state.stats,
              cardsLearned: state.stats.cardsLearned + 1,
            },
          }));
          get().updateStreak();
        }
      },

      saveCard: (cardId) => {
        set((state) => ({
          savedCardIds: state.savedCardIds.includes(cardId)
            ? state.savedCardIds
            : [...state.savedCardIds, cardId],
        }));
      },

      unsaveCard: (cardId) => {
        set((state) => ({
          savedCardIds: state.savedCardIds.filter((id) => id !== cardId),
        }));
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
          savedCardIds: [],
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
          hasCompletedOnboarding: false,
          preferences: [],
          learnedCardIds: [],
          savedCardIds: [],
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
        // Always return all cards - no progress tracking, no preference filtering
        return state.allCards;
      },

      getSavedCards: () => {
        const state = get();
        return state.allCards.filter((card) =>
          state.savedCardIds.includes(card.id)
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
        preferences: state.preferences,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        learnedCardIds: state.learnedCardIds,
        savedCardIds: state.savedCardIds,
        dailyLimit: state.dailyLimit,
        cardsLearnedToday: state.cardsLearnedToday,
        lastLearningDate: state.lastLearningDate,
        stats: state.stats,
        // Don't persist allCards as it's static data
      }),
    }
  )
);
