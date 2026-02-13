import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../store/useStore';
import { LearningCard } from '../types';
import { FullScreenModal } from '../components/FullScreenModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 20;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;
const CARD_MIN_HEIGHT = 180;
// Width for 2.5 cards visible: (screen - padding*2 - gap*2) / 2.5
const ARTICLE_CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 2.2;
const SAVED_CARD_IMAGE_URI =
  'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png';

const getTopicColor = (topic: string): string => {
  const colors: Record<string, string> = {
    Hadith: '#2D8659',
    Deen: '#27ae60',
    Namaz: '#1A5F7A',
    Hajj: '#C9A961',
    Quran: '#2C5F7A',
    History: '#5D4E37',
    Dua: '#8B6F47',
    'Foundations of Nikah': '#8B4789',
    'Living Happily After Shadi': '#B85C38',
  };
  return colors[topic] || '#718096';
};

function SavedCardDecoration() {
  const positions = [
    { top: 12, right: 12, size: 6 },
    { top: 32, left: 10, size: 5 },
    { bottom: 50, left: 12, size: 6 },
    { bottom: 65, right: 10, size: 5 },
  ];
  return (
    <View style={decorationStyles.container} pointerEvents="none">
      {positions.map((pos, i) => (
        <View
          key={i}
          style={[
            decorationStyles.star,
            {
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              right: pos.right,
              opacity: 0.18,
            },
          ]}
        >
          <Ionicons name={i % 2 === 0 ? 'star' : 'sparkles'} size={pos.size} color="#fff" />
        </View>
      ))}
    </View>
  );
}

export const SavedScreen: React.FC = () => {
  const { getSavedCards } = useStore();
  const savedCards = getSavedCards();
  const [selectedCard, setSelectedCard] = useState<LearningCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const expandableCards = savedCards.filter((card) => card.expandable !== false);
  const nonExpandableCards = savedCards.filter((card) => card.expandable === false);

  const handleCardPress = (card: LearningCard) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  const renderCard = (card: LearningCard, isRow?: boolean) => {
    const topicColor = getTopicColor(card.topic);
    const imageUri = typeof card.image === 'string' ? card.image : SAVED_CARD_IMAGE_URI;
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isRow && styles.articleCard,
          { backgroundColor: topicColor },
        ]}
        activeOpacity={0.95}
        onPress={() => handleCardPress(card)}
      >
        <SavedCardDecoration />
        <View style={styles.inner}>
          <Text style={styles.title} numberOfLines={2}>
            {card.title}
          </Text>
          <View style={styles.spacer} />
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.bottomImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.tapRow}>
            <Text style={styles.tapLabel}>Tap to read</Text>
            <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.bg} pointerEvents="none" />
      <AppHeader title="Saved" />
      {savedCards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📌</Text>
          <Text style={styles.emptyTitle}>No saved cards</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark on a card to save it here for later.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Expandable Cards Section - horizontal row */}
          {expandableCards.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Articles</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.articlesRow}
              >
                {expandableCards.map((card) => renderCard(card, true))}
              </ScrollView>
            </View>
          )}

          {/* Non-Expandable Cards Section - 2-column grid */}
          {nonExpandableCards.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Reads</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.grid}>
                {nonExpandableCards.map((card) => renderCard(card))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
      {selectedCard && (
        <FullScreenModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedCard.title}
          content={selectedCard.full_text}
        />
      )}
    </SafeAreaView>
  );
};

const decorationStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2ede8',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f2ede8',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B4789',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  articlesRow: {
    flexDirection: 'row',
    gap: GAP,
    paddingRight: PADDING,
  },
  articleCard: {
    width: ARTICLE_CARD_WIDTH,
    marginRight: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    rowGap: GAP,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  spacer: {
    flex: 1,
    minHeight: 4,
  },
  imageContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 100,
    height: 64,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomImage: {
    width: '100%',
    height: '100%',
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  tapLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  emptySub: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
});
