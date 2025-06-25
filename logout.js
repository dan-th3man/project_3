document.addEventListener("DOMContentLoaded", () => {
  const logoutQuizBtn = document.getElementById("logoutFromQuiz");
  const logoutResultBtn = document.getElementById("logoutFromResult");

  const logoutAction = () => {
    localStorage.removeItem("currentUser");
    location.reload();
  };

  if (logoutQuizBtn) {
    logoutQuizBtn.addEventListener("click", logoutAction);
  }
  if (logoutResultBtn) {
    logoutResultBtn.addEventListener("click", logoutAction);
  }
});
