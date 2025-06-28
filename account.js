document.addEventListener("DOMContentLoaded", function () {
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    loadAccountInfo();

    // Hide all pages
    document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));

    // Show account page
    document.getElementById("accountPage").classList.remove("d-none");
  } else {
    // Graceful fallback to home page
    document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
    document.getElementById("homePage").classList.remove("d-none");
  }

  // Start quiz from account page
  const startQuizBtn = document.getElementById("startQuizBtnFromAccount");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      // Hide all pages first
      document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
      // Fetch new questions and reset quiz state before starting
      quizModule.fetchQuestions().then(() => {
        quizModule.startQuiz();
        document.getElementById("quizPage").classList.remove("d-none");
      });
    });
  }

  // Logout from account page
  const logoutBtn = document.getElementById("logoutFromAccount");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
      document.getElementById("homePage").classList.remove("d-none");
    });
  }
});

// Load user data and score history into account page
function loadAccountInfo() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    document.getElementById("accountUsername").textContent = user.username;
    document.getElementById("accountEmail").textContent = user.email;

    // Fetch user's past scores
    fetch(`/user-scores/${user.username}`)
      .then(res => res.json())
      .then(scores => {
        const list = document.getElementById("userScoreList");
        list.innerHTML = ""; // Clear previous entries

        if (!scores.length) {
          const noData = document.createElement("li");
          noData.className = "list-group-item";
          noData.textContent = "No quiz history yet.";
          list.appendChild(noData);
        } else {
          scores.reverse().forEach((entry, i) => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `Attempt ${i + 1}: ${entry.score} / 10`;
            list.appendChild(li);
          });
        }
      })
      .catch(err => console.error("Error loading user scores:", err));
  }
}

// Expose this globally so quiz.js can use it after submission
window.loadAccountInfo = loadAccountInfo;