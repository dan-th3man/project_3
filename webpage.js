document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtnHome")?.addEventListener("click", () => {
    document.getElementById("homePage").classList.add("d-none");
    document.getElementById("loginPage").classList.remove("d-none");
  });

  document.getElementById("signupBtnHome")?.addEventListener("click", () => {
    document.getElementById("homePage").classList.add("d-none");
    document.getElementById("signupPage").classList.remove("d-none");
  });

  document.getElementById("backToSignupFromLogin")?.addEventListener("click", () => {
    document.getElementById("loginPage").classList.add("d-none");
    document.getElementById("signupPage").classList.remove("d-none");
  });

  document.getElementById("backToLoginFromSignup")?.addEventListener("click", () => {
    document.getElementById("signupPage").classList.add("d-none");
    document.getElementById("loginPage").classList.remove("d-none");
  });

  document.querySelectorAll(".question-count-card").forEach(card => {
    card.addEventListener("click", () => {
      const count = card.getAttribute("data-count");
      quizModule.setQuestionCount(count === "all" ? null : parseInt(count));
      document.getElementById("questionCountPage").classList.add("d-none");
      document.getElementById("rulesPage").classList.remove("d-none");
    });
  });

  document.getElementById("startQuizBtn")?.addEventListener("click", () => {
    quizModule.fetchQuestions().then(() => {
      quizModule.startQuiz();
      document.getElementById("rulesPage").classList.add("d-none");
      document.getElementById("quizPage").classList.remove("d-none");
    });
  });
});
