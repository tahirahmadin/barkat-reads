import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PreferenceSelector } from '../components/PreferenceSelector';
import type { ContentCategory } from '../types';

interface OnboardingScreenProps {
  onComplete: (categories: ContentCategory[]) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const navigation = useNavigation();
  const [selectedCategories, setSelectedCategories] = useState<ContentCategory[]>([]);

  const handleToggleCategory = (category: ContentCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      onComplete(selectedCategories);
      navigation.navigate('Main' as never);
    }
  };

  return (
    <View style={styles.container}>
      <PreferenceSelector
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
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
