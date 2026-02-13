import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../store/useStore';

export const ProgressScreen: React.FC = () => {
  const { stats, learnedCardIds, cardsLearnedToday, dailyLimit } = useStore();
  const progress = dailyLimit > 0 ? Math.min((cardsLearnedToday / dailyLimit) * 100, 100) : 0;
  const streak = stats.streakDays;
  const totalLearned = learnedCardIds.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.bg} pointerEvents="none" />
      <AppHeader title="Progress" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🔥</Text>
          <Text style={styles.heroNumber}>{streak}</Text>
          <Text style={styles.heroLabel}>day streak</Text>
        </View>

        {/* Today ring */}
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>Today</Text>
          <View style={styles.ringWrap}>
            <View style={styles.ringTrack} />
            <View
              style={[
                styles.ringFillHalf,
                {
                  transform: [
                    { rotate: `${-90 + Math.min(progress / 50, 1) * 180}deg` },
                  ],
                },
              ]}
            />
            {progress > 50 && (
              <View
                style={[
                  styles.ringFillHalfBottom,
                  {
                    transform: [
                      { rotate: `${-90 + ((progress - 50) / 50) * 180}deg` },
                    ],
                  },
                ]}
              />
            )}
            <View style={styles.ringCenter}>
              <Text style={styles.ringCenterText}>
                {cardsLearnedToday}
                <Text style={styles.ringCenterSlash}>/</Text>
                {dailyLimit}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalLearned}</Text>
            <Text style={styles.statLabel}>Learned</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{cardsLearnedToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{dailyLimit}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Every step counts.
        </Text>
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
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-black' },
    }),
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  todayCard: {
    alignItems: 'center',
    marginBottom: 28,
  },
  todayTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  ringWrap: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#e8e4e0',
  },
  ringFillHalf: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderTopColor: '#8B4789',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringFillHalfBottom: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#8B4789',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  ringCenterSlash: {
    fontWeight: '400',
    color: '#9ca3af',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  footer: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 32,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
});
