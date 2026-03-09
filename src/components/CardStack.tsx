import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeCard } from './SwipeCard';
import { LearningCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Animated "Swipe for next" bubble shown below the card deck */
function SwipeHintBubble() {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true }
    );
    bounce.start();
    return () => bounce.stop();
  }, [translateY]);

  return (
    <Animated.View
      style={[styles.swipeHintBubble, { transform: [{ translateY }] }]}
    >
      <Text style={styles.swipeHintText}>Swipe for next</Text>
      <Ionicons name="arrow-up-outline" size={18} color="#4A5568" />
    </Animated.View>
  );
}

interface CardStackProps {
  cards: LearningCard[];
  onCardLearned: (cardId: string) => void;
  onCardBookmark: (cardId: string) => void;
  dailyLimitReached: boolean;
  detailOpenedCardIds: string[];
  onDetailOpen: (cardId: string) => void;
  onDetailFinish: (cardId: string) => void;
  onReset?: () => void;
  bookmarkedCardIds?: string[];
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  onCardLearned,
  onCardBookmark,
  dailyLimitReached,
  detailOpenedCardIds,
  onDetailOpen,
  onDetailFinish,
  onReset,
  bookmarkedCardIds = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  const prevCardIdsRef = useRef<string>('');

  useEffect(() => {
    const ids = cards.map((c) => c.id).join(',');
    if (ids !== prevCardIdsRef.current) {
      prevCardIdsRef.current = ids;
      setCurrentIndex(0);
      setReachedEnd(false);
    }
  }, [cards]);

  const moveToNextCard = useCallback(() => {
    setCurrentIndex((prev) => {
      if (cards.length === 0) return 0;
      const next = prev + 1;
      if (next >= cards.length) {
        setReachedEnd(true);
        return prev;
      }
      return next;
    });
  }, [cards.length]);

  const handleReadAgain = useCallback(() => {
    setReachedEnd(false);
    setCurrentIndex(0);
    onReset?.();
  }, [onReset]);

  const handleSwipeUp = useCallback(
    (card: LearningCard) => {
      if (card.cardType === 'flash_card') {
        moveToNextCard();
        return;
      }
      if (detailOpenedCardIds.includes(card.id)) {
        moveToNextCard();
        return;
      }
      onCardLearned(card.id);
      moveToNextCard();
    },
    [moveToNextCard, detailOpenedCardIds, onCardLearned]
  );

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✨</Text>
        <Text style={styles.emptyText}>No Cards Available</Text>
        <Text style={styles.emptySubtext}>
          Please select your interests to see learning cards.
        </Text>
      </View>
    );
  }

  if (reachedEnd) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>No new cards</Text>
        <Text style={styles.emptySubtext}>
          You’ve seen all the cards in this batch. Tap below to read again from the start or pull to refresh for new content.
        </Text>
        <TouchableOpacity
          style={styles.readAgainButton}
          onPress={handleReadAgain}
          activeOpacity={0.85}
        >
          <Text style={styles.readAgainButtonText}>Read again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const idx = currentIndex % cards.length;
  const currentCard = cards[idx];
  const nextCard1 = cards[(idx + 1) % cards.length];
  const nextCard2 = cards[(idx + 2) % cards.length];

  return (
    <View style={styles.container}>
      <View
        style={styles.cardContainer}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        {nextCard2 && (
          <SwipeCard
            key={`stack-${nextCard2.id}-2`}
            card={nextCard2}
            onSwipeUp={() => {}}
            onTap={() => {}}
            onSave={() => {}}
            isSaved={bookmarkedCardIds.includes(nextCard2.id)}
            containerHeight={containerHeight}
            isStackCard={true}
            stackIndex={2}
          />
        )}

        {nextCard1 && (
          <SwipeCard
            key={`stack-${nextCard1.id}-1`}
            card={nextCard1}
            onSwipeUp={() => {}}
            onTap={() => {}}
            onSave={() => {}}
            isSaved={bookmarkedCardIds.includes(nextCard1.id)}
            containerHeight={containerHeight}
            isStackCard={true}
            stackIndex={1}
          />
        )}

        {currentCard && (
          <SwipeCard
            key={`active-${idx}`}
            card={currentCard}
            onSwipeUp={() => handleSwipeUp(currentCard)}
            onTap={() => {}}
            onSave={onCardBookmark}
            isSaved={bookmarkedCardIds.includes(currentCard.id)}
            onDetailOpen={onDetailOpen}
            onDetailFinish={onDetailFinish}
            containerHeight={containerHeight}
            isStackCard={false}
            stackIndex={0}
          />
        )}
      </View>
      <SwipeHintBubble />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    overflow: 'visible',
    position: 'relative',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  readAgainButton: {
    backgroundColor: '#063628',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  readAgainButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  swipeHintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 28,
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});
