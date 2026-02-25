import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CardStack } from '../components/CardStack';
import { AppHeader } from '../components/AppHeader';
import { StreakCelebrationModal } from '../components/StreakCelebrationModal';
import { useStore } from '../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RAY_WIDTH = 72;
const RAY_LEFT = (SCREEN_WIDTH - RAY_WIDTH) / 2;

function useLoopAnimation(
  initial: number,
  toValue: number,
  duration: number,
  delay = 0
) {
  const value = useRef(new Animated.Value(initial)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: initial,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [value, initial, toValue, duration, delay]);
  return value;
}

function useFloatingStar(
  duration: number,
  delay: number,
  deltaY: number,
  deltaX: number
) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: deltaY,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: deltaX,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [translateY, translateX, duration, delay, deltaY, deltaX]);
  return { translateX, translateY };
}

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

  const breathGlow = useLoopAnimation(0.85, 1.15, 4000);
  const breathSource = useLoopAnimation(0.45, 0.7, 3500, 200);
  const star1 = useFloatingStar(6000, 0, -8, 4);
  const star2 = useFloatingStar(7000, 400, 6, -6);
  const star3 = useFloatingStar(5500, 800, -5, -5);
  const star4 = useFloatingStar(6500, 200, 7, 5);
  const star5 = useFloatingStar(5800, 600, -6, 7);
  const star6 = useFloatingStar(6200, 300, 5, -4);
  const star7 = useFloatingStar(5900, 900, -7, 6);
  const star8 = useFloatingStar(6400, 500, 8, -8);
  const star9 = useFloatingStar(6100, 100, -4, -7);

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
        <View style={styles.vignette} />
        {/* Divine light source – origin above (pulsing) */}
        <Animated.View style={[styles.divineSource, { opacity: breathSource }]} />
        <View style={[styles.divineRay, styles.ray1]} />
        <View style={[styles.divineRay, styles.ray2]} />
        <View style={[styles.divineRay, styles.ray3]} />
        <View style={[styles.divineRay, styles.ray4]} />
        <View style={[styles.divineRay, styles.ray5]} />
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowCenter} />
        <Animated.View
          style={[
            styles.bgGlowCenterInner,
            { transform: [{ scale: breathGlow }] },
          ]}
        />
        <View style={styles.bgWarmBottom} />
        {/* Subtle stars – baraka (floating) */}
        <Animated.View
          style={[
            styles.starDot,
            styles.star1,
            { transform: [{ translateX: star1.translateX }, { translateY: star1.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star2,
            { transform: [{ translateX: star2.translateX }, { translateY: star2.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star3,
            { transform: [{ translateX: star3.translateX }, { translateY: star3.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star4,
            { transform: [{ translateX: star4.translateX }, { translateY: star4.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star5,
            { transform: [{ translateX: star5.translateX }, { translateY: star5.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star6,
            { transform: [{ translateX: star6.translateX }, { translateY: star6.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star7,
            { transform: [{ translateX: star7.translateX }, { translateY: star7.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star8,
            { transform: [{ translateX: star8.translateX }, { translateY: star8.translateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.starDot,
            styles.star9,
            { transform: [{ translateX: star9.translateX }, { translateY: star9.translateY }] },
          ]}
        />
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
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderLeftWidth: 60,
    borderRightWidth: 60,
    borderBottomWidth: 100,
    borderColor: 'rgba(180, 165, 150, 0.15)',
  },
  divineSource: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 90,
    top: -60,
    width: 180,
    height: 120,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 230, 200, 0.5)',
  },
  divineRay: {
    position: 'absolute',
    top: 0,
    height: '58%',
    width: RAY_WIDTH,
    left: RAY_LEFT,
    backgroundColor: 'rgba(255, 240, 215, 0.14)',
    borderBottomLeftRadius: RAY_WIDTH / 2,
    borderBottomRightRadius: RAY_WIDTH / 2,
  },
  ray1: { left: RAY_LEFT - 100 },
  ray2: { left: RAY_LEFT - 50 },
  ray3: { left: RAY_LEFT },
  ray4: { left: RAY_LEFT + 50 },
  ray5: { left: RAY_LEFT + 100 },
  bgGlowTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -100,
    height: '52%',
    backgroundColor: 'rgba(255, 235, 210, 0.32)',
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
  bgGlowCenter: {
    position: 'absolute',
    left: '50%',
    top: '38%',
    width: 480,
    height: 480,
    marginLeft: -240,
    marginTop: -240,
    borderRadius: 240,
    backgroundColor: 'rgba(139, 71, 137, 0.07)',
  },
  bgGlowCenterInner: {
    position: 'absolute',
    left: '50%',
    top: '38%',
    width: 280,
    height: 280,
    marginLeft: -140,
    marginTop: -140,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 248, 240, 0.25)',
  },
  bgWarmBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
    backgroundColor: 'rgba(195, 178, 165, 0.22)',
  },
  starDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 245, 230, 0.5)',
  },
  star1: { top: '18%', left: '12%' },
  star2: { top: '25%', right: '8%' },
  star3: { top: '42%', left: '6%' },
  star4: { top: '48%', right: '14%' },
  star5: { top: '65%', left: '10%' },
  star6: { top: '72%', right: '18%' },
  star7: { top: '85%', left: '15%' },
  star8: { top: '22%', left: '50%' },
  star9: { top: '78%', right: '6%' },
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
