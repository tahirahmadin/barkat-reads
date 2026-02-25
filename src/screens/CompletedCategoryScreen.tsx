import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import type { CardFromAPI, ContentCategory } from '../types';
import { validateCards } from '../api/validateCards';
import { fetchCompletedCardsByCategory } from '../api/serverActions';
import { DetailReaderModal } from '../components/DetailReaderModal';

type CompletedCategoryParams = {
  categorySlug: string;
  categoryLabel?: string;
};

const slugToCategory = (slug: string): ContentCategory => {
  const v = slug.toLowerCase();
  if (v === 'hadis' || v === 'hadith') return 'Hadis';
  if (v === 'dua') return 'Dua';
  if (v === 'prophet stories' || v === 'prophet_stories' || v === 'stories') return 'Prophet Stories';
  if (v === 'quran surah' || v === 'quran_surah' || v === 'quran') return 'Quran Surah';
  return 'Islamic Facts';
};

export const CompletedCategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categorySlug, categoryLabel } = (route.params ?? {}) as CompletedCategoryParams;
  const authToken = useStore((s) => s.authToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<CardFromAPI[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardFromAPI | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!authToken || !categorySlug) {
      setLoading(false);
      setError('Not authenticated.');
      return;
    }
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchCompletedCardsByCategory(categorySlug, 10, 0, authToken);
      if (!isMounted) return;
      if (res.success && res.items) {
        const validated = validateCards(res.items);
        setCards(validated);
      } else {
        setError(res.error ?? 'Failed to load completed cards.');
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [authToken, categorySlug]);

  const handleOpenCard = (card: CardFromAPI) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  const title = categoryLabel || slugToCategory(categorySlug);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2D8659" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>No finished cards yet</Text>
            <Text style={styles.emptySub}>
              Read cards in this category from the home feed to see them here.
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleOpenCard(card)}
            >
              <Text style={styles.cardTitle} numberOfLines={2}>
                {card.title}
              </Text>
              <Text style={styles.cardPreview} numberOfLines={3}>
                {card.preview}
              </Text>
              {card.reference ? (
                <Text style={styles.cardReference}>{card.reference}</Text>
              ) : null}
              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>Tap to read</Text>
                <Ionicons name="open-outline" size={16} color="#4A5568" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {selectedCard && (
        <DetailReaderModal
          visible={modalVisible}
          cardId={selectedCard.id}
          title={selectedCard.title}
          content={selectedCard.content}
          category={slugToCategory(categorySlug)}
          onFinish={handleCloseModal}
          onClose={handleCloseModal}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2ede8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  errorText: {
    fontSize: 15,
    color: '#E53E3E',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  cardPreview: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardReference: {
    fontSize: 11,
    color: '#A0AEC0',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
  },
});

