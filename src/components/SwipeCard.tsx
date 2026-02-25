import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LearningCard, ContentCategory } from '../types';
import { DetailReaderModal } from './DetailReaderModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

/** Static assets for cards (use backend images later). */
const FLASH_CARD_ICON = require('../../assets/learn/icon.webp');
const EXPLAIN_CARD_BG = require('../../assets/learn/bg.jpg');
const HEADER_HEIGHT = 60;
const BOTTOM_NAV_HEIGHT = 86;
const CONTENT_PADDING_TOP = 10;

interface SwipeCardProps {
  card: LearningCard;
  onSwipeUp: () => void;
  onTap: () => void;
  onSave?: (cardId: string) => void;
  onDetailOpen?: (cardId: string) => void;
  onDetailFinish?: (cardId: string) => void;
  containerHeight?: number;
  isStackCard?: boolean;
  stackIndex?: number; // 0 = current, 1 = first back, 2 = second back
  isSaved?: boolean;
}

const getCategoryColor = (category: ContentCategory): string => {
  const colors: Record<ContentCategory, string> = {
    Hadis: '#8B5A3C',
    Dua: '#8B6F47',
    'Prophet Stories': '#5D4E37',
    'Quran Surah': '#2C5F7A',
    'Islamic Facts': '#27ae60',
  };
  return colors[category] ?? '#718096';
};

/** Tag label for detail-only (hadis-style) cards: Hadis, Dua, Islamic Facts */
const getDetailOnlyTag = (category: ContentCategory): string => {
  const tags: Record<ContentCategory, string> = {
    Hadis: 'HADIS',
    Dua: 'DUA',
    'Prophet Stories': 'PROPHET STORIES',
    'Quran Surah': 'QURAN SURAH',
    'Islamic Facts': 'ISLAMIC FACTS',
  };
  return tags[category] ?? category.toUpperCase();
};

const getCategoryIconName = (category: ContentCategory): keyof typeof Ionicons.glyphMap => {
  const icons: Record<ContentCategory, string> = {
    Hadis: 'book',
    Dua: 'heart',
    'Prophet Stories': 'time',
    'Quran Surah': 'library',
    'Islamic Facts': 'bulb',
  };
  return (icons[category] || 'bookmark') as keyof typeof Ionicons.glyphMap;
};

export const SwipeCard: React.FC<SwipeCardProps> = ({
  card,
  onSwipeUp,
  onTap,
  onSave,
  onDetailOpen,
  onDetailFinish,
  containerHeight,
  isStackCard = false,
  stackIndex = 0,
  isSaved = false,
}) => {
  /** Explain cards: full-cover bg (Prophet Stories, Quran Surah). Use category fallback in case cardType is wrong. */
  const isExplainCard =
    card.cardType === 'explain_card' ||
    card.category === 'Prophet Stories' ||
    card.category === 'Quran Surah';
  const isFlashCard = !isExplainCard;
  const [imageLoading, setImageLoading] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const modalOpenRef = useRef(false);

  const handleBookmarkPress = () => {
    onSave?.(card.id);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 1500);
  };
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    modalOpenRef.current = showFullScreen;
  }, [showFullScreen]);

  const onSwipeUpRef = useRef(onSwipeUp);
  const onTapRef = useRef(onTap);
  const onDetailOpenRef = useRef(onDetailOpen);
  useEffect(() => { onSwipeUpRef.current = onSwipeUp; }, [onSwipeUp]);
  useEffect(() => { onTapRef.current = onTap; }, [onTap]);
  useEffect(() => { onDetailOpenRef.current = onDetailOpen; }, [onDetailOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !modalOpenRef.current,
      onMoveShouldSetPanResponder: (_, gs) =>
        !modalOpenRef.current && Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        if (modalOpenRef.current) return;
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        if (modalOpenRef.current) return;
        const dy = Math.min(gestureState.dy, 0);
        pan.setValue({ x: 0, y: dy });
        const absDy = Math.abs(dy);
        scale.setValue(1 - absDy / 1000);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (modalOpenRef.current) return;
        pan.flattenOffset();
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);
        if (absDx < 10 && absDy < 10) {
          setShowFullScreen(true);
          onDetailOpenRef.current?.(card.id);
          onTapRef.current();
          Animated.parallel([
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
          ]).start();
          return;
        }
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: 0, y: -SCREEN_HEIGHT * 1.5 },
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(scale, { toValue: 0.8, duration: 300, useNativeDriver: false }),
          ]).start(() => {
            if (!modalOpenRef.current) onSwipeUpRef.current();
          });
        } else {
          Animated.parallel([
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
          ]).start();
        }
      },
    })
  ).current;

  const categoryColor = getCategoryColor(card.category);
  /** For now use static assets; later switch to card.image from backend. */
  const imageSource = isFlashCard ? FLASH_CARD_ICON : isExplainCard ? EXPLAIN_CARD_BG : FLASH_CARD_ICON;
  const isLocalImage = true; // static assets (require)

  // Stack card styling - Tinder-like effect
  const stackScale = isStackCard ? (stackIndex === 1 ? 0.96 : 0.92) : 1;
  const stackOffset = isStackCard ? (stackIndex === 1 ? 20 : 40) : 0;
  const stackZIndex = isStackCard ? (stackIndex === 1 ? 1 : 0) : 2;
  // Slight rotation for depth (Tinder-style)
  const stackRotation = isStackCard ? (stackIndex === 1 ? -1.5 : -3) : 0;

  const animatedCardStyle = isStackCard
    ? {
      transform: [
        { scale: stackScale },
        { rotate: `${stackRotation}deg` }
      ],
      opacity: stackIndex === 1 ? 0.95 : 0.85,
    }
    : {
      transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
    };
  const verticalOffset = containerHeight != null ? (containerHeight - CARD_HEIGHT) / 2 - 24 : 0;
  const stackTopOffset = isStackCard ? verticalOffset + stackOffset : verticalOffset;

  return (
    <Animated.View
      style={[
        styles.card,
        { left: 0, top: stackTopOffset, zIndex: stackZIndex },
        animatedCardStyle,
        isStackCard && styles.stackCardShadow,
      ]}
      {...(isStackCard ? {} : panResponder.panHandlers)}
      pointerEvents={isStackCard ? 'none' : (showFullScreen ? 'none' : 'auto')}
    >
      <View style={[
        styles.cardWrapper,
        isExplainCard ? styles.cardWrapperExpandable : styles.cardWrapperMicro,
        isStackCard && styles.stackCardWrapper
      ]}>
        <View style={[styles.glassCard, isExplainCard ? styles.glassCardExpandable : styles.glassCardMicro]}>
          <TouchableOpacity
            activeOpacity={0.98}
            onPress={() => {
              setShowFullScreen(true);
              onDetailOpen?.(card.id);
              onTap();
            }}
            style={styles.cardContent}
          >
            {isFlashCard ? (
              <DetailOnlyCardLayout
                card={card}
                categoryColor={categoryColor}
                onBookmarkPress={handleBookmarkPress}
                showSavedFeedback={showSavedFeedback}
                isSaved={isSaved}
              />
            ) : (
              <FullBackgroundCardLayout
                card={card}
                imageSource={imageSource}
                imageLoading={imageLoading}
                isLocalImage={isLocalImage}
                setImageLoading={setImageLoading}
                onBookmarkPress={handleBookmarkPress}
                showSavedFeedback={showSavedFeedback}
                isSaved={isSaved}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <DetailReaderModal
        visible={showFullScreen}
        cardId={card.id}
        title={card.title}
        content={card.full_text}
        category={card.category}
        onFinish={() => {
          onDetailFinish?.(card.id);
          setShowFullScreen(false);
        }}
        onClose={() => setShowFullScreen(false)}
      />
    </Animated.View>
  );
};

// ——— Decorative stars/sparkles overlay (low opacity)
function CardDecoration({ variant }: { variant: 'expandable' | 'micro' }) {
  const isDark = variant === 'expandable';
  const color = isDark ? '#fff' : '#fff';
  const opacity = 0.18;
  const positions: { top?: number; right?: number; bottom?: number; left?: number; size: number }[] =
    variant === 'expandable'
      ? [
        { top: 28, left: 24, size: 14 },
        { top: 52, right: 40, size: 10 },
        { top: 100, left: 50, size: 8 },
        { bottom: 80, left: 30, size: 12 },
        { bottom: 120, right: 28, size: 16 },
        { top: 160, right: 22, size: 6 },
        { bottom: 200, left: 20, size: 10 },
      ]
      : [
        { top: 36, right: 28, size: 12 },
        { top: 70, left: 20, size: 8 },
        { top: 110, right: 36, size: 14 },
        { bottom: 100, left: 32, size: 10 },
        { bottom: 140, right: 24, size: 16 },
        { top: 150, left: 40, size: 6 },
        { bottom: 180, right: 40, size: 8 },
        { bottom: 60, left: 24, size: 12 },
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
              opacity,
            },
          ]}
        >
          <Ionicons
            name={i % 2 === 0 ? 'star' : 'sparkles'}
            size={pos.size}
            color={color}
          />
        </View>
      ))}
    </View>
  );
}

// ——— Expandable: Tinder-style hero card (big image, title on image, “Read more”)
const hadisStyles = StyleSheet.create({
  wrapper: { flex: 1, borderRadius: 24, position: 'relative', overflow: 'hidden' },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, zIndex: 1 },
  tagRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 14, ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }) },
  iconContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 12, width: '100%', height: 100 },
  iconImage: { width: '100%', height: '100%', maxWidth: 180 },
  quoteText: { fontSize: 22, fontWeight: '500', color: '#FFFFFF', lineHeight: 32, textAlign: 'center', fontStyle: 'italic', marginBottom: 12, ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }) },
  reference: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center', letterSpacing: 0.8, marginBottom: 12, ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }) },
  spacer: { flex: 1, minHeight: 8 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    position: 'relative',
  },
  tapRowCentered: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tapLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600', ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }) },
  iconButton: {
    position: 'absolute',
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  savedFeedback: { position: 'absolute', right: 16, bottom: 68, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, zIndex: 10 },
  savedFeedbackText: { fontSize: 13, fontWeight: '600', color: '#fff', ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }) },
});

function DetailOnlyCardLayout({
  card,
  categoryColor,
  onBookmarkPress,
  showSavedFeedback,
  isSaved,
}: {
  card: LearningCard;
  categoryColor: string;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
  isSaved?: boolean;
}) {
  const iconPlacement = card.iconPlacement ?? 'top';
  /** Static icon for now; use card.image from backend later. */
  const imageSource = FLASH_CARD_ICON;
  const imageBlock = (
    <View style={hadisStyles.iconContainer}>
      <Image source={imageSource} style={hadisStyles.iconImage} resizeMode="contain" />
    </View>
  );
  const bgColor = card.cardColor ?? categoryColor;
  const tagLabel = getDetailOnlyTag(card.category);
  return (
    <View style={[hadisStyles.wrapper, { backgroundColor: bgColor }]}>
      <CardDecoration variant="micro" />
      <View style={hadisStyles.inner}>
        <View style={hadisStyles.tagRow}>
          <View style={hadisStyles.tagPill}>
            <Text style={hadisStyles.tagText}>{tagLabel}</Text>
          </View>
        </View>
        <Text style={hadisStyles.title} numberOfLines={2}>{card.title}</Text>
        {iconPlacement === 'top' && imageBlock}
        <Text style={hadisStyles.quoteText} numberOfLines={4}>{card.short_text}</Text>
        {card.reference ? (
          <Text style={hadisStyles.reference}>{card.reference.toUpperCase()}</Text>
        ) : null}
        {iconPlacement === 'bottom' && imageBlock}
        <View style={hadisStyles.spacer} />
        <View style={hadisStyles.bottomRow}>
          <View style={hadisStyles.tapRowCentered}>
            <Text style={hadisStyles.tapLabel}>Swipe for next</Text>
            <Ionicons name="arrow-up-outline" size={18} color="rgba(255,255,255,0.9)" />
          </View>
          <TouchableOpacity
            style={hadisStyles.iconButton}
            onPress={() => onBookmarkPress?.()}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSaved || showSavedFeedback ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color="rgba(255,255,255,0.95)"
            />
          </TouchableOpacity>
        </View>
      </View>
      {showSavedFeedback && (
        <View style={hadisStyles.savedFeedback}>
          <Text style={hadisStyles.savedFeedbackText}>Bookmarked</Text>
        </View>
      )}
    </View>
  );
}

/** Full-cover background image with title overlay only (no preview). Used for Prophet Stories, Quran Surah. */
function FullBackgroundCardLayout({
  card,
  imageSource,
  imageLoading,
  isLocalImage,
  setImageLoading,
  onBookmarkPress,
  showSavedFeedback,
  isSaved,
}: {
  card: LearningCard;
  imageSource: { uri: string } | number;
  imageLoading: boolean;
  isLocalImage: boolean;
  setImageLoading: (v: boolean) => void;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
  isSaved?: boolean;
}) {
  const tagLabel = getDetailOnlyTag(card.category);
  return (
    <View style={fullBgStyles.wrapper}>
      <Image
        source={imageSource}
        style={fullBgStyles.backgroundImage}
        resizeMode="cover"
        onLoadStart={() => !isLocalImage && setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
      />
      {imageLoading && (
        <View style={fullBgStyles.loader}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <View style={fullBgStyles.overlay} pointerEvents="none" />
      <View style={fullBgStyles.tagRow} pointerEvents="none">
        <View style={fullBgStyles.tagPill}>
          <Text style={fullBgStyles.tagText}>{tagLabel}</Text>
        </View>
      </View>
      <View style={fullBgStyles.titleWrap} pointerEvents="none">
        <Text style={fullBgStyles.title} numberOfLines={3}>{card.title}</Text>
      </View>
      <View style={fullBgStyles.bottomRow}>
        <View style={fullBgStyles.tapRowCentered}>
          <Text style={fullBgStyles.tapLabel}>Swipe for next</Text>
          <Ionicons name="arrow-up-outline" size={18} color="rgba(255,255,255,0.9)" />
        </View>
        <TouchableOpacity
          style={fullBgStyles.iconButton}
          onPress={() => onBookmarkPress?.()}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSaved || showSavedFeedback ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color="rgba(255,255,255,0.95)"
          />
        </TouchableOpacity>
      </View>
      {showSavedFeedback && (
        <View style={fullBgStyles.savedFeedback}>
          <Text style={fullBgStyles.savedFeedbackText}>Bookmarked</Text>
        </View>
      )}
    </View>
  );
}

const fullBgStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1,
  },
  tagRow: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  tagPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  titleWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  bottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    zIndex: 3,
  },
  tapRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedFeedback: {
    position: 'absolute',
    right: 16,
    bottom: 68,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  savedFeedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});

// Default PNG for non-expanding cards (muslim bride and groom illustration)
const MICRO_CARD_IMAGE_URI =
  'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png';

// Quote card styles
const quoteStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 20,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
    height: 120,
  },
  iconContainerBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
    height: 100,
  },
  iconImage: {
    width: '100%',
    height: '100%',
    maxWidth: 200,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  quoteText: {
    fontSize: 26,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 38,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    marginBottom: 16,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  reference: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 20,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  tapLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  bookmarkBottomRight: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  savedFeedback: {
    position: 'absolute',
    right: 16,
    bottom: 68,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  savedFeedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});

// ——— Quote card: Beautiful quote-style layout for Hadith and quotes
function QuoteCardLayout({
  card,
  topicColor,
  onBookmarkPress,
  showSavedFeedback,
  isSaved,
}: {
  card: LearningCard;
  topicColor: string;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
  isSaved?: boolean;
}) {
  const imageUri = typeof card.image === 'string' ? card.image : MICRO_CARD_IMAGE_URI;
  return (
    <View style={[quoteStyles.wrapper, { backgroundColor: topicColor }]}>
      <CardDecoration variant="micro" />
      <View style={quoteStyles.inner}>
        <Text style={quoteStyles.heading} numberOfLines={2}>{card.title}</Text>
        <View style={quoteStyles.iconContainer}>
          <Image
            source={{ uri: imageUri }}
            style={quoteStyles.iconImage}
            resizeMode="contain"
          />
        </View>
        <Text style={quoteStyles.quoteText}>{card.short_text}</Text>
        {card.reference && (
          <Text style={quoteStyles.reference}>{card.reference}</Text>
        )}
        <View style={quoteStyles.spacer} />
        <View style={quoteStyles.tapRow}>
          <Text style={quoteStyles.tapLabel}>Swipe for next</Text>
          <Ionicons name="arrow-up-outline" size={18} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <TouchableOpacity
        style={quoteStyles.bookmarkBottomRight}
        onPress={() => onBookmarkPress?.()}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isSaved || showSavedFeedback ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color="rgba(255,255,255,0.95)"
        />
      </TouchableOpacity>
      {showSavedFeedback && (
        <View style={quoteStyles.savedFeedback}>
          <Text style={quoteStyles.savedFeedbackText}>Bookmarked</Text>
        </View>
      )}
    </View>
  );
}

// ——— Non-expandable: Illustration-style card (solid color + PNG image at bottom)
function MicroCardLayout({
  card,
  topicColor,
  onBookmarkPress,
  showSavedFeedback,
  isSaved,
}: {
  card: LearningCard;
  topicColor: string;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
  isSaved?: boolean;
}) {
  const imageUri = typeof card.image === 'string' ? card.image : MICRO_CARD_IMAGE_URI;
  return (
    <View style={[microStyles.wrapper, { backgroundColor: topicColor }]}>
      <CardDecoration variant="micro" />
      <View style={microStyles.inner}>
        <Text style={microStyles.microTitle} numberOfLines={2}>{card.title}</Text>
        <Text style={microStyles.microPreview} numberOfLines={8}>{card.short_text}</Text>
        <View style={microStyles.imageSpacer} />
        <View style={microStyles.bottomImageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={microStyles.bottomImage}
            resizeMode="contain"
          />
        </View>
        <View style={microStyles.tapRow}>
          <Text style={microStyles.tapLabel}>Swipe for next</Text>
          <Ionicons name="arrow-up-outline" size={18} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <TouchableOpacity
        style={microStyles.bookmarkBottomRight}
        onPress={() => onBookmarkPress?.()}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isSaved || showSavedFeedback ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color="rgba(255,255,255,0.95)"
        />
      </TouchableOpacity>
      {showSavedFeedback && (
        <View style={microStyles.savedFeedback}>
          <Text style={microStyles.savedFeedbackText}>Bookmarked</Text>
        </View>
      )}
    </View>
  );
}

const CARD_WIDTH = SCREEN_WIDTH - 40;
const calculateCardHeight = (): number => {
  const safeAreaTop = Math.max(44 - 30, 0);
  const headerTotalHeight = HEADER_HEIGHT + safeAreaTop;
  const availableHeight = SCREEN_HEIGHT - headerTotalHeight - CONTENT_PADDING_TOP - BOTTOM_NAV_HEIGHT - 44;
  return Math.max(availableHeight, 420) * 0.85;
};

const CARD_HEIGHT = calculateCardHeight();

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    position: 'absolute',
    overflow: 'visible',
  },
  stackCardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  stackCardWrapper: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 28,
    padding: 4,
  },
  cardWrapperExpandable: {
    backgroundColor: '#0F0F0F',
  },
  cardWrapperMicro: {
    backgroundColor: '#FFFFFF',
  },
  glassCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glassCardExpandable: {
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 24,
  },
  glassCardMicro: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
  },
});

const decorationStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
  },
});

const microStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  microTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  microPreview: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 24,
    marginTop: 16,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  imageSpacer: {
    flex: 1,
    minHeight: 8,
  },
  bottomImageContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 280,
    height: 220,
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
    gap: 8,
  },
  tapLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  bookmarkBottomRight: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  savedFeedback: {
    position: 'absolute',
    right: 16,
    bottom: 68,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  savedFeedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});
