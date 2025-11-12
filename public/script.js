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

let movies = JSON.parse(localStorage.getItem("movies")) || [];
let series = JSON.parse(localStorage.getItem("series")) || [];
let undoTimeout = null;
let lastAddedIndex = null;
let currentType = null;

const currentUser = localStorage.getItem("movieClubUser");
if (!currentUser) {
  window.location.href = "index.html";
} else {
  welcomeText.textContent = `Welcome, ${currentUser}! 🍿`;
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("movieClubUser");
  window.location.href = "index.html";
});

// Open modal
addMovieBtn.addEventListener("click", () => openModal("movie"));
addSeriesBtn.addEventListener("click", () => openModal("series"));

function openModal(type) {
  currentType = type;
  modalTitle.textContent = type === "movie" ? "Add Movie" : "Add Web Series";
  itemTitle.value = "";
  itemDesc.value = "";
  modal.classList.remove("hidden");
}

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveBtn.addEventListener("click", () => {
  const title = itemTitle.value.trim();
  const desc = itemDesc.value.trim();

  if (!title) return alert("Please enter a title!");

  const list = currentType === "movie" ? movies : series;
  const exists = list.some(
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

  list.push(newItem);
  lastAddedIndex = list.length - 1;
  saveData();
  displayItems();
  modal.classList.add("hidden");
  showUndoNotification();
});

function saveData() {
  localStorage.setItem("movies", JSON.stringify(movies));
  localStorage.setItem("series", JSON.stringify(series));
}

function displayItems() {
  displayCategory(moviesDiv, movies, "movie");
  displayCategory(seriesDiv, series, "series");
}

function displayCategory(container, list, type) {
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p>No items added yet.</p>";
    return;
  }

  list.forEach((item, index) => {
    const score = item.upvotes - item.downvotes;
    const canRemove = item.user === currentUser;

    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <small class="added-by">Added by: <strong>${item.user}</strong></small>
      <div class="votes">
        <button onclick="vote('${type}', ${index}, 'up')">👍</button>
        <span class="up-count">${item.upvotes}</span>
        <button onclick="vote('${type}', ${index}, 'down')">👎</button>
        <span class="down-count">${item.downvotes}</span>
        <span class="total-score">Score: ${score >= 0 ? '+' + score : score}</span>
      </div>
      ${
        canRemove
          ? `<button class="remove-btn" onclick="removeItem('${type}', ${index})">🗑️ Remove</button>`
          : `<p class="no-permission">🚫 Only ${item.user} can remove this.</p>`
      }
    `;
    container.appendChild(card);
  });
}

function vote(type, index, direction) {
  const list = type === "movie" ? movies : series;
  if (direction === "up") list[index].upvotes++;
  else list[index].downvotes++;
  saveData();
  displayItems();
}

function removeItem(type, index) {
  const list = type === "movie" ? movies : series;
  if (list[index].user !== currentUser) {
    alert("You can only remove items you added!");
    return;
  }
  if (confirm(`Remove "${list[index].title}"?`)) {
    list.splice(index, 1);
    saveData();
    displayItems();
  }
}

function showUndoNotification() {
  const undoDiv = document.createElement("div");
  undoDiv.className = "undo-toast";
  undoDiv.innerHTML = `
    <span>Added successfully!</span>
    <button id="undo-btn">Undo</button>
  `;
  document.body.appendChild(undoDiv);

  document.getElementById("undo-btn").addEventListener("click", () => {
    const list = currentType === "movie" ? movies : series;
    list.splice(lastAddedIndex, 1);
    saveData();
    displayItems();
    undoDiv.remove();
  });

  undoTimeout = setTimeout(() => undoDiv.remove(), 5000);
}

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

displayItems();
