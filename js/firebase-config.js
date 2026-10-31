// Firebase config — FinanzApp
// Usando CDN compat (no requiere npm install)
const firebaseConfig = {
  apiKey: "AIzaSyDN-ArOTc4HQzO5w7X7eb6eyM9JwrwN90E",
  authDomain: "finanzas-12jj.firebaseapp.com",
  projectId: "finanzas-12jj",
  storageBucket: "finanzas-12jj.firebasestorage.app",
  messagingSenderId: "355774287624",
  appId: "1:355774287624:web:c24211b69dd3530eab66bd"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
