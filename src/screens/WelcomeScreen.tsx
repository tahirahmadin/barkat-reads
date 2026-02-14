import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Onboarding' as never);
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Barkat Reads</Text>
        <Text style={styles.subtitle}>
          Learn Islam daily{'\n'}in 5 minutes
        </Text>
        <Text style={styles.description}>
          Swipe through bite-sized Islamic teachings{'\n'}
          tailored to your interests
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'space-between',
    padding: 40,
    paddingTop: 100,
    paddingBottom: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 38,
  },
  description: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
