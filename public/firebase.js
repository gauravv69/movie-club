// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyANMbzzi8CseDyrzdROGDkx3qhHnlD8krs",
  authDomain: "movie-club-app-60152.firebaseapp.com",
  databaseURL: "https://movie-club-app-60152-default-rtdb.asia-southeast1.firebasedatabase.app/", // ✅ MUST BE INCLUDED
  projectId: "movie-club-app-60152",
  storageBucket: "movie-club-app-60152.firebasestorage.app",
  messagingSenderId: "969094939843",
  appId: "1:969094939843:web:4ccc55a87b3fddc92ece76"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("Firebase initialized ✅");
