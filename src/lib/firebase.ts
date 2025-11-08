import {FirebaseOptions, initializeApp, getApps} from 'firebase/app';
import {getFirestore, Firestore} from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const hasConfig = Object.values(firebaseConfig).every(value => typeof value === 'string' && value.length > 0);

let firestoreInstance: Firestore | undefined;

if (hasConfig) {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  firestoreInstance = getFirestore(app);
}

export const firestore = firestoreInstance;
export const isFirestoreEnabled = Boolean(firestoreInstance);
