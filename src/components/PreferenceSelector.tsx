import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

export interface TopicOption {
  slug: string;
  label: string;
}

interface PreferenceSelectorProps {
  topics: TopicOption[];
  selectedSlugs: string[];
  onToggleSlug: (slug: string) => void;
  onContinue: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({
  topics,
  selectedSlugs,
  onToggleSlug,
  onContinue,
  loading = false,
  emptyMessage,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Interests</Text>
      <Text style={styles.subtitle}>
        Choose categories you'd like to learn about
      </Text>

      <ScrollView style={styles.topicsContainer}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#27ae60" />
            <Text style={styles.loadingText}>Loading topics…</Text>
          </View>
        ) : emptyMessage && topics.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          topics.map((topic) => {
            const isSelected = selectedSlugs.includes(topic.slug);
            return (
              <TouchableOpacity
                key={topic.slug}
                style={[
                  styles.topicButton,
                  isSelected && styles.topicButtonSelected,
                ]}
                onPress={() => onToggleSlug(topic.slug)}
              >
                <Text
                  style={[
                    styles.topicText,
                    isSelected && styles.topicTextSelected,
                  ]}
                >
                  {topic.label}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedSlugs.length === 0 && styles.continueButtonDisabled,
        ]}
        onPress={onContinue}
        disabled={selectedSlugs.length === 0}
      >
        <Text style={styles.continueButtonText}>
          Continue ({selectedSlugs.length} selected)
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
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyWrap: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
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
