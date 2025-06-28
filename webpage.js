document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtnHome")?.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
    document.getElementById("loginPage").classList.remove("d-none");
  });

  document.getElementById("signupBtnHome")?.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
    document.getElementById("signupPage").classList.remove("d-none");
  });

  document.getElementById("backToSignupFromLogin")?.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
    document.getElementById("signupPage").classList.remove("d-none");
  });

  document.getElementById("backToLoginFromSignup")?.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
    document.getElementById("loginPage").classList.remove("d-none");
  });

document.getElementById("startQuizBtn")?.addEventListener("click", () => {
  const btn = document.getElementById("startQuizBtn");
  btn.disabled = true;

  quizModule.fetchQuestions()
    .then(() => {
      quizModule.startQuiz();
    })
    .catch((err) => {
      console.error("Failed to load questions:", err);
      alert("Could not load questions. Please try again.");
    })
    .finally(() => {
      btn.disabled = false;
    });
});

  // Go to Account page from questionCountPage or resultPage
  const accountButtons = document.querySelectorAll("#goToAccountPage");

  accountButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        let user;
        try {
          user = JSON.parse(currentUser);
        } catch (e) {
          alert("Stored user is corrupted.");
          return;
        }

        const usernameEl = document.getElementById("accountUsername");
        const emailEl = document.getElementById("accountEmail");

        if (usernameEl && emailEl) {
          usernameEl.textContent = user.username || "Unknown";
          emailEl.textContent = user.email || "Unknown";
        }

        document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
        document.getElementById("accountPage").classList.remove("d-none");
      } else {
        alert("You must be logged in to access the account page.");
      }
    });
  });

document.getElementById("shareResultBtn")?.addEventListener("click", () => {
  const score = document.getElementById("finalScore")?.textContent || "unknown";
  const total = document.getElementById("totalQuestions")?.textContent || "unknown";
  const shareData = {
    title: "My Quiz Score!",
    text: `I scored ${score}/${total} on the Gaming Quiz! Think you can beat me?`,
    url: window.location.origin || document.location.href
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log("Shared successfully"))
      .catch((err) => console.error("Share failed", err));
  } else {
    alert("Sharing is not supported on this device. Copy the link manually.");
  }
});

});