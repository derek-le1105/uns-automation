// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYOTzv5nYrYsO_AC0P9yLsgqtDO2Fgs20",
  authDomain: "uns-automation.firebaseapp.com",
  projectId: "uns-automation",
  storageBucket: "uns-automation.appspot.com",
  messagingSenderId: "297331482830",
  appId: "1:297331482830:web:02857f3fab4c5e43edf09f",
  measurementId: "G-6KVENG8V7R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
//const analytics = getAnalytics(app);
