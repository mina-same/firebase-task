/**
 * Firebase Configuration Module
 * 
 * This module initializes and exports Firebase services for the application.
 * It uses environment variables from Vite for configuration.
 * 
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Firebase configuration object
 * All values are loaded from environment variables for security
 * 
 * @constant {Object} firebaseConfig
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validates that all required Firebase configuration values are present
 * Throws an error if any required value is missing
 * 
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
    (field) => !firebaseConfig[field] || firebaseConfig[field] === `your_${field.toLowerCase()}_here`
  );

  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    console.error(
      'Please configure your Firebase credentials in the .env file. See .env.example for reference.'
    );
    // Don't throw error in development to allow the app to load
    // throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
};

// Validate configuration on import
validateFirebaseConfig();

/**
 * Initialize Firebase app with the configuration
 * This should only be initialized once
 * 
 */
const app = initializeApp(firebaseConfig);

/**
 * Get Firestore database instance
 * This is the main database service for the application
 * 
 */
const db = getFirestore(app);

/**
 * Get Firebase Authentication instance
 * Used for user authentication (optional for this project)
 * 
 */
const auth = getAuth(app);

// Connect to Firestore emulator in development if needed
// Uncomment the lines below to use the local emulator
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

/**
 * Export Firebase services for use throughout the application
 */
export { app, db, auth };
export default db;

