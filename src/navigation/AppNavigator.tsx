import React, { useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LandingScreen } from '../screens/LandingScreen';
import { OnboardingAgeScreen } from '../screens/OnboardingAgeScreen';
import { OnboardingLanguageScreen } from '../screens/OnboardingLanguageScreen';
import { OnboardingPreferencesScreen } from '../screens/OnboardingPreferencesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NamazScreen } from '../screens/NamazScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useStore } from '../store/useStore';
import { Topic } from '../types';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FBFBFB',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5EA',
          height: 52 + Math.max(insets.bottom, 0),
          paddingBottom: Math.max(insets.bottom, 0),
          paddingTop: 4,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          paddingHorizontal: 0,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={props.style} />
          ),
        }}
      />
      <Tab.Screen
        name="Namaz"
        component={NamazScreen}
        options={{
          tabBarLabel: 'Namaz',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={props.style} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={props.style} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={props.style} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


export const AppNavigator = () => {
  const { hasCompletedOnboarding, setPreferences, completeOnboarding } =
    useStore();
  const navigationRef = useRef<any>(null);
  const prevOnboardingRef = useRef(hasCompletedOnboarding);

  const handleOnboardingComplete = (topics: Topic[]) => {
    setPreferences(topics);
    completeOnboarding();
  };

  // Reset navigation when logout happens (hasCompletedOnboarding changes from true to false)
  useEffect(() => {
    if (prevOnboardingRef.current === true && hasCompletedOnboarding === false) {
      // User logged out - reset navigation to Landing
      if (navigationRef.current) {
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Landing' }],
          })
        );
      }
    }
    prevOnboardingRef.current = hasCompletedOnboarding;
  }, [hasCompletedOnboarding]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="OnboardingAge" component={OnboardingAgeScreen} />
            <Stack.Screen name="OnboardingLanguage" component={OnboardingLanguageScreen} />
            <Stack.Screen name="OnboardingPreferences">
              {(props) => (
                <OnboardingPreferencesScreen
                  {...props}
                  onComplete={handleOnboardingComplete}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Main" component={MainTabs} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
