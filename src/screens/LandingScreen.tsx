import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { loginWithApple, getCurrentUser } from '../api/serverActions';
import { useStore } from '../store/useStore';
import type { ContentCategory } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use landing.avif as background; if it doesn't load (AVIF not supported), overlay still provides a clean look
const LANDING_BG = require('../../assets/landing.avif');
const LOGO = require('../../assets/logo.webp');

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const setAuth = useStore((s) => s.setAuth);
  const setPreferences = useStore((s) => s.setPreferences);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const handleGetStarted = () => {
    navigation.navigate('OnboardingAge' as never);
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      handleGetStarted();
      return;
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert('Apple Sign-In', 'Could not retrieve identity token from Apple.');
        return;
      }

      const email = credential.email ?? null;
      const result = await loginWithApple(credential.identityToken, email);

      if (!result.success) {
        Alert.alert('Apple Sign-In failed', result.error ?? 'Please try again.');
        return;
      }

      const authToken = result.token ?? null;
      const resolvedEmail = result.email ?? email;

      setAuth({ token: authToken, email: resolvedEmail });

      if (authToken) {
        try {
          const me = await getCurrentUser(authToken);
          const backendPrefs = me.success ? me.data?.preferences ?? [] : [];

          if (backendPrefs && backendPrefs.length > 0) {
            const normalized = backendPrefs
              .map((p) => {
                const v = String(p).toLowerCase();
                if (v === 'hadis' || v === 'hadith') return 'Hadis';
                if (v === 'dua') return 'Dua';
                if (v === 'prophet stories' || v === 'prophet_stories') return 'Prophet Stories';
                if (v === 'quran surah' || v === 'quran_surah') return 'Quran Surah';
                if (v === 'islamic facts' || v === 'islamic_facts') return 'Islamic Facts';
                return null;
              })
              .filter((x): x is ContentCategory => x !== null);

            if (normalized.length > 0) {
              setPreferences(normalized);
              completeOnboarding();
              navigation.navigate('Main' as never);
              return;
            }
          }
        } catch (e) {
          console.log('[Apple Sign-In] Failed to load user profile after login', e);
        }
      }

      navigation.navigate('OnboardingAge' as never);
    } catch (e: any) {
      if (e?.code === 'ERR_CANCELED') return;
      console.log('[Apple Sign-In] Error', e);
      Alert.alert('Apple Sign-In failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={LANDING_BG}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* Gradient overlay for readability */}
        <View style={styles.overlay} />
        <View style={styles.overlayBottom} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.topTagline}>Curated by Islamic scholars & Researchers</Text>
          <View style={styles.topSpacer} />
          {/* Brand block - center aligned, at bottom */}
          <View style={styles.brandBlock}>
            {/* <Image source={LOGO} style={styles.logo} resizeMode="contain" /> */}
            {/* <Text style={styles.eyebrow}>Islamic microlearning</Text> */}
            <Text style={styles.title}>Barkat Daily</Text>
            <Text style={styles.tagline}>
              Bite-sized knowledge.{'\n'}
              Hadith, dua & stories in minutes.
            </Text>
          </View>

          {/* CTA - center aligned */}
          <View style={styles.ctaSection}>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.appleButton}
                onPress={handleAppleLogin}
                activeOpacity={0.88}
              >
                <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGetStarted}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryButtonText}>Get started</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.55,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
      android: { elevation: 0 },
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 48,
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  topSpacer: {
    flex: 1,
    minHeight: 40,
  },
  topTagline: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 44,
    width: '100%',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 42,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 26,
    maxWidth: 280,
    textAlign: 'center',
  },
  ctaSection: {
    gap: 14,
    width: '100%',
    alignItems: 'center',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#000000',
    gap: 10,
    width: '100%',
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#2D8659',
    gap: 10,
    width: '100%',
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: '#2D8659',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
