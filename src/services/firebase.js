import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkgHonshwQ3MIAe18B51Io0Dvfd695KYA",
  authDomain: "escala-do-pao.firebaseapp.com",
  projectId: "escala-do-pao",
  storageBucket: "escala-do-pao.firebasestorage.app",
  messagingSenderId: "984681678876",
  appId: "1:984681678876:web:aa5004e981a721cbbc77d9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };


