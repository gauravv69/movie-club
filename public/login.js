const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username-input");

loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  if (!username) {
    alert("Please enter your name to continue!");
    return;
  }

  // Save username locally
  localStorage.setItem("movieClubUser", username);

  // Redirect to main app page
  window.location.href = "/home";
});
