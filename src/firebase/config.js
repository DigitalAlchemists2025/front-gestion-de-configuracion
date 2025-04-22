import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAtJ2XaTscB1ZBWGJxXMECL1jPMTT5K03U",
  authDomain: "gestiondeconfiguracion-ea866.firebaseapp.com",
  projectId: "gestiondeconfiguracion-ea866",
  storageBucket: "gestiondeconfiguracion-ea866.appspot.com", 
  messagingSenderId: "344658145836",
  appId: "1:344658145836:web:9425950e501a83fe8a9789",
  measurementId: "G-8RHZYJ3M9H"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
auth.useDeviceLanguage();
const provider = new GoogleAuthProvider();

export { auth, provider };