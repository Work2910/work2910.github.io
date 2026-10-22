// 1. Paste the config object from Firebase console → Project settings → Your apps → Web app.
// 2. Paste your owner UID from Firebase console → Authentication → Users.
// These values are not secret: the Firestore security rules are what stop anyone else from editing.
export const firebaseConfig = {
  apiKey: "AIzaSyBy-uIFmKN4FOt2L_ohQ-Q_kXR3sy5hJKM",
  authDomain: "shoumik-portfolio-ae2ae.firebaseapp.com",
  projectId: "shoumik-portfolio-ae2ae",
  storageBucket: "shoumik-portfolio-ae2ae.firebasestorage.app",
  messagingSenderId: "881300301863",
  appId: "1:881300301863:web:3bd0a6b5ad3b91df10c602"
};

export const OWNER_UID = "VcrAtIKHvOfH96pTFaXRmbVZnkE2";

export const isConfigured = !Object.values(firebaseConfig).some(v => String(v).includes('PASTE_'));
