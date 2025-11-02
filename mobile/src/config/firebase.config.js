/**
 * Firebase Configuration for React Native
 * 
 * This file initializes Firebase and sets up Firestore connection.
 * It uses the same Firebase project as the web dashboard, so both
 * apps can share the same database.
 * 
 * IMPORTANT: You need to add your Firebase credentials to use real data.
 * For development, you can use mock data instead (see hooks/useMockChat.js)
 * 
 * @module config/firebase.config
 */

// Import Firebase modules
// We need the core app, Firestore database, and authentication
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration Object
 * 
 * Replace these placeholder values with your actual Firebase project credentials.
 * You can find these in Firebase Console → Project Settings → General → Your apps
 * 
 * @constant {Object} firebaseConfig
 */
const firebaseConfig = {
  // API Key - Public identifier for your Firebase project
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'your_api_key_here',
  
  // Auth Domain - URL for Firebase Authentication
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your_project.firebaseapp.com',
  
  // Project ID - Unique identifier for your Firebase project
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your_project_id',
  
  // Storage Bucket - For file uploads (not used in this app, but required)
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your_project.appspot.com',
  
  // Messaging Sender ID - For push notifications (not used in this app, but required)
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your_sender_id',
  
  // App ID - Unique identifier for this app
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'your_app_id',
};

/**
 * Validates Firebase configuration
 * Checks if all required values are present and not placeholder values
 * 
 * @returns {boolean} True if configuration is valid
 */
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];
  
  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field] || firebaseConfig[field].includes('your_')
  );
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Firebase configuration incomplete. Using mock data instead.');
    console.warn('Missing fields:', missingFields);
    console.warn('To use real Firebase:');
    console.warn('1. Create a .env file in the project root');
    console.warn('2. Add your Firebase credentials as EXPO_PUBLIC_* variables');
    console.warn('3. Restart the Expo development server');
    return false;
  }
  
  return true;
};

/**
 * Initialize Firebase App
 * 
 * Firebase apps should only be initialized once. This checks if an app
 * already exists to prevent duplicate initialization errors.
 * 
 * @constant {FirebaseApp} app
 */
let app;

if (getApps().length === 0) {
  // No Firebase app exists yet, create a new one
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} else {
  // Firebase app already exists, use the existing one
  app = getApps()[0];
  console.log('✅ Using existing Firebase app');
}

/**
 * Initialize Firestore Database
 * 
 * Firestore is the database we'll use to store and retrieve:
 * - Conversations list
 * - Chat messages
 * 
 * We use initializeFirestore instead of getFirestore to ensure
 * proper initialization in React Native environment.
 * 
 * @constant {Firestore} db
 */
let db;

try {
  // Initialize Firestore with persistence enabled
  // This caches data locally for offline support
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false, // Use WebSocket for better performance
  });
  
  console.log('✅ Firestore initialized');
} catch (error) {
  console.error('❌ Error initializing Firestore:', error);
  // Fallback to getFirestore if initializeFirestore fails
  db = getFirestore(app);
}

/**
 * Check if Firebase is properly configured
 * 
 * @constant {boolean} isFirebaseConfigured
 */
export const isFirebaseConfigured = validateFirebaseConfig();

/**
 * Export Firebase services for use throughout the app
 * 
 * - `app`: Firebase app instance
 * - `db`: Firestore database instance
 * - `isFirebaseConfigured`: Whether Firebase is properly set up
 */
export { app, db };
export default db;

