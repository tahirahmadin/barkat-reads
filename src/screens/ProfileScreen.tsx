import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Share,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StreakCelebrationModal } from '../components/StreakCelebrationModal';
import { AppHeader } from '../components/AppHeader';
import { PreferenceSelector } from '../components/PreferenceSelector';
import { useStore } from '../store/useStore';
import { CONTENT_CATEGORIES, type ContentCategory } from '../constants/categories';
import { deleteAccount } from '../api/serverActions';

const PADDING = 20;
const CARD_GAP = 12;
const PATTERN_IMG = require('../../assets/pattern.avif');

const COLORS = {
  brand: '#063628',
  surface: '#FFFFFF',
  background: '#F4F7F6',
  textPrimary: '#1A2E2A',
  textSecondary: '#5C6B67',
  textMuted: '#8B9B97',
  border: '#E8EDEB',
  error: '#B91C1C',
} as const;

const DEFAULT_CATEGORY_IMAGE =
  'https://cdn3d.iconscout.com/3d/premium/thumb/quran-book-open-3d-icon-png-download-8769934.png';

const cardShadow = Platform.select({
  ios: { shadowColor: '#063628', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 4 },
});

const getCategoryColor = (category: ContentCategory): string => {
  const colors: Record<ContentCategory, string> = {
    Hadis: '#0d9488',
    Dua: '#8B6F47',
    'Prophet Stories': '#7C3AED',
    'Quran Surah': '#2C5F7A',
    'Islamic Facts': '#D97706',
  };
  return colors[category] ?? '#5C6B67';
};

/** Solid (opaque) light background for category cards - same hue as getCategoryColor, no transparency. */
const getCategoryCardBg = (category: ContentCategory): string => {
  const solids: Record<ContentCategory, string> = {
    Hadis: '#CCFBF1',
    Dua: '#EDE4D8',
    'Prophet Stories': '#EDE9FE',
    'Quran Surah': '#D6E8ED',
    'Islamic Facts': '#FEF3C7',
  };
  return solids[category] ?? '#E8EDEB';
};

const getCategoryIcon = (category: ContentCategory): keyof typeof Ionicons.glyphMap => {
  const icons: Record<ContentCategory, string> = {
    Hadis: 'book',
    Dua: 'heart',
    'Prophet Stories': 'time',
    'Quran Surah': 'library',
    'Islamic Facts': 'bulb',
  };
  return (icons[category] || 'bookmark') as keyof typeof Ionicons.glyphMap;
};

const categoryToSlug = (category: ContentCategory): string => {
  if (category === 'Hadis') return 'hadis';
  if (category === 'Dua') return 'dua';
  if (category === 'Prophet Stories') return 'prophet-stories';
  if (category === 'Quran Surah') return 'quran-surah';
  return 'islamic-facts';
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    stats,
    preferences,
    setPreferences,
    learnedCardIds,
    logout,
    authToken,
    cardsLearnedToday,
    dailyLimit,
    userEmail,
    userAge,
    preferredLanguage,
    allCards,
    finishedDetailCardIds,
    categoryStats,
    loadCategoryStats,
    statsOverview,
  } = useStore();

  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  React.useEffect(() => {
    if (authToken && categoryStats === null) loadCategoryStats();
  }, [authToken, categoryStats, loadCategoryStats]);

  const handleLogout = () => {
    logout();
    // Navigation will be reset automatically by AppNavigator useEffect
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'Are you sure? This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount(authToken ?? null);
            if (result.success) {
              logout();
            } else {
              Alert.alert(
                'Error',
                result.error ?? 'Could not delete account. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  // Static user data for now (email from store when set from login)
  const displayEmail = userEmail || 'ahmed.ali@example.com';

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadCategoryStats();
    setRefreshing(false);
  }, [loadCategoryStats]);

  const handleTogglePreference = React.useCallback(
    (category: ContentCategory) => {
      const next = preferences.includes(category)
        ? preferences.filter((c) => c !== category)
        : [...preferences, category];
      setPreferences(next);
    },
    [preferences, setPreferences]
  );

  const handleClosePreferencesModal = React.useCallback(() => {
    setPreferencesModalVisible(false);
  }, []);

  // Progress derived from store categoryStats (from API progress/user-progress-stats) when available, else from local cards
  const contentProgressItems = CONTENT_CATEGORIES.map((category) => {
    const backend = categoryStats?.[category];
    const totalInCategory =
      backend?.total ?? allCards.filter((c) => c.category === category).length;
    const finishedInCategory =
      backend?.completed ??
      allCards.filter(
        (c) => c.category === category && finishedDetailCardIds.includes(c.id)
      ).length;
    const learnedInCategory = allCards.filter(
      (c) => c.category === category && learnedCardIds.includes(c.id)
    ).length;
    const topicColor = getCategoryColor(category);
    const displayCount =
      totalInCategory === 0 ? '—' : `${finishedInCategory} / ${totalInCategory}`;
    const percent =
      totalInCategory > 0
        ? Math.round((finishedInCategory / totalInCategory) * 100)
        : 0;
    return {
      id: category,
      label: category,
      displayCount,
      finishedInCategory,
      totalInCategory,
      learnedInCategory,
      percent,
      icon: getCategoryIcon(category),
      image: backend?.image,
      topicColor,
      cardBg: `${topicColor}12`,
      cardBgSolid: getCategoryCardBg(category),
    };
  });

  const totalFinished = finishedDetailCardIds.length;
  const totalCards = allCards.length;

  const displayLearnt = statsOverview?.consumed ?? totalFinished;
  const displayStreak = statsOverview?.streak ?? stats.streakDays;
  const displayTopics = statsOverview?.topic ?? preferences.length;

  const handleShareStreak = React.useCallback(() => {
    Share.share({
      message: `I'm on a ${displayStreak} day learning streak with Barkat Daily! 🔥`,
      title: 'My learning streak',
    }).catch(() => { });
  }, [displayStreak]);

  const streakMessage =
    displayStreak > 0
      ? "This is the longest streak you've ever had!"
      : "Keep the flame lit—learn something today!";

  // Badges: first 2 unlocked (streak >= 1, streak >= 7), next 2 locked
  const streakBadges = [
    { id: '1', unlocked: displayStreak >= 1, icon: 'flame' as const },
    { id: '2', unlocked: displayStreak >= 7, icon: 'flash' as const },
    { id: '3', unlocked: false, icon: 'rocket' as const },
    { id: '4', unlocked: false, icon: 'trophy' as const },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgPatternWrap}>
          <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
        </View>
      </View>
      <View style={styles.contentLayer}>
        <AppHeader
          title="Profile"
          rightComponent={
            <TouchableOpacity
              onPress={() => setPreferencesModalVisible(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.headerSettingsTouch}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.brand}
            />
          }
        >
          {/* Streak top section — light blue gradient, title + share, big number + flame, message, email, badges */}
          <View style={styles.streakSection}>
            <View style={styles.streakSectionGradient} pointerEvents="none" />
            <View style={styles.streakHeader}>
              <Text style={styles.streakSectionTitle}>Streak</Text>
              <TouchableOpacity
                onPress={handleShareStreak}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.streakShareTouch}
              >
                <Ionicons name="share-outline" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.streakMainBlock}
              onPress={() => setStreakModalVisible(true)}
              activeOpacity={0.95}
            >
              <View style={styles.streakNumberBlock}>
                <Text style={styles.streakNumber}>{displayStreak}</Text>
                <Text style={styles.streakDaysLabel}>Streak Days</Text>
              </View>
              <View style={styles.streakFlameWrap}>
                <Ionicons name="flame" size={64} color="#EA580C" />
              </View>
            </TouchableOpacity>
            <Text style={styles.streakMessage}>{streakMessage}</Text>
            <Text style={styles.streakEmail} numberOfLines={1}>{displayEmail}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.streakBadgesRow}
              style={styles.streakBadgesScroll}
            >
              {streakBadges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.streakBadge,
                    badge.unlocked ? styles.streakBadgeActive : styles.streakBadgeLocked,
                  ]}
                >
                  <Ionicons
                    name={badge.icon}
                    size={28}
                    color={badge.unlocked ? '#EA580C' : COLORS.textMuted}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Stats — Streak, Learnt, Topics */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statCardBase, styles.streakCard, cardShadow]}
              onPress={() => setStreakModalVisible(true)}
              activeOpacity={0.9}
            >
              <View style={styles.statCardGradientTop} pointerEvents="none" />
              <View style={styles.statCardContent}>
                <Text style={styles.statCardValue}>{displayStreak}</Text>
                <Text style={styles.statCardLabel}>Streak</Text>
              </View>
              <View style={styles.statCardIconWrap} pointerEvents="none">
                <Ionicons name="flame" size={48} color="#EA580C" />
              </View>
            </TouchableOpacity>
            <View style={[styles.statCardBase, styles.learntCard, cardShadow]}>
              <View style={[styles.statCardGradientTop, styles.learntCardGradient]} pointerEvents="none" />
              <View style={styles.statCardContent}>
                <Text style={styles.statCardValue}>{displayLearnt}</Text>
                <Text style={styles.statCardLabel}>Learnt</Text>
              </View>
              <View style={styles.statCardIconWrap} pointerEvents="none">
                <Ionicons name="book" size={48} color="#0d9488" />
              </View>
            </View>
            <View style={[styles.statCardBase, styles.topicsCard, cardShadow]}>
              <View style={[styles.statCardGradientTop, styles.topicsCardGradient]} pointerEvents="none" />
              <View style={styles.statCardContent}>
                <Text style={styles.statCardValue}>{displayTopics}</Text>
                <Text style={styles.statCardLabel}>Topics</Text>
              </View>
              <View style={styles.statCardIconWrap} pointerEvents="none">
                <Ionicons name="layers" size={48} color="#7C3AED" />
              </View>
            </View>
          </View>

          <StreakCelebrationModal
            visible={streakModalVisible}
            onClose={() => setStreakModalVisible(false)}
            streakDays={displayStreak}
            cardsLearnedToday={cardsLearnedToday}
            dailyLimit={dailyLimit}
          />

          {/* My learnings — flat cards with image + progress bar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My learnings</Text>
            <View style={styles.progressList}>
              {contentProgressItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  style={[
                    styles.flatProgressCard,
                    cardShadow,
                    {
                      backgroundColor: item.cardBgSolid,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    },
                  ]}
                  onPress={() =>
                    (navigation as any).navigate('CompletedCategory', {
                      categorySlug: categoryToSlug(item.id as ContentCategory),
                      categoryLabel: item.label,
                    })
                  }
                >
                  <View style={[styles.flatCardImageWrap, { backgroundColor: `${item.topicColor}18` }]}>
                    <Image
                      source={{ uri: item.image ?? DEFAULT_CATEGORY_IMAGE }}
                      style={styles.flatCardImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.flatCardContent}>
                    <Text style={styles.flatCardCategory} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={styles.flatCardGoal} numberOfLines={1}>
                      {item.totalInCategory === 0
                        ? 'No cards yet'
                        : `${item.finishedInCategory} learnt`}
                    </Text>
                    {item.percent === 100 && item.totalInCategory > 0 ? (
                      <View style={styles.flatCardFinishedRow}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.brand} />
                        <Text style={styles.flatCardFinishedText}>All finished</Text>
                      </View>
                    ) : (
                      <View style={styles.flatCardProgressRow}>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${item.percent}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressBarPercent}>{item.percent}%</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>



          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={[styles.aboutCard, cardShadow]}>
              <Text style={styles.aboutText}>
                Barkat Daily helps you learn through bite-sized, swipeable cards.
                Choose your interests and learn at your own pace.
              </Text>
            </View>
          </View>

          {/* Logout & Delete */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.logoutButton, cardShadow]}
              onPress={() => {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout? This will reset your progress.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: handleLogout },
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={styles.deleteAccountText}>Delete account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={preferencesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePreferencesModal}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Topics</Text>
            <TouchableOpacity
              onPress={handleClosePreferencesModal}
              style={styles.modalDoneButton}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <PreferenceSelector
            selectedCategories={preferences}
            onToggleCategory={handleTogglePreference}
            onContinue={handleClosePreferencesModal}
          />
        </SafeAreaView>
      </Modal>
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
  contentLayer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 100,
  },
  streakSection: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E0F2FE',
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
    position: 'relative',
  },
  streakSectionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  streakSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  streakShareTouch: {
    padding: 4,
  },
  streakMainBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  streakNumberBlock: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#2563EB',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  streakDaysLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  streakFlameWrap: {
    marginLeft: 12,
  },
  streakMessage: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  streakEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 14,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  streakBadgesScroll: {
    marginHorizontal: -18,
  },
  streakBadgesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
  },
  streakBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  streakBadgeActive: {
    backgroundColor: '#BAE6FD',
    borderColor: '#2563EB',
  },
  streakBadgeLocked: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CARD_GAP,
    marginBottom: 24,
  },
  statCardBase: {
    flex: 1,
    minHeight: 100,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
  },
  streakCard: {
    backgroundColor: '#FDE047',
  },
  learntCard: {
    backgroundColor: '#CCFBF1',
  },
  topicsCard: {
    backgroundColor: '#EDE9FE',
  },
  statCardGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  learntCardGradient: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  topicsCardGradient: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  statCardContent: {
    alignSelf: 'flex-start',
  },
  statCardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
    opacity: 0.85,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  statCardIconWrap: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  progressList: {
    gap: 12,
  },
  flatProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
  },
  flatCardImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  flatCardImage: {
    width: '100%',
    height: '100%',
  },
  flatCardContent: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  flatCardCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 1,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  flatCardGoal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  flatCardFinishedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flatCardFinishedText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  flatCardProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#B0BDB8',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 0,
    backgroundColor: COLORS.brand,
  },
  progressBarPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 36,
    textAlign: 'right',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
  },
  aboutText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  headerSettingsTouch: {
    padding: 4,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  modalDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 12,
  },
  deleteAccountText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});
