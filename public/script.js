// Import Firebase (Modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update }
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your Firebase config (from your firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyANMbzzi8CseDyrzdROGDkx3qhHnlD8krs",
  authDomain: "movie-club-app-60152.firebaseapp.com",
  databaseURL: "https://movie-club-app-60152-default-rtdb.firebaseio.com",
  projectId: "movie-club-app-60152",
  storageBucket: "movie-club-app-60152.firebasestorage.app",
  messagingSenderId: "969094939843",
  appId: "1:969094939843:web:4ccc55a87b3fddc92ece76"
};

// Initialize Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ---------- UI ELEMENTS ----------
const addMovieBtn = document.getElementById("add-movie-btn");
const addSeriesBtn = document.getElementById("add-series-btn");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const itemTitle = document.getElementById("item-title");
const itemDesc = document.getElementById("item-desc");
const moviesDiv = document.getElementById("movies");
const seriesDiv = document.getElementById("series");
const logoutBtn = document.getElementById("logout-btn");
const welcomeText = document.getElementById("welcome-text");

const currentUser = localStorage.getItem("movieClubUser");
if (!currentUser) window.location.href = "index.html";
else welcomeText.textContent = `Welcome, ${currentUser}! 🍿`;

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("movieClubUser");
  window.location.href = "index.html";
});

let currentType = null;
let undoTimeout = null;
let lastAddedKey = null;

// ---------- OPEN / CLOSE MODAL ----------
addMovieBtn.addEventListener("click", () => openModal("movie"));
addSeriesBtn.addEventListener("click", () => openModal("series"));

function openModal(type) {
  currentType = type;
  modalTitle.textContent = type === "movie" ? "Add Movie" : "Add Web Series";
  itemTitle.value = "";
  itemDesc.value = "";
  modal.classList.remove("hidden");
}

cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));

// ---------- ADD MOVIE / SERIES ----------
saveBtn.addEventListener("click", () => {
  const title = itemTitle.value.trim();
  const desc = itemDesc.value.trim();

  if (!title) return alert("Please enter a title!");

  const listRef = ref(db, currentType === "movie" ? "movies" : "series");

  // Check for duplicate (optional but good)
  onValue(listRef, (snapshot) => {
    const data = snapshot.val() || {};
    const exists = Object.values(data).some(
      (m) => m.title.toLowerCase() === title.toLowerCase()
    );

    if (exists) {
      showAlert(`⚠️ "${title}" already exists in ${currentType}s!`);
      return;
    }

    const newItem = {
      title,
      desc,
      user: currentUser,
      upvotes: 0,
      downvotes: 0,
    };

    const newItemRef = push(listRef);
    set(newItemRef, newItem);
    lastAddedKey = newItemRef.key;
    modal.classList.add("hidden");
    showUndoNotification();
  }, { onlyOnce: true });
});

// ---------- DISPLAY ITEMS ----------
function listenForChanges() {
  onValue(ref(db, "movies"), (snapshot) => {
    displayCategory(moviesDiv, snapshot.val(), "movie");
  });

  onValue(ref(db, "series"), (snapshot) => {
    displayCategory(seriesDiv, snapshot.val(), "series");
  });
}

function displayCategory(container, data, type) {
  container.innerHTML = "";
  if (!data) {
    container.innerHTML = "<p>No items added yet.</p>";
    return;
  }

  Object.entries(data).forEach(([key, item]) => {
    const score = item.upvotes - item.downvotes;
    const canRemove = item.user === currentUser;

    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <small class="added-by">Added by: <strong>${item.user}</strong></small>
      <div class="votes">
        <button onclick="vote('${type}', '${key}', 'up')">👍</button>
        <span class="up-count">${item.upvotes}</span>
        <button onclick="vote('${type}', '${key}', 'down')">👎</button>
        <span class="down-count">${item.downvotes}</span>
        <span class="total-score">Score: ${score >= 0 ? '+' + score : score}</span>
      </div>
      ${
        canRemove
          ? `<button class="remove-btn" onclick="removeItem('${type}', '${key}')">🗑️ Remove</button>`
          : `<p class="no-permission">🚫 Only ${item.user} can remove this.</p>`
      }
    `;
    container.appendChild(card);
  });
}

// ---------- VOTING ----------
window.vote = (type, key, direction) => {
  const itemRef = ref(db, `${type === "movie" ? "movies" : "series"}/${key}`);
  onValue(itemRef, (snapshot) => {
    const item = snapshot.val();
    if (!item) return;
    const updates = {};
    if (direction === "up") updates.upvotes = (item.upvotes || 0) + 1;
    if (direction === "down") updates.downvotes = (item.downvotes || 0) + 1;
    update(itemRef, updates);
  }, { onlyOnce: true });
};

// ---------- REMOVE ----------
window.removeItem = (type, key) => {
  const itemRef = ref(db, `${type === "movie" ? "movies" : "series"}/${key}`);
  onValue(itemRef, (snapshot) => {
    const item = snapshot.val();
    if (!item) return;
    if (item.user !== currentUser)
      return alert("You can only remove items you added!");
    if (confirm(`Remove "${item.title}"?`)) remove(itemRef);
  }, { onlyOnce: true });
};

// ---------- UNDO ----------
function showUndoNotification() {
  const undoDiv = document.createElement("div");
  undoDiv.className = "undo-toast";
  undoDiv.innerHTML = `
    <span>Added successfully!</span>
    <button id="undo-btn">Undo</button>
  `;
  document.body.appendChild(undoDiv);

  document.getElementById("undo-btn").addEventListener("click", () => {
    const path = currentType === "movie" ? "movies" : "series";
    if (lastAddedKey) remove(ref(db, `${path}/${lastAddedKey}`));
    undoDiv.remove();
  });

  undoTimeout = setTimeout(() => undoDiv.remove(), 5000);
}

// ---------- ALERT ----------
function showAlert(message) {
  const alertBox = document.createElement("div");
  alertBox.className = "alert-popup";
  alertBox.textContent = message;
  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.classList.add("fade-out");
    setTimeout(() => alertBox.remove(), 500);
  }, 2000);
}

// ---------- START ----------
listenForChanges();
