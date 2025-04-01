// public/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Add the missing databaseURL field here
const firebaseConfig = {
  apiKey: "AIzaSyBa-9az1mvA2lVO5tsAKuHtyxuz0IdRvFc",
  authDomain: "itproject-1d0a1.firebaseapp.com",
  databaseURL: "https://itproject-1d0a1-default-rtdb.firebaseio.com",
  projectId: "itproject-1d0a1",
  storageBucket: "itproject-1d0a1.appspot.com",
  messagingSenderId: "315860586722",
  appId: "1:315860586722:web:16fa6a41cdbcd206d68ebb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set, get, remove, child };
