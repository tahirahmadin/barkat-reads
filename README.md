# Barkat Learn - Islamic Micro-Learning App

A React Native + Expo mobile app for learning Islam through swipeable cards. Learn daily in just 5 minutes with bite-sized Islamic teachings tailored to your interests.

## Features

- **Swipe-Based Learning**: Swipe right to mark as learned, left to save for later
- **Topic Selection**: Choose from Hadith, Deen, Namaz, Hajj, Quran, Islamic History, and Duas
- **Daily Learning Limit**: 5 cards per day to maintain consistency
- **Streak Tracking**: Track your daily learning streak
- **Saved Cards**: Bookmark cards to revisit later
- **Progress Tracking**: View your learning statistics and progress

## Tech Stack

- **React Native** with Expo
- **Zustand** for state management
- **React Navigation** for navigation
- **React Native Gesture Handler** & **Reanimated** for swipe animations
- **AsyncStorage** for local persistence

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CardStack.tsx
│   ├── PreferenceSelector.tsx
│   ├── ProgressHeader.tsx
│   ├── StatsCard.tsx
│   └── SwipeCard.tsx
├── data/              # Mock data
│   └── mockData.ts
├── navigation/        # Navigation setup
│   └── AppNavigator.tsx
├── screens/          # App screens
│   ├── HomeScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SavedScreen.tsx
│   └── WelcomeScreen.tsx
├── store/            # Zustand store
│   └── useStore.ts
└── types/            # TypeScript types
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Troubleshooting

**Reanimated Version Mismatch Error:**
If you see a Worklets version mismatch error:
1. Stop the Expo server (Ctrl+C)
2. Clear cache and restart: `npm run start:clear`
3. If using Expo Go, ensure you're using Reanimated v3 (already configured)
4. For Reanimated v4, you'll need to create a development build: `npx expo prebuild` and `npx expo run:ios` or `npx expo run:android`

## App Flow

1. **Welcome Screen**: Introduction to the app
2. **Onboarding**: Select your learning interests
3. **Home Screen**: Swipe through cards based on your interests
4. **Saved Screen**: View bookmarked cards
5. **Profile Screen**: View your learning statistics

## Card Structure

Each card contains:
- **Topic**: Category (Hadith, Deen, Namaz, etc.)
- **Title**: Card title
- **Short Text**: Brief summary (shown by default)
- **Full Text**: Complete content (shown when tapped)
- **Reference**: Source reference

## Swipe Gestures

- **Swipe Right**: Mark card as learned (counts toward daily limit)
- **Swipe Left**: Save card for later
- **Tap**: Expand/collapse card to see full content

## Daily Limit

- Users can learn up to 5 cards per day
- Daily limit resets at midnight
- Streak tracking encourages daily learning

## Future Enhancements

- Community features
- Subscription model
- Scholar-verified content
- Audio support
- Push notifications
- Social sharing

## License

MIT
# barkat-reads
