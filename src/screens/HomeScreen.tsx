import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CardStack } from '../components/CardStack';
import { AppHeader } from '../components/AppHeader';
import { StreakCelebrationModal } from '../components/StreakCelebrationModal';
import { useStore } from '../store/useStore';

const PATTERN_IMG = require('../../assets/pattern.avif');

export const HomeScreen: React.FC = () => {
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const {
    loadContent,
    getAvailableCards,
    markCardAsLearned,
    bookmarkCard,
    unbookmarkCard,
    markDetailAsFinished,
    markDetailOpened,
    detailOpenedCardIds,
    stats,
    loading,
    error,
    cardsLearnedToday,
    dailyLimit,
    bookmarkedCardIds,
  } = useStore();

  useEffect(() => {
    loadContent();
  }, []);

  const handleToggleBookmark = useCallback(
    (cardId: string) => {
      if (bookmarkedCardIds.includes(cardId)) {
        unbookmarkCard(cardId);
      } else {
        bookmarkCard(cardId);
      }
    },
    [bookmarkedCardIds, bookmarkCard, unbookmarkCard]
  );

  const availableCards = getAvailableCards();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgPatternWrap}>
          <ImageBackground
            source={PATTERN_IMG}
            style={styles.bgPattern}
            resizeMode="repeat"
          />
        </View>
      </View>
      <View style={styles.container}>
        <AppHeader
          title="Barkat Daily"
          rightComponent={
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadContent}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={18} color="#1A202C" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.streakButton}
                onPress={() => setStreakModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.fireIcon}>🔥</Text>
                <Text style={styles.streakNumber}>{stats.streakDays}</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <StreakCelebrationModal
          visible={streakModalVisible}
          onClose={() => setStreakModalVisible(false)}
          streakDays={stats.streakDays}
          cardsLearnedToday={cardsLearnedToday}
          dailyLimit={dailyLimit}
        />
        <View style={styles.content}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#27ae60" />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <CardStack
              cards={availableCards}
              onCardLearned={markCardAsLearned}
              onCardBookmark={handleToggleBookmark}
              dailyLimitReached={false}
              detailOpenedCardIds={detailOpenedCardIds}
              onDetailOpen={markDetailOpened}
              onDetailFinish={markDetailAsFinished}
              bookmarkedCardIds={bookmarkedCardIds}
            />
          )}
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 70,
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  streakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fireIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  streakNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
});
