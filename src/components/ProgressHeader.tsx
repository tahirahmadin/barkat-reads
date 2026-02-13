import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProgressHeaderProps {
  cardsLearnedToday: number;
  dailyLimit: number;
  streakDays: number;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  cardsLearnedToday,
  dailyLimit,
  streakDays,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {/* Left: Learn Text */}
        <View style={styles.leftSection}>
          <Text style={styles.learnText}>Learning</Text>
        </View>

        {/* Right: Streak Fire Icon */}
        <TouchableOpacity style={styles.streakButton}>
          <Text style={styles.fireIcon}>🔥</Text>
          <Text style={styles.streakNumber}>{streakDays}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80, // Fixed height
    paddingTop: 20,
    paddingBottom: 0,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.5,
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
