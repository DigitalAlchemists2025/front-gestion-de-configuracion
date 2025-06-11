import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: procces.env.FB_API_KEY,
  authDomain: procces.env.FB_AUTH_DOMAIN,
  projectId: procces.env.FB_PROJECT_ID,
  storageBucket: procces.env.FB_STORAGE_BUCKET, 
  messagingSenderId: procces.env.FB_MESSAGING,
  appId: procces.env.FB_APP_ID,
  measurementId: procces.env.FB_MEAS_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
auth.useDeviceLanguage();
const provider = new GoogleAuthProvider();

export { auth, provider };