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
import { LearningCard } from '../types';
import { FullScreenModal } from './FullScreenModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const HEADER_HEIGHT = 60;
const BOTTOM_NAV_HEIGHT = 86;
const CONTENT_PADDING_TOP = 10;

interface SwipeCardProps {
  card: LearningCard;
  onSwipeUp: () => void;
  onTap: () => void;
  onSave?: (cardId: string) => void;
  containerHeight?: number;
  isStackCard?: boolean;
  stackIndex?: number; // 0 = current, 1 = first back, 2 = second back
}

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

const getTopicIconName = (topic: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, string> = {
    Hadith: 'book',
    Deen: 'business',      // building/mosque-style
    Namaz: 'hand-left',    // hands/prayer
    Hajj: 'location',
    Quran: 'library',
    History: 'time',
    Dua: 'heart',
    'Foundations of Nikah': 'heart-circle',
    'Living Happily After Shadi': 'people',
  };
  return (icons[topic] || 'bookmark') as keyof typeof Ionicons.glyphMap;
};

export const SwipeCard: React.FC<SwipeCardProps> = ({
  card,
  onSwipeUp,
  onTap,
  onSave,
  containerHeight,
  isStackCard = false,
  stackIndex = 0,
}) => {
  const isExpandable = card.expandable !== false;
  const isLocalImage = typeof card.image === 'number';
  const [imageLoading, setImageLoading] = useState(!isLocalImage);
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !modalOpenRef.current,
      onMoveShouldSetPanResponder: () => !modalOpenRef.current,
      onPanResponderGrant: () => {
        if (modalOpenRef.current) return;
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (modalOpenRef.current) return;
        const dy = Math.min(gestureState.dy, 0);
        pan.setValue({ x: 0, y: dy });
        const absDy = Math.abs(dy);
        scale.setValue(1 - absDy / 1000);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (modalOpenRef.current) return;
        pan.flattenOffset();
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);
        if (absDx < 10 && absDy < 10) {
          setShowFullScreen(true);
          onTap();
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
            if (!modalOpenRef.current) onSwipeUp();
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

  const topicColor = getTopicColor(card.topic);
  const imageSource = typeof card.image === 'number' ? card.image : { uri: card.image };

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
        isExpandable ? styles.cardWrapperExpandable : styles.cardWrapperMicro,
        isStackCard && styles.stackCardWrapper
      ]}>
        <View style={[styles.glassCard, isExpandable ? styles.glassCardExpandable : styles.glassCardMicro]}>
          <TouchableOpacity
            activeOpacity={0.98}
            onPress={() => { setShowFullScreen(true); onTap(); }}
            style={styles.cardContent}
          >
            {isExpandable ? (
              <ExpandableCardLayout
                card={card}
                topicColor={topicColor}
                imageSource={imageSource}
                imageLoading={imageLoading}
                isLocalImage={isLocalImage}
                setImageLoading={setImageLoading}
                onBookmarkPress={handleBookmarkPress}
                showSavedFeedback={showSavedFeedback}
              />
            ) : card.quoteType === 'quote' ? (
              <QuoteCardLayout
                card={card}
                topicColor={topicColor}
                onBookmarkPress={handleBookmarkPress}
                showSavedFeedback={showSavedFeedback}
              />
            ) : (
              <MicroCardLayout
                card={card}
                topicColor={topicColor}
                onBookmarkPress={handleBookmarkPress}
                showSavedFeedback={showSavedFeedback}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <FullScreenModal
        visible={showFullScreen}
        onClose={() => setShowFullScreen(false)}
        title={card.title}
        content={card.full_text}
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
function ExpandableCardLayout({
  card,
  topicColor,
  imageSource,
  imageLoading,
  isLocalImage,
  setImageLoading,
  onBookmarkPress,
  showSavedFeedback,
}: {
  card: LearningCard;
  topicColor: string;
  imageSource: { uri: string } | number;
  imageLoading: boolean;
  isLocalImage: boolean;
  setImageLoading: (v: boolean) => void;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
}) {
  return (
    <>
      <View style={expandableStyles.heroSection}>
        <View style={expandableStyles.imageWrap}>
          {imageLoading && (
            <View style={expandableStyles.imageLoader}>
              <ActivityIndicator size="large" color={topicColor} />
            </View>
          )}
          <Image
            source={imageSource}
            style={expandableStyles.heroImage}
            resizeMode="cover"
            onLoadStart={() => !isLocalImage && setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </View>
        <View style={expandableStyles.heroOverlay} pointerEvents="none" />
        <View style={expandableStyles.heroGradient} pointerEvents="none" />
        <View style={expandableStyles.badgeRow}>
          <View style={[expandableStyles.topicPill, { backgroundColor: topicColor }]}>
            <Text style={expandableStyles.topicPillText}>{card.topic}</Text>
          </View>
        </View>
        <View style={expandableStyles.titleOverImage}>
          <Text style={expandableStyles.heroTitle} numberOfLines={2}>{card.title}</Text>
        </View>
        <CardDecoration variant="expandable" />
      </View>
      <View style={expandableStyles.body}>
        <CardDecoration variant="expandable" />
        <View style={expandableStyles.bodyContent}>
          <Text style={expandableStyles.preview} numberOfLines={3}>{card.short_text}</Text>
          <View style={expandableStyles.ctaRow}>
            <Text style={[expandableStyles.ctaText, { color: topicColor }]}>Read full article</Text>
            <Ionicons name="arrow-forward" size={18} color={topicColor} />
          </View>
        </View>
        <TouchableOpacity
          style={expandableStyles.bookmarkBottomRight}
          onPress={() => onBookmarkPress?.()}
          activeOpacity={0.8}
        >
          <Ionicons name={showSavedFeedback ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
        </TouchableOpacity>
        {showSavedFeedback && (
          <View style={expandableStyles.savedFeedback}>
            <Text style={expandableStyles.savedFeedbackText}>Saved</Text>
          </View>
        )}
      </View>
    </>
  );
}

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
}: {
  card: LearningCard;
  topicColor: string;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
}) {
  const imageUri = typeof card.image === 'string' ? card.image : MICRO_CARD_IMAGE_URI;
  const backgroundColor = card.cardColor || topicColor;
  const iconPlacement = card.iconPlacement || 'top';

  return (
    <View style={[quoteStyles.wrapper, { backgroundColor }]}>
      <CardDecoration variant="micro" />
      <View style={quoteStyles.inner}>
        {/* Heading at top */}
        <Text style={quoteStyles.heading} numberOfLines={2}>{card.title}</Text>

        {/* Icon from iconscout - conditionally placed */}
        {iconPlacement === 'top' && (
          <View style={quoteStyles.iconContainer}>
            <Image
              source={{ uri: imageUri }}
              style={quoteStyles.iconImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Quote text (preview content) */}
        <Text style={quoteStyles.quoteText}>{card.short_text}</Text>

        {/* Reference citation */}
        {card.reference && (
          <Text style={quoteStyles.reference}>{card.reference}</Text>
        )}

        {/* Spacer to push bottom content down */}
        <View style={quoteStyles.spacer} />

        {/* Icon at bottom if placement is bottom - positioned above swipe text */}
        {iconPlacement === 'bottom' && (
          <View style={quoteStyles.iconContainerBottom}>
            <Image
              source={{ uri: imageUri }}
              style={quoteStyles.iconImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Swipe indicator */}
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
        <Ionicons name={showSavedFeedback ? 'bookmark' : 'bookmark-outline'} size={22} color="rgba(255,255,255,0.95)" />
      </TouchableOpacity>
      {showSavedFeedback && (
        <View style={quoteStyles.savedFeedback}>
          <Text style={quoteStyles.savedFeedbackText}>Saved</Text>
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
}: {
  card: LearningCard;
  topicColor: string;
  onBookmarkPress?: () => void;
  showSavedFeedback?: boolean;
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
        <Ionicons name={showSavedFeedback ? 'bookmark' : 'bookmark-outline'} size={22} color="rgba(255,255,255,0.95)" />
      </TouchableOpacity>
      {showSavedFeedback && (
        <View style={microStyles.savedFeedback}>
          <Text style={microStyles.savedFeedbackText}>Saved</Text>
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

const expandableStyles = StyleSheet.create({
  heroSection: {
    height: '52%',
    minHeight: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    zIndex: 1,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: 'transparent',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topicPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  topicPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  bookmarkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkBottomRight: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  savedFeedback: {
    position: 'absolute',
    right: 16,
    bottom: 68,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  titleOverImage: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    zIndex: 5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: 'space-between',
    backgroundColor: '#111',
    position: 'relative',
    overflow: 'hidden',
  },
  bodyContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  preview: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 24,
    letterSpacing: 0.2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
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
