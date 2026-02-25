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
  if (category === 'Prophet Stories') return 'prophet_stories';
  if (category === 'Quran Surah') return 'quran_surah';
  return 'facts';
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
  const userName = 'Ahmed Ali';
  const displayEmail = userEmail || 'ahmed.ali@example.com';
  const avatarUri = 'https://i.pravatar.cc/150?img=12';

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
    return {
      id: category,
      label: category,
      displayCount,
      finishedInCategory,
      totalInCategory,
      learnedInCategory,
      icon: getCategoryIcon(category),
      topicColor,
      cardBg: `${topicColor}12`,
    };
  });

  const totalFinished = finishedDetailCardIds.length;
  const totalCards = allCards.length;

  const displayLearnt = statsOverview?.consumed ?? totalFinished;
  const displayStreak = statsOverview?.streak ?? stats.streakDays;
  const displayTopics = statsOverview?.topic ?? preferences.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.bg} pointerEvents="none" />
      <AppHeader
        title="Profile"
        rightComponent={
          <TouchableOpacity
            onPress={() => setPreferencesModalVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerSettingsTouch}
          >
            <Ionicons name="settings-outline" size={24} color="#1a1a1a" />
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
            tintColor="#2D8659"
          />
        }
      >
        {/* Simple profile: avatar, email, age — no card background */}
        <View style={styles.profileSimple}>
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.profileSimpleInfo}>
            <Text style={styles.profileSimpleLine} numberOfLines={1}>{displayEmail}</Text>
            <Text style={styles.profileSimpleLine}>
              {userAge != null ? `${userAge} years` : '—'}
            </Text>
          </View>
        </View>

        {/* Stats: total learnt (from API overview), streak, topics */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{displayLearnt}</Text>
            <Text style={styles.statLabel}>Learnt</Text>
          </View>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => setStreakModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.statValue}>{displayStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </TouchableOpacity>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{displayTopics}</Text>
            <Text style={styles.statLabel}>Topics</Text>
          </View>
        </View>

        <StreakCelebrationModal
          visible={streakModalVisible}
          onClose={() => setStreakModalVisible(false)}
          streakDays={displayStreak}
          cardsLearnedToday={cardsLearnedToday}
          dailyLimit={dailyLimit}
        />

        {/* Your Overall Progress — reference layout: 2-col cards, label + icon row, big count */}
        <View style={styles.section}>
          <View style={styles.progressSectionHeader}>
            <Text style={styles.sectionTitle}>My learnings</Text>
          </View>
          <View style={styles.progressGrid}>
            {contentProgressItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={[
                  styles.overallProgressCard,
                  {
                    backgroundColor: item.cardBg,
                    borderColor: `${item.topicColor}20`,
                  },
                ]}
                onPress={() =>
                  navigation.navigate(
                    'CompletedCategory' as never,
                    {
                      categorySlug: categoryToSlug(item.id as ContentCategory),
                      categoryLabel: item.label,
                    } as never
                  )
                }
              >
                <View style={styles.overallCardRow}>
                  <View style={[styles.overallCardIconWrap, { backgroundColor: `${item.topicColor}18` }]}>
                    <Ionicons name={item.icon} size={20} color={item.topicColor} />
                  </View>
                  <Text style={styles.overallCardLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.overallCardCount}>{item.displayCount}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Barkat Reads helps you learn through bite-sized, swipeable cards.
            Choose your interests and learn at your own pace.
          </Text>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout? This will reset your progress.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: handleLogout,
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#DC2626" />
            <Text style={styles.deleteAccountText}>Delete account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    backgroundColor: '#f2ede8',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f2ede8',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
  },
  profileSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    marginRight: 16,
  },
  profileSimpleInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileSimpleLine: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 2,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
    fontStyle: 'italic',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  aboutText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 24,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  progressSectionHeader: {
    marginBottom: 10,
  },
  headerSettingsTouch: {
    padding: 4,
  },
  progressGrid: {
    gap: 8,
  },
  overallProgressCard: {
    width: '100%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  overallCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overallCardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  overallCardLabel: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    paddingRight: 8,
    lineHeight: 18,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  overallCardCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  modalDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingVertical: 4,
  },
  deleteAccountText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#DC2626',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
});
