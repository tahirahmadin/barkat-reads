import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Vibration,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { READER_PAGE_CHARS } from '../constants/reader';

const TICK_ANIM_DURATION = 500;
const CLOSE_DELAY_AFTER_TICK = 400;

function splitContentIntoPages(content: string, pageChars: number): string[] {
  const trimmed = (content ?? '').trim();
  if (!trimmed) return [''];
  const paragraphs = trimmed.split(/\n\s*\n/);
  const pages: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    const next = current ? current + '\n\n' + p : p;
    if (next.length >= pageChars && current) {
      pages.push(current);
      current = p;
    } else {
      current = next;
    }
  }
  if (current) pages.push(current);
  return pages.length > 0 ? pages : [''];
}

export interface DetailReaderModalProps {
  visible: boolean;
  cardId: string;
  title: string;
  content: string;
  /** Category label shown in header (e.g. "Hadis", "Dua") */
  category?: string;
  onFinish: () => void;
  onClose: () => void;
}

export const DetailReaderModal: React.FC<DetailReaderModalProps> = ({
  visible,
  cardId,
  title,
  content,
  category,
  onFinish,
  onClose,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [finishPressed, setFinishPressed] = useState(false);
  /** 0 = small, 1 = normal, 2 = large */
  const [fontScaleIndex, setFontScaleIndex] = useState(1);
  const tickScale = useRef(new Animated.Value(0)).current;
  const tickOpacity = useRef(new Animated.Value(0)).current;

  const pages = useMemo(
    () => splitContentIntoPages(content, READER_PAGE_CHARS),
    [content]
  );
  const totalPages = pages.length;
  const isLastPage = pageIndex >= totalPages - 1;
  const isFirstPage = pageIndex <= 0;
  const isSinglePage = totalPages <= 1;
  const pageContent = pages[pageIndex] ?? '';

  const handleFinish = useCallback(() => {
    if (finishPressed) return;
    setFinishPressed(true);
    Vibration.vibrate(100);
    tickScale.setValue(0);
    tickOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(tickScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(tickOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onFinish();
        onClose();
      }, CLOSE_DELAY_AFTER_TICK);
    });
  }, [finishPressed, onFinish, onClose, tickScale, tickOpacity]);

  const handleClose = useCallback(() => {
    setPageIndex(0);
    setFinishPressed(false);
    onClose();
  }, [onClose]);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setPageIndex(0);
      setFinishPressed(false);
      tickScale.setValue(0);
      tickOpacity.setValue(0);
    }
  }, [visible, cardId, tickScale, tickOpacity]);

  const bodyFontSize = 14 + fontScaleIndex * 2; // 14, 16, 18
  const lineHeight = Math.round(bodyFontSize * 1.625);
  const markdownStyles = useMemo(
    () => ({
      body: {
        color: '#1a1a1a',
        fontSize: bodyFontSize,
        lineHeight,
        ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
      },
      heading1: {
        fontSize: bodyFontSize + 8,
        fontWeight: '700' as const,
        marginTop: 16,
        marginBottom: 8,
        color: '#1a1a1a',
      },
      heading2: {
        fontSize: bodyFontSize + 4,
        fontWeight: '600' as const,
        marginTop: 14,
        marginBottom: 6,
        color: '#1a1a1a',
      },
      paragraph: {
        marginTop: 8,
        marginBottom: 8,
      },
      strong: {
        fontWeight: '700' as const,
      },
      em: {
        fontStyle: 'italic' as const,
      },
    }),
    [bodyFontSize, lineHeight]
  );

  const cycleFontSize = useCallback(() => {
    setFontScaleIndex((i) => (i + 1) % 3); // small → normal → large → small
  }, []);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header: close | category (rounded tab + icon) | aA (cycle font size) */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <Ionicons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.segmentedControl}>
            <View style={[styles.segment, styles.segmentActive]}>
              <Ionicons name="document-text-outline" size={18} color="#fff" />
              <Text style={[styles.segmentText, styles.segmentTextActive]} numberOfLines={1}>
                {category ?? 'Article'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={cycleFontSize}>
            <Text style={styles.aaIcon}>aA</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentWrap}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator
        >
          <Markdown style={markdownStyles}>{pageContent}</Markdown>
        </ScrollView>

        {/* Fixed footer: single page = Finish only; multi page = [←] number [→] or [←] number [Finish] */}
        <View style={styles.footer}>
          {isSinglePage ? (
            <TouchableOpacity
              style={[styles.finishButton, styles.finishButtonFull, finishPressed && styles.finishButtonDisabled]}
              onPress={handleFinish}
              disabled={finishPressed}
              activeOpacity={0.85}
            >
              <View style={styles.finishButtonContent}>
                <Text style={styles.finishButtonText}>Finish</Text>
                <Animated.View
                  style={[
                    styles.finishTickWrap,
                    {
                      opacity: tickOpacity,
                      transform: [{ scale: tickScale }],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                </Animated.View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.arrowButton, isFirstPage && styles.arrowButtonDisabled]}
                onPress={() => setPageIndex((i) => Math.max(0, i - 1))}
                disabled={isFirstPage}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={isFirstPage ? '#9ca3af' : '#374151'}
                />
              </TouchableOpacity>
              <Text style={styles.pageNumberText}>
                {pageIndex + 1} / {totalPages}
              </Text>
              {!isLastPage ? (
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
                >
                  <Ionicons name="chevron-forward" size={28} color="#374151" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.finishButton, styles.finishButtonCompact, finishPressed && styles.finishButtonDisabled]}
                  onPress={handleFinish}
                  disabled={finishPressed}
                  activeOpacity={0.85}
                >
                  <View style={styles.finishButtonContent}>
                    <Text style={styles.finishButtonText}>Finish</Text>
                    <Animated.View
                      style={[
                        styles.finishTickWrap,
                        {
                          opacity: tickOpacity,
                          transform: [{ scale: tickScale }],
                        },
                      ]}
                      pointerEvents="none"
                    >
                      <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                    </Animated.View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    padding: 4,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  segmentActive: {
    backgroundColor: '#1a1a1a',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  segmentTextActive: {
    color: '#fff',
  },
  aaIcon: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  contentWrap: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: '#FAF8F5',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    backgroundColor: '#FAF8F5',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  pageNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    minWidth: 56,
    textAlign: 'center',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  finishButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#2D8659',
  },
  finishButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finishButtonFull: {
    width: '100%',
  },
  finishButtonCompact: {
    minWidth: 120,
  },
  finishTickWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
});
