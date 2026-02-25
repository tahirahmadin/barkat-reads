import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ContentCategory } from '../types';
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABELS } from '../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 24;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;

const preferences: { label: string; value: ContentCategory; icon: string }[] =
  CONTENT_CATEGORIES.map((cat) => ({
    label: CONTENT_CATEGORY_LABELS[cat],
    value: cat,
    icon: cat === 'Hadis' ? 'book-outline' : cat === 'Dua' ? 'hands-outline' : cat === 'Prophet Stories' ? 'star-outline' : cat === 'Quran Surah' ? 'library-outline' : 'bulb-outline',
  }));

interface OnboardingPreferencesScreenProps {
  onComplete: (categories: ContentCategory[]) => void;
}

export const OnboardingPreferencesScreen: React.FC<OnboardingPreferencesScreenProps> = ({
  onComplete,
}) => {
  const navigation = useNavigation();
  const [selectedPreferences, setSelectedPreferences] = useState<ContentCategory[]>([]);

  const handleTogglePreference = (category: ContentCategory) => {
    setSelectedPreferences((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleContinue = () => {
    if (selectedPreferences.length > 0) {
      onComplete(selectedPreferences);
      navigation.navigate('Main' as never);
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
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Select your interests</Text>
          <Text style={styles.subtitle}>
            Choose the topics you'd like to learn about{'\n'}
            You can select multiple options
          </Text>

          <View style={styles.optionsContainer}>
            {preferences.map((pref) => {
              const isSelected = selectedPreferences.includes(pref.value);
              return (
                <TouchableOpacity
                  key={pref.value}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleTogglePreference(pref.value)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={[
                      styles.iconContainer,
                      isSelected && styles.iconContainerSelected
                    ]}>
                      <Ionicons
                        name={pref.icon as any}
                        size={28}
                        color={isSelected ? '#2D8659' : '#718096'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {pref.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#2D8659" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedPreferences.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedPreferences.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {selectedPreferences.length > 0
              ? `Continue with ${selectedPreferences.length} ${selectedPreferences.length === 1 ? 'interest' : 'interests'}`
              : 'Select at least one interest'
            }
          </Text>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    rowGap: GAP,
  },
  optionButton: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 140,
  },
  optionButtonSelected: {
    borderColor: '#2D8659',
    backgroundColor: '#F0F9F4',
    borderWidth: 3,
    shadowColor: '#2D8659',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainerSelected: {
    backgroundColor: '#E6F7ED',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    lineHeight: 22,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  optionTextSelected: {
    color: '#2D8659',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
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
