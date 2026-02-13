import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGoogleLogin = () => {
    // Placeholder - no actual integration
    console.log('Google Login pressed');
    navigation.navigate('OnboardingAge' as never);
  };

  const handleAppleLogin = () => {
    // Placeholder - no actual integration
    console.log('Apple Login pressed');
    navigation.navigate('OnboardingAge' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Barkat Learn</Text>
        </View>
        <Text style={styles.subtitle}>
          Learn Islam daily{'\n'}in 5 minutes
        </Text>
        <Text style={styles.description}>
          Swipe through bite-sized Islamic teachings{'\n'}
          tailored to your interests
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.loginButton, styles.googleButton]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={24} color="#4285F4" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.loginButton, styles.appleButton]}
            onPress={handleAppleLogin}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2ede8',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2D8659',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 38,
  },
  description: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleButtonText: {
    color: '#1A202C',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
