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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StreakCelebrationModal } from '../components/StreakCelebrationModal';
import { PreferenceSelector } from '../components/PreferenceSelector';
import { useStore } from '../store/useStore';
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

/** More opaque card background from API hex (e.g. #8B6F47 -> tint). */
const cardBgFromApiColor = (hex: string | undefined): string => {
  if (hex && /^#[0-9A-Fa-f]{6}$/i.test(hex)) return `${hex}50`;
  return '#E8EDEB';
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
    categoriesFromApi,
    loadCategoryStats,
    statsOverview,
  } = useStore();

  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (authToken && categoriesFromApi === null) loadCategoryStats();
  }, [authToken, categoriesFromApi, loadCategoryStats]);

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

  const handleToggleSlug = React.useCallback(
    (slug: string) => {
      const next = preferences.includes(slug)
        ? preferences.filter((s) => s !== slug)
        : [...preferences, slug];
      setPreferences(next);
    },
    [preferences, setPreferences]
  );

  const handleClosePreferencesModal = React.useCallback(() => {
    setPreferencesModalVisible(false);
  }, []);

  // Topic list from progress API only (no hardcoded list when logged in)
  const topicOptions = React.useMemo(() => {
    const fromApi = categoriesFromApi;
    if (fromApi && Object.keys(fromApi).length > 0) {
      return Object.entries(fromApi).map(([slug, data]) => ({
        slug,
        label: data.categoryName ?? slug,
      }));
    }
    return [];
  }, [categoriesFromApi]);

  // My learnings: from backend categories only (slug, categoryName, total, completed, image, backgroundColor)
  const contentProgressItems = Object.entries(categoriesFromApi ?? {}).map(([slug, data]) => {
    const totalInCategory = data.total ?? 0;
    const finishedInCategory = data.completed ?? 0;
    const topicColor = data.backgroundColor && /^#[0-9A-Fa-f]{6}$/i.test(data.backgroundColor)
      ? data.backgroundColor
      : COLORS.brand;
    const percent = totalInCategory > 0 ? Math.round((finishedInCategory / totalInCategory) * 100) : 0;
    return {
      id: slug,
      slug,
      label: data.categoryName ?? slug,
      displayCount: totalInCategory === 0 ? '—' : `${finishedInCategory} / ${totalInCategory}`,
      finishedInCategory,
      totalInCategory,
      percent,
      image: data.image,
      topicColor,
      cardBgSolid: cardBgFromApiColor(data.backgroundColor),
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

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgPatternWrap}>
          <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
        </View>
      </View>
      <View style={styles.contentLayer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.brand}
            />
          }
        >
          {/* Top profile card — scrolls with content */}
          <View style={[styles.topCard, { paddingTop: Math.max(insets.top, 12) + 16 }]}>
            <View style={styles.topCardHeaderRow}>
              <Text style={styles.topCardHeaderTitle}>Profile</Text>
              <TouchableOpacity
                onPress={() => setPreferencesModalVisible(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.headerSettingsTouch}
              >
                <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.topCardRow}>
              <View style={styles.topCardCorner}>
                <Text style={styles.topCardCornerValue}>{displayStreak}</Text>
                <Text style={styles.topCardCornerLabel}>Streak</Text>
              </View>
              <View style={[styles.topCardCorner, { alignItems: 'flex-end' }]}>
                <Text style={styles.topCardCornerValue}>{displayLearnt}</Text>
                <Text style={styles.topCardCornerLabel}>Learnt</Text>
              </View>
            </View>
            <View style={styles.topCardCenter}>
              <View style={styles.avatarRing}>
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayEmail.split('@')[0])}&background=5C4A3A&color=fff&size=192` }}
                  style={styles.avatarImage}
                />
              </View>
              <Text style={styles.topCardName} numberOfLines={1}>
                {displayEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Text>
              <Text style={styles.topCardEmail} numberOfLines={1}>{displayEmail}</Text>
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
          <View style={[styles.section, { marginTop: 24 }]}>
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
                      categorySlug: item.slug,
                      categoryLabel: item.label,
                    })
                  }
                >
                  <View style={[styles.flatCardImageWrap, { backgroundColor: `${item.topicColor}40` }]}>
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
                              { width: `${item.percent}%`, backgroundColor: item.topicColor },
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
            topics={topicOptions}
            selectedSlugs={preferences}
            onToggleSlug={handleToggleSlug}
            onContinue={handleClosePreferencesModal}
            loading={authToken != null && categoriesFromApi === null}
            emptyMessage={topicOptions.length === 0 && categoriesFromApi !== null ? 'No topics from server.' : undefined}
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
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingTop: 0,
    paddingBottom: 100,
  },
  topCard: {
    backgroundColor: 'rgba(139, 111, 71, 0.4)',
    paddingBottom: 28,
    paddingHorizontal: 24,
    marginBottom: 0,
    borderBottomLeftRadius: 72,
    borderBottomRightRadius: 72,
    overflow: 'hidden',
    marginHorizontal: -PADDING,
  },
  topCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topCardHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  topCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  topCardCorner: {
    alignItems: 'flex-start',
  },
  topCardCornerValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  topCardCornerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  topCardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  topCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  topCardEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
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
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
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
