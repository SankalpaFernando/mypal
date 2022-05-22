import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID
} from '@env';
import {initializeApp} from 'firebase/app';
import 'firebase/auth';
import {getAuth} from 'firebase/auth';
import 'firebase/firestore';
import {getFirestore, initializeFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const firestore = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});

export {firebaseApp, auth, firestore};
