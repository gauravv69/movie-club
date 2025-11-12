import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const addBtn = document.getElementById("add-btn");
const movieTitle = document.getElementById("movie-title");
const movieDesc = document.getElementById("movie-desc");
const movieList = document.getElementById("movies");
const userName = document.getElementById("user-name");

function displayMovies(movies) {
  movieList.innerHTML = "";
  if (!movies) {
    movieList.innerHTML = "<p>No movies added yet.</p>";
    return;
  }

  Object.entries(movies).forEach(([id, movie]) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <h3>${movie.title}</h3>
      <p>${movie.desc}</p>
      <small>Added by: <strong>${movie.user || "Anonymous"}</strong></small>
      <div class="votes">
        <button onclick="vote('${id}', 'up')">👍</button>
        <span>${movie.upvotes || 0}</span>
        <button onclick="vote('${id}', 'down')">👎</button>
        <span>${movie.downvotes || 0}</span>
      </div>
      ${movie.user === userName.value.trim() ? `<button onclick="deleteMovie('${id}')">🗑️ Remove</button>` : ""}
    `;
    movieList.appendChild(card);
  });
}

// Listen for live updates
onValue(ref(db, "movies"), (snapshot) => {
  const data = snapshot.val();
  displayMovies(data);
});

// Add new movie
addBtn.addEventListener("click", () => {
  const title = movieTitle.value.trim();
  const desc = movieDesc.value.trim();
  const user = userName.value.trim() || "Anonymous";

  if (!title) return alert("Please enter a movie title");

  const newMovie = {
    title,
    desc,
    user,
    upvotes: 0,
    downvotes: 0
  };

  push(ref(db, "movies"), newMovie);

  movieTitle.value = "";
  movieDesc.value = "";
});

// Voting system
window.vote = (id, type) => {
  const movieRef = ref(db, `movies/${id}`);
  onValue(movieRef, (snapshot) => {
    const movie = snapshot.val();
    if (!movie) return;
    const updates = {};
    if (type === "up") updates.upvotes = (movie.upvotes || 0) + 1;
    if (type === "down") updates.downvotes = (movie.downvotes || 0) + 1;
    update(movieRef, updates);
  }, { onlyOnce: true });
};

// Delete movie (only by creator)
window.deleteMovie = (id) => {
  if (confirm("Are you sure you want to delete this movie?")) {
    remove(ref(db, `movies/${id}`));
  }
};
