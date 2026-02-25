import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface AppHeaderProps {
  title: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, leftComponent, rightComponent }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {leftComponent ? <View style={styles.leftSection}>{leftComponent}</View> : null}
        <Text style={styles.title}>{title}</Text>
        {rightComponent ? <View style={styles.rightSection}>{rightComponent}</View> : null}
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
  leftSection: {
    minWidth: 32,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
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
