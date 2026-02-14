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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StreakCelebrationModal } from '../components/StreakCelebrationModal';
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../store/useStore';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const { stats, preferences, learnedCardIds, logout, cardsLearnedToday, dailyLimit, userEmail, userAge, preferredLanguage } = useStore();

  const handleLogout = () => {
    logout();
    // Navigation will be reset automatically by AppNavigator useEffect
  };

  // Static user data for now (email from store when set from login)
  const userName = 'Ahmed Ali';
  const displayEmail = userEmail || 'ahmed.ali@example.com';
  const avatarUri = 'https://i.pravatar.cc/150?img=12';

  // Your Overall Progress — colors aligned with Feed cards (SwipeCard getTopicColor)
  const contentProgressItems = [
    {
      id: '1',
      label: 'Hadis',
      count: 134,
      icon: 'book-outline' as const,
      topicColor: '#2D8659',
      cardBg: '#E8F3EC',
    },
    {
      id: '2',
      label: 'Prophet Stories',
      count: 39,
      icon: 'star-outline' as const,
      topicColor: '#5D4E37',
      cardBg: '#F2EDE6',
    },
    {
      id: '3',
      label: 'Dua',
      count: 0,
      icon: 'hands-outline' as const,
      topicColor: '#8B6F47',
      cardBg: '#F5EFE8',
      locked: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.bg} pointerEvents="none" />
      <AppHeader title="Profile" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{learnedCardIds.length}</Text>
            <Text style={styles.statLabel}>Learned</Text>
          </View>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => setStreakModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </TouchableOpacity>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{preferences.length}</Text>
            <Text style={styles.statLabel}>Topics</Text>
          </View>
        </View>

        <StreakCelebrationModal
          visible={streakModalVisible}
          onClose={() => setStreakModalVisible(false)}
          streakDays={stats.streakDays}
          cardsLearnedToday={cardsLearnedToday}
          dailyLimit={dailyLimit}
        />

        {/* Your Overall Progress — reference layout: 2-col cards, label + icon row, big count */}
        <View style={styles.section}>
          <View style={styles.progressSectionHeader}>
            <Text style={styles.sectionTitle}>Your Overall Progress</Text>
            <Ionicons name="options-outline" size={22} color="#1a1a1a" />
          </View>
          <View style={styles.progressGrid}>
            {contentProgressItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.overallProgressCard,
                  {
                    backgroundColor: item.locked ? '#F1F5F9' : item.cardBg,
                    borderColor: item.locked ? 'rgba(0,0,0,0.06)' : `${item.topicColor}20`,
                  },
                  item.locked && styles.progressCardLocked,
                ]}
              >
                <View style={styles.overallCardTopRow}>
                  <Text
                    style={[styles.overallCardLabel, item.locked && styles.progressLabelLocked]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  <View style={[styles.overallCardIconWrap, !item.locked && { backgroundColor: `${item.topicColor}18` }]}>
                    <Ionicons
                      name={item.icon}
                      size={28}
                      color={item.locked ? '#9ca3af' : item.topicColor}
                    />
                  </View>
                </View>
                <Text style={[styles.overallCardCount, item.locked && styles.progressCountLocked]}>
                  {item.locked ? '0' : item.count}
                </Text>
              </View>
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
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  progressCardLocked: {
    opacity: 0.8,
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
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  overallCardLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    paddingRight: 8,
    lineHeight: 20,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  progressLabelLocked: {
    color: '#9ca3af',
  },
  overallCardCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  progressCountLocked: {
    color: '#9ca3af',
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
});
