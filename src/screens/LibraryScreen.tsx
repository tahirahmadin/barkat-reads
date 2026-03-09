import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CardStack } from '../components/CardStack';
import { useStore } from '../store/useStore';
import { fetchCardsByCategory } from '../api/serverActions';
import { validateCards } from '../api/validateCards';
import { cardFromAPIToLearningCard } from '../store/useStore';
import type { LearningCard } from '../types';

const PADDING = 20;
const CARD_GAP = 14;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 200;

const COLLECTION_ILLUSTRATION_URI =
  'https://cdn3d.iconscout.com/3d/premium/thumb/quran-book-open-3d-icon-png-download-8769934.png';

const PATTERN_IMG = require('../../assets/pattern.avif');

/** Turn backend slug into display name (e.g. "prophet stories" -> "Prophet Stories"). */
function slugToDisplayName(slug: string): string {
  return slug
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Slug for cards API: spaces -> hyphens, lowercase (e.g. "prophet stories" -> "prophet-stories"). */
function slugToApiSlug(slug: string): string {
  return slug.trim().replace(/\s+/g, '-').toLowerCase();
}

const COLORS = {
  brand: '#063628',
  surface: '#FFFFFF',
  background: '#F4F7F6',
  textPrimary: '#1A2E2A',
  textSecondary: '#5C6B67',
  textMuted: '#8B9B97',
  error: '#B91C1C',
} as const;

const SLUG_COLORS: Record<string, string> = {
  hadis: '#0d9488',
  dua: '#8B6F47',
  'prophet stories': '#7C3AED',
  'quran surah': '#2C5F7A',
  'islamic facts': '#D97706',
  quotes: '#0ea5e9',
};

function getCategoryColor(slug: string): string {
  return SLUG_COLORS[slug.trim().toLowerCase()] ?? '#5C6B67';
}

const cardShadow = Platform.select({
  ios: { shadowColor: '#063628', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 4 },
});

export const LibraryScreen: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [categoryCardsFromApi, setCategoryCardsFromApi] = useState<LearningCard[]>([]);
  const [categoryCardsLoading, setCategoryCardsLoading] = useState(false);
  const [categoryCardsError, setCategoryCardsError] = useState<string | null>(null);
  const {
    allCards,
    loadContent,
    loading,
    error,
    authToken,
    markCardAsLearned,
    bookmarkCard,
    markDetailAsFinished,
    markDetailOpened,
    detailOpenedCardIds,
    bookmarkedCardIds,
    categoriesFromApi,
    loadCategoryStats,
  } = useStore();

  useEffect(() => {
    if (allCards.length === 0 && !loading) loadContent();
  }, []);

  useEffect(() => {
    if (authToken && categoriesFromApi === null) loadCategoryStats();
  }, [authToken, categoriesFromApi, loadCategoryStats]);

  const loadCategoryCards = useCallback(
    async (slug: string) => {
      if (!authToken) {
        setCategoryCardsFromApi([]);
        setCategoryCardsError(null);
        return;
      }
      setCategoryCardsLoading(true);
      setCategoryCardsError(null);
      const apiSlug = slugToApiSlug(slug);
      const res = await fetchCardsByCategory(apiSlug, 100, 0, authToken);
      setCategoryCardsLoading(false);
      if (!res.success) {
        setCategoryCardsError(res.error ?? 'Failed to load cards');
        setCategoryCardsFromApi([]);
        return;
      }
      const items = res.items ?? [];
      const validated = validateCards(items);
      const cards: LearningCard[] = validated.map(cardFromAPIToLearningCard);
      setCategoryCardsFromApi(cards);
      setCategoryCardsError(null);
    },
    [authToken]
  );

  useEffect(() => {
    if (selectedSlug) {
      loadCategoryCards(selectedSlug);
    } else {
      setCategoryCardsFromApi([]);
      setCategoryCardsError(null);
    }
  }, [selectedSlug, loadCategoryCards]);

  const collectionsList = useMemo(
    () => Object.entries(categoriesFromApi ?? {}).map(([slug, data]) => ({ slug, ...data })),
    [categoriesFromApi]
  );

  const categoryCards = useMemo((): LearningCard[] => {
    if (!selectedSlug) return [];
    if (authToken) return categoryCardsFromApi;
    const displayName = slugToDisplayName(selectedSlug);
    return allCards.filter((c) => c.category === displayName);
  }, [allCards, selectedSlug, authToken, categoryCardsFromApi]);

  // Selected category: card stack view
  if (selectedSlug) {
    const displayName = slugToDisplayName(selectedSlug);
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.backgroundLayer} pointerEvents="none">
          <View style={styles.bgBase} />
          <View style={styles.bgPatternWrap}>
            <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedSlug(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.content}>
            {categoryCardsLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.brand} />
                <Text style={styles.loadingTitle}>Loading cards</Text>
                <Text style={styles.loadingSub}>{displayName}</Text>
              </View>
            ) : categoryCardsError ? (
              <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.errorTitle}>Couldn’t load cards</Text>
                <Text style={styles.errorText}>{categoryCardsError}</Text>
              </View>
            ) : categoryCards.length === 0 ? (
              <View style={styles.centered}>
                <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.errorTitle}>No cards yet</Text>
                <Text style={styles.errorText}>
                  {authToken
                    ? 'No cards in this category or you’ve completed them all.'
                    : 'Sign in to load cards by category.'}
                </Text>
              </View>
            ) : (
              <CardStack
                cards={categoryCards}
                onCardLearned={markCardAsLearned}
                onCardBookmark={bookmarkCard}
                bookmarkedCardIds={bookmarkedCardIds}
                dailyLimitReached={false}
                detailOpenedCardIds={detailOpenedCardIds}
                onDetailOpen={markDetailOpened}
                onDetailFinish={markDetailAsFinished}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main library: topic grid
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgPatternWrap}>
          <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
        </View>
      </View>
      <View style={styles.container}>
        <AppHeader title="Collections" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centered}>
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={COLORS.brand} />
              </View>
              <Text style={styles.loadingTitle}>Loading topics</Text>
              <Text style={styles.loadingSub}>Your collections</Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <View style={styles.errorIconWrap}>
                <Ionicons name="library-outline" size={40} color={COLORS.textMuted} />
              </View>
              <Text style={styles.errorTitle}>Couldn’t load collections</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.collectionGrid}>
              {collectionsList.length === 0 && authToken ? (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color={COLORS.brand} />
                  <Text style={styles.loadingTitle}>Loading collections</Text>
                  <Text style={styles.loadingSub}>Your collections</Text>
                </View>
              ) : collectionsList.length === 0 ? (
                <View style={styles.centered}>
                  <Ionicons name="albums-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.errorTitle}>No collections</Text>
                  <Text style={styles.errorText}>
                    {authToken ? 'No categories from server yet.' : 'Sign in to see your collections.'}
                  </Text>
                </View>
              ) : (
                collectionsList.map(({ slug, total, image, backgroundColor }) => {
                  const color = backgroundColor ?? getCategoryColor(slug);
                  const imageUri = image ?? COLLECTION_ILLUSTRATION_URI;
                  const displayName = slugToDisplayName(slug);
                  return (
                    <TouchableOpacity
                      key={slug}
                      style={[styles.heroCardWrapper, { width: CARD_WIDTH }]}
                      onPress={() => setSelectedSlug(slug)}
                      activeOpacity={0.92}
                    >
                      <View style={styles.heroTag}>
                        <Text style={styles.heroTagText}>{total} cards</Text>
                      </View>
                      <View style={[styles.heroCard, cardShadow, { backgroundColor: color, height: CARD_HEIGHT }]}>
                        <View style={styles.heroContent}>
                          <View style={styles.heroTitleBlock}>
                            <Text style={styles.heroTitleSmall}>Collection of</Text>
                            <Text style={styles.heroTitle} numberOfLines={2}>
                              {displayName}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.heroImageWrap}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.heroImage}
                            resizeMode="contain"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0d8ce',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e6dfd6',
  },
  bgPatternWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  bgPattern: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: 70,
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingTop: 20,
    paddingBottom: 120,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  heroCardWrapper: {
    position: 'relative',
    paddingTop: 2,
  },
  heroTag: {
    position: 'absolute',
    top: 0,
    left: 12,
    zIndex: 2,
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  heroTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  heroCard: {
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    justifyContent: 'space-between',
    position: 'relative',
  },
  heroContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
  },
  heroTitleBlock: {
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  heroTitleSmall: {
    fontSize: 12,
    paddingTop: 12,
    color: 'rgba(255,255,255,0.85)',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
    lineHeight: 30,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  heroImageWrap: {
    position: 'absolute',
    right: 0,
    bottom: -4,
    width: 120,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  centered: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrap: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  loadingSub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  errorIconWrap: {
    marginBottom: 16,
    opacity: 0.8,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
});
