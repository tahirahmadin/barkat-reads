import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import type { PreferredLanguage } from '../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const languages: { label: PreferredLanguage; value: string; flag: string }[] = [
  { label: 'English', value: 'en', flag: '🇬🇧' },
  { label: 'Hindi', value: 'hi', flag: '🇮🇳' },
];

export const OnboardingLanguageScreen: React.FC = () => {
  const navigation = useNavigation();
  const setPreferredLanguage = useStore((s) => s.setPreferredLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedLanguage) {
      const lang = languages.find((l) => l.value === selectedLanguage);
      if (lang) setPreferredLanguage(lang.label);
      navigation.navigate('OnboardingPreferences' as never);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A202C" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>
            Select the language you prefer for content
          </Text>

          <View style={styles.optionsContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.optionButton,
                  selectedLanguage === lang.value && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedLanguage(lang.value)}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      selectedLanguage === lang.value && styles.optionTextSelected,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </View>
                {selectedLanguage === lang.value && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={32} color="#2D8659" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLanguage && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2ede8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D8659',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 28,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
  },
  optionButtonSelected: {
    borderColor: '#2D8659',
    backgroundColor: '#F0F9F4',
    borderWidth: 4,
    shadowColor: '#2D8659',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  flag: {
    fontSize: 48,
  },
  optionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.3,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  optionTextSelected: {
    color: '#2D8659',
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#f2ede8',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D8659',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2D8659',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
