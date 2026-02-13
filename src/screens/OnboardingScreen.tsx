import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PreferenceSelector } from '../components/PreferenceSelector';
import { Topic } from '../types';

interface OnboardingScreenProps {
  onComplete: (topics: Topic[]) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const navigation = useNavigation();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  const handleToggleTopic = (topic: Topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleContinue = () => {
    if (selectedTopics.length > 0) {
      onComplete(selectedTopics);
      navigation.navigate('Main' as never);
    }
  };

  return (
    <View style={styles.container}>
      <PreferenceSelector
        selectedTopics={selectedTopics}
        onToggleTopic={handleToggleTopic}
        onContinue={handleContinue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});
