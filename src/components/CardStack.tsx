import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { SwipeCard } from './SwipeCard';
import { LearningCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardStackProps {
  cards: LearningCard[];
  onCardLearned: (cardId: string) => void;
  onCardSaved: (cardId: string) => void;
  dailyLimitReached: boolean;
  onReset?: () => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  onCardLearned,
  onCardSaved,
  dailyLimitReached,
  onReset,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<LearningCard[]>([]);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (cards.length > 0) {
      // Reset to first card when cards change
      setCurrentIndex(0);
    } else {
      setCurrentIndex(0);
      setVisibleCards([]);
    }
  }, [cards]);

  useEffect(() => {
    // Update visible cards when currentIndex or cards change
    if (cards.length > 0) {
      const normalizedIndex = currentIndex % cards.length; // Loop back to start
      const newVisibleCards = cards.slice(
        normalizedIndex,
        Math.min(normalizedIndex + 3, cards.length)
      );
      setVisibleCards(newVisibleCards);
    }
  }, [currentIndex, cards]);

  const handleSwipeUp = (cardId: string) => {
    // Swipe up marks as learned and moves to next card
    onCardLearned(cardId);
    moveToNextCard();
  };

  const moveToNextCard = () => {
    setTimeout(() => {
      if (cards.length > 0) {
        const nextIndex = (currentIndex + 1) % cards.length; // Loop back to start
        setCurrentIndex(nextIndex);
      }
    }, 300);
  };

  const handleTap = () => {
    // Card expansion handled in SwipeCard component
  };

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

  const currentCard = cards[currentIndex % cards.length];

  // Get next 2 cards for the stack behind
  const getNextCard = (offset: number) => {
    const index = (currentIndex + offset) % cards.length;
    return cards[index];
  };

  const nextCard1 = getNextCard(1);
  const nextCard2 = getNextCard(2);

  return (
    <View style={styles.container}>
      <View
        style={styles.cardContainer}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        {/* Background card 2 (furthest back) */}
        {nextCard2 && (
          <SwipeCard
            key={`stack-${nextCard2.id}-2`}
            card={nextCard2}
            onSwipeUp={() => { }}
            onTap={() => { }}
            onSave={() => { }}
            containerHeight={containerHeight}
            isStackCard={true}
            stackIndex={2}
          />
        )}

        {/* Background card 1 (middle) */}
        {nextCard1 && (
          <SwipeCard
            key={`stack-${nextCard1.id}-1`}
            card={nextCard1}
            onSwipeUp={() => { }}
            onTap={() => { }}
            onSave={() => { }}
            containerHeight={containerHeight}
            isStackCard={true}
            stackIndex={1}
          />
        )}

        {/* Current card (on top) */}
        {currentCard && (
          <SwipeCard
            key={`${currentCard.id}-${currentIndex}`}
            card={currentCard}
            onSwipeUp={() => handleSwipeUp(currentCard.id)}
            onTap={handleTap}
            onSave={onCardSaved}
            containerHeight={containerHeight}
            isStackCard={false}
            stackIndex={0}
          />
        )}
      </View>
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
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
