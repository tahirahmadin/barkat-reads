import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, rightComponent }) => {
  const insets = useSafeAreaInsets();
  // Minimal top padding - just enough for safe area, reduced significantly
  const topPadding = Math.max(insets.top - 30, 0);

  return (
    <View style={[styles.container,]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {rightComponent && <View style={styles.rightSection}>{rightComponent}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    paddingBottom: 0,
    paddingHorizontal: 20,
    justifyContent: 'center',
    // backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  rightSection: {
    alignItems: 'flex-end',
  },
});
