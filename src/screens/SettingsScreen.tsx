import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { deleteAccount } from '../api/serverActions';
import { useStore } from '../store/useStore';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const logout = useStore((s) => s.logout);
  const authToken = useStore((s) => s.authToken);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'Are you sure? This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccount(authToken ?? null);
            setDeleting(false);
            if (result.success) {
              logout();
              // AppNavigator useEffect will reset to Landing
            } else {
              Alert.alert('Error', result.error ?? 'Could not delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Settings"
        leftComponent={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backTouch}
          >
            <Ionicons name="arrow-back" size={24} color="#1A202C" />
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={handleDeleteAccount}
          disabled={deleting}
          activeOpacity={0.7}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#DC2626" style={styles.rowIcon} />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#DC2626" style={styles.rowIcon} />
          )}
          <Text style={styles.deleteLabel}>Delete account</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2ede8',
  },
  backTouch: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  rowIcon: {
    marginRight: 12,
  },
  deleteLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
});
