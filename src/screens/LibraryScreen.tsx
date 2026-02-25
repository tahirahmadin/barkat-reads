import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CardStack } from '../components/CardStack';
import { useStore } from '../store/useStore';
import { CONTENT_CATEGORIES } from '../constants/categories';
import type { ContentCategory, LearningCard } from '../types';

const PADDING = 20;

/** Plain light brownish background for Library (no animation). */
const LIBRARY_BG = '#e8e0d6';

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

const getCategoryIconName = (category: ContentCategory): keyof typeof Ionicons.glyphMap => {
  const icons: Record<ContentCategory, string> = {
    Hadis: 'book',
    Dua: 'heart',
    'Prophet Stories': 'time',
    'Quran Surah': 'library',
    'Islamic Facts': 'bulb',
  };
  return icons[category] ?? 'folder';
};

export const LibraryScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);
  const {
    allCards,
    loadContent,
    loading,
    error,
    markCardAsLearned,
    bookmarkCard,
    markDetailAsFinished,
    markDetailOpened,
    detailOpenedCardIds,
    bookmarkedCardIds,
    categoryStats,
  } = useStore();

  useEffect(() => {
    if (allCards.length === 0 && !loading) loadContent();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<ContentCategory, number> = {} as Record<ContentCategory, number>;
    for (const cat of CONTENT_CATEGORIES) {
      counts[cat] = allCards.filter((c) => c.category === cat).length;
    }
    return counts;
  }, [allCards]);

  /** Total and completed per category: from API when available, else from local counts. */
  const categoryDisplay = useMemo(() => {
    const out: Record<ContentCategory, { total: number; completed: number }> = {} as Record<ContentCategory, { total: number; completed: number }>;
    for (const cat of CONTENT_CATEGORIES) {
      const api = categoryStats?.[cat];
      out[cat] = {
        total: api?.total ?? categoryCounts[cat] ?? 0,
        completed: api?.completed ?? 0,
      };
    }
    return out;
  }, [categoryStats, categoryCounts]);

  const categoryCards = useMemo((): LearningCard[] => {
    if (!selectedCategory) return [];
    return allCards.filter((c) => c.category === selectedCategory);
  }, [allCards, selectedCategory]);

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.bgPlain} pointerEvents="none" />
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={28} color="#1A202C" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{selectedCategory}</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.content}>
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
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.bgPlain} pointerEvents="none" />
      <View style={styles.container}>
        <AppHeader title="Library" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#27ae60" />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.progressGrid}>
              {CONTENT_CATEGORIES.map((category) => {
                const { total, completed } = categoryDisplay[category];
                const topicColor = getCategoryColor(category);
                const iconName = getCategoryIconName(category);
                const cardBg = `${topicColor}12`;
                const borderColor = `${topicColor}20`;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.overallProgressCard,
                      { backgroundColor: cardBg, borderColor },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.overallCardTopRow}>
                      <Text style={styles.overallCardLabel} numberOfLines={2}>
                        {category}
                      </Text>
                      <View style={[styles.overallCardIconWrap, { backgroundColor: `${topicColor}18` }]}>
                        <Ionicons name={iconName} size={28} color={topicColor} />
                      </View>
                    </View>
                    <Text style={styles.overallCardCount}>{total}</Text>
                    <Text style={styles.overallCardSubtext}>
                      {total === 0 ? 'cards' : total === 1 ? 'card' : 'cards'}
                      {completed > 0 ? ` · ${completed} completed` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    backgroundColor: LIBRARY_BG,
  },
  bgPlain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: LIBRARY_BG,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    letterSpacing: -0.5,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 70,
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingTop: 24,
    paddingBottom: 100,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overallProgressCard: {
    width: '47%',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  overallCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  overallCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallCardLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    paddingRight: 8,
    lineHeight: 20,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  overallCardCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  overallCardSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
});
