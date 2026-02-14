import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
// getDay(): 0=Sun, 1=Mon, ... 6=Sat. We show Mon first so order is [1,2,3,4,5,6,0].
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface StreakCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  streakDays: number;
  cardsLearnedToday?: number;
  dailyLimit?: number;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  visible,
  onClose,
  streakDays,
  cardsLearnedToday = 0,
  dailyLimit = 5,
}) => {
  const todayGetDay = new Date().getDay();
  const todayIndex = DAY_ORDER.indexOf(todayGetDay);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm on a ${streakDays} day learning streak with Barkat Learn! 🔥 Keep the flame lit.`,
        title: 'My learning streak',
      });
    } catch (_) { }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Decorative dots */}
          <View style={styles.dots} pointerEvents="none">
            <View style={[styles.dot, styles.dotPink, { top: 80, left: 40 }]} />
            <View style={[styles.dot, styles.dotYellow, { top: 120, right: 50 }]} />
            <View style={[styles.dot, styles.dotPink, { top: 200, right: 30 }]} />
            <View style={[styles.dot, styles.dotYellow, { bottom: 280, left: 30 }]} />
            <View style={[styles.dot, styles.dotPink, { bottom: 200, right: 40 }]} />
          </View>

          {/* Close */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={16}>
            <Ionicons name="close" size={24} color="#1A202C" />
          </TouchableOpacity>

          {/* Flame + number + label */}
          <View style={styles.hero}>
            <Text style={styles.flameIcon}>🔥</Text>
            <View style={styles.flameGlow} />
            <Text style={styles.streakNumber}>{streakDays}</Text>
            <Text style={styles.streakLabel}>DAY STREAK!</Text>
          </View>

          <Text style={styles.message}>
            You're on fire! {streakDays >= 365 ? "That is a full year of learning." : `That's ${streakDays} days in a row.`} Keep the flame lit!
          </Text>

          {/* Weekly tracker card */}
          <View style={styles.card}>
            <View style={styles.weekRow}>
              {DAY_LABELS.map((label, i) => (
                <View key={i} style={styles.dayCol}>
                  {i === todayIndex ? (
                    <Text style={styles.dayLabelToday}>{label}</Text>
                  ) : null}
                  <View
                    style={[
                      styles.dayCircle,
                      i < todayIndex && styles.dayCircleDone,
                      i === todayIndex && styles.dayCircleToday,
                      i > todayIndex && styles.dayCircleFuture,
                    ]}
                  >
                    {i < todayIndex ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : i === todayIndex ? (
                      <Text style={styles.dayFlame}>🔥</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.bonusRow}>
              <Ionicons name="diamond" size={18} color="#3B82F6" />
              <Text style={styles.bonusText}>Streak Bonus: +50 Gems</Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.continueButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#7C3AED" />
            <Text style={styles.shareText}>Share my streak</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f0eb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  dots: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  dotPink: {
    backgroundColor: '#F9A8D4',
  },
  dotYellow: {
    backgroundColor: '#FDE047',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 24,
    zIndex: 10,
    padding: 4,
  },
  hero: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  flameIcon: {
    fontSize: 72,
    marginBottom: 4,
  },
  flameGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    top: 0,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayLabelToday: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 6,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleDone: {
    backgroundColor: '#EAB308',
  },
  dayCircleToday: {
    backgroundColor: '#DC2626',
  },
  dayCircleFuture: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    backgroundColor: 'transparent',
  },
  dayFlame: {
    fontSize: 18,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bonusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  continueButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
