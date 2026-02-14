import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

export const OnboardingAgeScreen: React.FC = () => {
  const navigation = useNavigation();
  const setUserAge = useStore((s) => s.setUserAge);
  const [age, setAge] = useState<string>('');

  const handleContinue = () => {
    const ageNum = parseInt(age, 10);
    if (age && !isNaN(ageNum) && ageNum > 0 && ageNum < 150) {
      setUserAge(ageNum);
      navigation.navigate('OnboardingLanguage' as never);
    }
  };

  const isValidAge = () => {
    const ageNum = parseInt(age, 10);
    return age && !isNaN(ageNum) && ageNum > 0 && ageNum < 150;
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
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>What's your age?</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your learning experience
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.ageInput}
                value={age}
                onChangeText={setAge}
                placeholder="00"
                placeholderTextColor="#CBD5E0"
                keyboardType="number-pad"
                maxLength={3}
                autoFocus={true}
              />
              <Text style={styles.yearsLabel}>years</Text>
            </View>
            {age && !isValidAge() && (
              <Text style={styles.errorText}>Please enter a valid age</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isValidAge() && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValidAge()}
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  inputWrapper: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ageInput: {
    width: 140,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    fontSize: 48,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  yearsLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#718096',
    marginTop: 4,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 16,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
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
