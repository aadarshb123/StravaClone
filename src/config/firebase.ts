// Firebase configuration
// Note: You need to add your own Firebase configuration from Firebase Console

// For Android: 
// 1. Download google-services.json from Firebase Console
// 2. Place it in android/app/

// For iOS:
// 1. Download GoogleService-Info.plist from Firebase Console  
// 2. Add it to ios/StravaClone/ using Xcode

// Firebase automatically initializes when the app starts
// No additional configuration needed in this file

export const firebaseConfig = {
  // Firebase will use the native config files (google-services.json and GoogleService-Info.plist)
  // Make sure to add these files from your Firebase project
};

// Instructions to set up Firebase:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing
// 3. Add Android app with package name: com.stravaclone
// 4. Download google-services.json and place in android/app/
// 5. Add iOS app with bundle ID: org.reactjs.native.example.StravaClone
// 6. Download GoogleService-Info.plist and add to iOS project via Xcode
// 7. Enable Authentication (Email/Password) in Firebase Console
// 8. Enable Firestore Database in Firebase Console