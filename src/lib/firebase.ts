import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCM30raXoyrXvikSaV-wvPe05XibQRl7qU",
  authDomain: "resmokeonsiterepairs.firebaseapp.com",
  projectId: "resmokeonsiterepairs",
  storageBucket: "resmokeonsiterepairs.firebasestorage.app",
  messagingSenderId: "761897110230",
  appId: "1:761897110230:web:ac3c49ac2a398cb43dd777",
  measurementId: "G-YF5KP0Y15K",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
