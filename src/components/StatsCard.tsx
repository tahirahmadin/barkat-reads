import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
}) => {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
    minWidth: 100,
    maxWidth: '31%',
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#27ae60',
    marginBottom: 6,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  label: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
});
