# Strava Clone

A React Native fitness tracking app with GPS activity recording, Firebase authentication, and activity history.

> **⚠️ Note**: Currently only works on **Android**. iOS support is not functional.

## Prerequisites

- Node.js (v18+)
- Android Studio with Android emulator
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Metro bundler**
   ```bash
   npm start
   ```

3. **Run on Android** (in a new terminal)
   ```bash
   npm run android
   ```

## Features

- GPS activity tracking (running)
- Real-time distance, pace, and duration tracking
- Firebase authentication
- Activity history with statistics
- User profile with lifetime stats

## Troubleshooting

If the app doesn't build, try:
- Clean build: `cd android && ./gradlew clean`
- Reset Metro cache: `npm start -- --reset-cache`
