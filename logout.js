document.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = [
    document.getElementById("logoutFromQuiz"),
    document.getElementById("logoutFromResult"),
    document.getElementById("logoutFromAccount")
  ];

  const logoutAction = () => {
    localStorage.removeItem("currentUser");

    // Stop quiz timer if running
    if (window.quizModule?.clearTimer) {
      window.quizModule.clearTimer();
    }

    // Stop and reset all quiz sounds
    ["correctSound", "incorrectSound", "cheerSound", "booSound"].forEach(id => {
      const sound = document.getElementById(id);
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => page.classList.add("d-none"));

    // Show home page
    document.getElementById("homePage").classList.remove("d-none");
  };

  logoutButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", logoutAction);
    }
  });
});
