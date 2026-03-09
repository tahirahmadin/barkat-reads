import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../store/useStore';
import { getBookmarks } from '../api/serverActions';
import { validateCards } from '../api/validateCards';
import { cardFromAPIToLearningCard } from '../store/useStore';
import type { LearningCard, ContentCategory } from '../types';
import { DetailReaderModal } from '../components/DetailReaderModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 20;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;
const CARD_MIN_HEIGHT = 180;
// Width for 2.5 cards visible: (screen - padding*2 - gap*2) / 2.5
const ARTICLE_CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 2.2;
const ARTICLE_CARD_HEIGHT = 200;
const BOOKMARK_CARD_IMAGE_URI =
  'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png';

const PATTERN_IMG = require('../../assets/pattern.avif');

const getCategoryColor = (category: ContentCategory): string => {
  const colors: Record<ContentCategory, string> = {
    Hadis: '#2D8659',
    Dua: '#8B6F47',
    'Prophet Stories': '#5D4E37',
    'Quran Surah': '#2C5F7A',
    'Islamic Facts': '#27ae60',
  };
  return colors[category] ?? '#718096';
};

const getArticleTagLabel = (category: ContentCategory): string => {
  const tags: Record<ContentCategory, string> = {
    Hadis: 'HADIS',
    Dua: 'DUA',
    'Prophet Stories': 'PROPHET STORIES',
    'Quran Surah': 'QURAN SURAH',
    'Islamic Facts': 'ISLAMIC FACTS',
  };
  return tags[category] ?? category.toUpperCase();
};

/** More text → smaller fontSize, less text → larger fontSize, so full text fits. */
const getScaledTitleStyle = (
  text: string,
  baseStyle: { fontSize: number; lineHeight: number },
  opts: { minFontSize?: number; maxFontSize?: number } = {}
): { fontSize: number; lineHeight: number } => {
  const { minFontSize = 11, maxFontSize = baseStyle.fontSize } = opts;
  const len = (text || '').trim().length;
  if (len <= 25) return { fontSize: maxFontSize, lineHeight: baseStyle.lineHeight };
  if (len <= 50) {
    const fontSize = Math.max(minFontSize, maxFontSize - 2);
    return { fontSize, lineHeight: fontSize + 6 };
  }
  if (len <= 80) {
    const fontSize = Math.max(minFontSize, maxFontSize - 4);
    return { fontSize, lineHeight: fontSize + 5 };
  }
  if (len <= 120) {
    const fontSize = Math.max(minFontSize, maxFontSize - 6);
    return { fontSize, lineHeight: fontSize + 4 };
  }
  const fontSize = minFontSize;
  return { fontSize, lineHeight: fontSize + 4 };
};

function BookmarkCardDecoration() {
  const positions = [
    { top: 12, right: 12, size: 6 },
    { top: 32, left: 10, size: 5 },
    { bottom: 50, left: 12, size: 6 },
    { bottom: 65, right: 10, size: 5 },
  ];
  return (
    <View style={decorationStyles.container} pointerEvents="none">
      {positions.map((pos, i) => (
        <View
          key={i}
          style={[
            decorationStyles.star,
            {
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              right: pos.right,
              opacity: 0.18,
            },
          ]}
        >
          <Ionicons name={i % 2 === 0 ? 'star' : 'sparkles'} size={pos.size} color="#fff" />
        </View>
      ))}
    </View>
  );
}

export const BookmarkScreen: React.FC = () => {
  const {
    authToken,
    getBookmarkedCards,
    markDetailOpened,
    markDetailAsFinished,
  } = useStore();

  const [apiBookmarks, setApiBookmarks] = useState<LearningCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<LearningCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadBookmarks = useCallback(async () => {
    if (!authToken) {
      setApiBookmarks(null);
      return;
    }
    setError(null);
    setLoading(true);
    const res = await getBookmarks(100, 0, authToken);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? 'Failed to load bookmarks');
      setApiBookmarks([]);
      return;
    }
    const items = res.data?.items ?? [];
    const validated = validateCards(items);
    const cards: LearningCard[] = validated.map(cardFromAPIToLearningCard);
    setApiBookmarks(cards);
  }, [authToken]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  }, [loadBookmarks]);

  // When authenticated, show API bookmarks; otherwise show local store bookmarks
  const bookmarkedCards =
    authToken && apiBookmarks !== null
      ? apiBookmarks
      : getBookmarkedCards();

  const explainCards = bookmarkedCards.filter((card) => card.cardType === 'explain_card');
  const flashCards = bookmarkedCards.filter((card) => card.cardType === 'flash_card');

  const handleCardPress = (card: LearningCard) => {
    setSelectedCard(card);
    setModalVisible(true);
    markDetailOpened(card.id);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  const renderCard = (card: LearningCard, isRow?: boolean) => {
    const categoryColor = getCategoryColor(card.category);
    const imageUri = typeof card.image === 'string' ? card.image : BOOKMARK_CARD_IMAGE_URI;

    // Article cards: full background image with text overlay (same as feed)
    if (isRow) {
      const tagLabel = getArticleTagLabel(card.category);
      const isBigTitle = card.titleSize === 'big';
      // Smaller font range so full title fits in card without cropping
      const baseFont = isBigTitle ? { fontSize: 14, lineHeight: 19 } : { fontSize: 13, lineHeight: 18 };
      const maxFont = isBigTitle ? 15 : 14;
      return (
        <TouchableOpacity
          key={card.id}
          style={[styles.card, styles.articleCard]}
          activeOpacity={0.95}
          onPress={() => handleCardPress(card)}
        >
          <Image
            source={{ uri: imageUri }}
            style={articleCardStyles.backgroundImage}
            resizeMode="cover"
          />
          <View style={articleCardStyles.overlay} pointerEvents="none" />
          <View style={articleCardStyles.tagRow} pointerEvents="none">
            <View style={articleCardStyles.tagPill}>
              <Text style={articleCardStyles.tagText}>{tagLabel}</Text>
            </View>
          </View>
          <View style={articleCardStyles.titleWrap} pointerEvents="none">
            <Text
              style={[
                articleCardStyles.title,
                getScaledTitleStyle(card.title, baseFont, { minFontSize: 10, maxFontSize: maxFont }),
              ]}
            >
              {card.title}
            </Text>
          </View>
          <View style={articleCardStyles.bottomRow}>
            <Text style={articleCardStyles.tapLabel}>Tap to read</Text>
            <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.9)" />
          </View>
        </TouchableOpacity>
      );
    }

    // Quick reads (flash cards): solid color + small image
    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.card, { backgroundColor: categoryColor }]}
        activeOpacity={0.95}
        onPress={() => handleCardPress(card)}
      >
        <BookmarkCardDecoration />
        <View style={styles.inner}>
          <Text
            style={[
              styles.title,
              getScaledTitleStyle(card.title, { fontSize: 15, lineHeight: 20 }, { minFontSize: 11, maxFontSize: 16 }),
            ]}
          >
            {card.title}
          </Text>
          <View style={styles.spacer} />
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.bottomImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.tapRow}>
            <Text style={styles.tapLabel}>Tap to read</Text>
            <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgPatternWrap}>
          <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
        </View>
      </View>
      <View style={styles.contentLayer}>
      <AppHeader title="Bookmarks" />
      {authToken && loading && !refreshing && apiBookmarks === null ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D8659" />
        </View>
      ) : authToken && error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Could not load bookmarks</Text>
          <Text style={styles.emptySub}>{error}</Text>
        </View>
      ) : bookmarkedCards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📌</Text>
          <Text style={styles.emptyTitle}>No bookmarks</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark on a card to add it here for later.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2D8659"
            />
          }
        >
          {/* Expandable Cards Section - horizontal row */}
          {explainCards.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Articles</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.articlesRow}
              >
                {explainCards.map((card) => renderCard(card, true))}
              </ScrollView>
            </View>
          )}

          {/* Non-Expandable Cards Section - 2-column grid */}
          {flashCards.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Reads</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.grid}>
                {flashCards.map((card) => renderCard(card))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
      </View>
      {selectedCard && (
        <DetailReaderModal
          visible={modalVisible}
          cardId={selectedCard.id}
          title={selectedCard.title}
          content={selectedCard.full_text}
          category={selectedCard.category}
          onFinish={() => {
            markDetailAsFinished(selectedCard.id);
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}
    </SafeAreaView>
  );
};

const decorationStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
  },
});

/** Article card: full background image + overlay + text (matches feed style) */
const articleCardStyles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1,
  },
  tagRow: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  tagPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  titleWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 44,
    bottom: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  bottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 10,
    zIndex: 3,
  },
  tapLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});

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
  contentLayer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B4789',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  articlesRow: {
    flexDirection: 'row',
    gap: GAP,
    paddingRight: PADDING,
  },
  articleCard: {
    width: ARTICLE_CARD_WIDTH,
    height: ARTICLE_CARD_HEIGHT,
    marginRight: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    rowGap: GAP,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  spacer: {
    flex: 1,
    minHeight: 4,
  },
  imageContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 100,
    height: 64,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomImage: {
    width: '100%',
    height: '100%',
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  tapLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  emptySub: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
});
