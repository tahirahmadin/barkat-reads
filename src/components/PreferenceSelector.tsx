import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ContentCategory } from '../types';
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABELS } from '../constants/categories';

interface PreferenceSelectorProps {
  selectedCategories: ContentCategory[];
  onToggleCategory: (category: ContentCategory) => void;
  onContinue: () => void;
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({
  selectedCategories,
  onToggleCategory,
  onContinue,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Interests</Text>
      <Text style={styles.subtitle}>
        Choose categories you'd like to learn about
      </Text>

      <ScrollView style={styles.topicsContainer}>
        {CONTENT_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.topicButton,
                isSelected && styles.topicButtonSelected,
              ]}
              onPress={() => onToggleCategory(category)}
            >
              <Text
                style={[
                  styles.topicText,
                  isSelected && styles.topicTextSelected,
                ]}
              >
                {CONTENT_CATEGORY_LABELS[category]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedCategories.length === 0 && styles.continueButtonDisabled,
        ]}
        onPress={onContinue}
        disabled={selectedCategories.length === 0}
      >
        <Text style={styles.continueButtonText}>
          Continue ({selectedCategories.length} selected)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  topicsContainer: {
    flex: 1,
  },
  topicButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topicButtonSelected: {
    borderColor: '#27ae60',
    backgroundColor: '#e8f8f0',
  },
  topicText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '500',
  },
  topicTextSelected: {
    color: '#27ae60',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
