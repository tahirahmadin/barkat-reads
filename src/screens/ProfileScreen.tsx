import React from 'react';
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
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../store/useStore';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { stats, preferences, learnedCardIds, logout } = useStore();

  const handleLogout = () => {
    logout();
    // Navigation will be reset automatically by AppNavigator useEffect
  };

  // Static user data for now
  const userName = 'Ahmed Ali';
  const userEmail = 'ahmed.ali@example.com';
  const avatarUri = 'https://i.pravatar.cc/150?img=12';

  // Progress milestones with icons
  const progressMilestones = [
    {
      id: '1',
      title: 'Hadis',
      progress: 12,
      total: 100,
      icon: 'book-outline',
      completed: false,
    },
    {
      id: '2',
      title: 'Stories',
      progress: 1,
      total: 100,
      icon: 'star-outline',
      completed: false,
    },
    {
      id: '3',
      title: 'Dua',
      progress: 0,
      total: 100,
      icon: 'hands-outline',
      completed: false,
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{learnedCardIds.length}</Text>
            <Text style={styles.statLabel}>Learned</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{preferences.length}</Text>
            <Text style={styles.statLabel}>Topics</Text>
          </View>
        </View>

        {/* Content Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Progress</Text>
          <View style={styles.progressContainer}>
            {progressMilestones.map((milestone) => (
              <View
                key={milestone.id}
                style={[
                  styles.progressCard,
                  milestone.locked && styles.progressCardLocked,
                ]}
              >
                <View style={styles.progressCardContent}>
                  {/* Icon */}
                  <View style={[
                    styles.iconContainer,
                    milestone.locked && styles.iconContainerLocked
                  ]}>
                    <Ionicons
                      name={milestone.icon as any}
                      size={24}
                      color={milestone.locked ? '#9ca3af' : '#2D8659'}
                    />
                  </View>

                  {/* Content */}
                  <View style={styles.progressCardText}>
                    <View style={styles.progressHeader}>
                      <Text style={[
                        styles.progressTitle,
                        milestone.locked && styles.progressTitleLocked
                      ]}>
                        {milestone.title}
                      </Text>
                      {milestone.locked ? (
                        <View style={styles.lockedHeader}>
                          <Ionicons name="lock-closed" size={14} color="#9ca3af" />
                          <Text style={styles.lockedText}>Locked</Text>
                        </View>
                      ) : (
                        <Text style={styles.progressCount}>
                          {milestone.progress}/{milestone.total}
                        </Text>
                      )}
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(milestone.progress / milestone.total) * 100}%` },
                          milestone.locked && styles.progressFillLocked,
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your interests</Text>
          {preferences.length > 0 ? (
            <View style={styles.chips}>
              {preferences.map((topic) => (
                <View key={topic} style={styles.chip}>
                  <Text style={styles.chipText}>{topic}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No topics selected yet. Set your interests to see relevant cards.
            </Text>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Barkat Learn helps you learn through bite-sized, swipeable cards.
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D8659',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  userEmail: {
    fontSize: 15,
    color: '#6b7280',
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
  progressContainer: {
    gap: 12,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  progressCardLocked: {
    opacity: 0.7,
  },
  progressCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerLocked: {
    backgroundColor: '#F3F4F6',
  },
  progressCardText: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  progressTitleLocked: {
    color: '#9ca3af',
  },
  progressCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D8659',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D8659',
    borderRadius: 3,
  },
  progressFillLocked: {
    backgroundColor: '#d1d5db',
    width: '0%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    gap: 10,
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
