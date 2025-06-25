(() => {
  let selectedQuestionCount = 10;
  let allQuestions = [];
  let questions = [];
  let currentIndex = 0;
  let questionTimer;
  let quizActive = false;
  const timeLimit = 20;
  const answers = [];

  function fetchQuestions() {
    return fetch("/questions.json")
      .then(res => res.json())
      .then(data => {
        allQuestions = data;
      })
      .catch(err => {
        console.error("Error fetching quiz questions:", err);
        alert("Failed to load quiz questions. Please try again later.");
      });
  }

  function startQuiz() {
    questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, selectedQuestionCount);
    currentIndex = 0;
    answers.length = 0;
    renderQuestion();
  }

  function renderQuestion() {
    const container = document.getElementById("quiz");
    container.innerHTML = "";

    if (currentIndex < questions.length) {
      const q = questions[currentIndex];
      const div = document.createElement("div");
      div.className = "question active";

      const p = document.createElement("p");
      p.textContent = `${currentIndex + 1}. ${q.question}`;
      div.appendChild(p);

      const options = ["A", "B", "C", "D"];
      options.forEach((option) => {
        if (q[option]) {
          const label = document.createElement("label");
          label.className = "d-block text-start ps-0 mb-2";

          const input = document.createElement("input");
          input.type = "radio";
          input.name = `answer-${currentIndex}`;
          input.value = option;
          input.className = "me-2";

          input.addEventListener("change", () => {
            saveAnswer();
            handleAnswerSelection(input, q);
          });

          label.appendChild(input);
          label.append(`${option}: ${q[option]}`);
          div.appendChild(label);
        }
      });

      container.appendChild(div);
      startTimer();
    }
  }

  function startTimer() {
    if (quizActive) return;
    quizActive = true;
    let timeRemaining = timeLimit;
    const timerDisplay = document.getElementById("timer");
    timerDisplay.textContent = `Time left: ${timeRemaining}s`;

    questionTimer = setInterval(() => {
      timeRemaining--;
      timerDisplay.textContent = `Time left: ${timeRemaining}s`;
      if (timeRemaining <= 0) {
        clearInterval(questionTimer);
        quizActive = false;
        handleTimeout();
      }
    }, 1000);
  }

  function handleAnswerSelection(selectedInput, question) {
    clearInterval(questionTimer);
    quizActive = false;

    if (selectedInput.value === question.answer) {
      document.getElementById("correctSound")?.play();
    } else {
      document.getElementById("incorrectSound")?.play();
    }

    highlightAnswers(selectedInput, question.answer);

    setTimeout(() => {
      currentIndex++;
      if (currentIndex < questions.length) {
        renderQuestion();
      } else {
        submitQuiz();
      }
    }, 1000);
  }

  function handleTimeout() {
    clearInterval(questionTimer);
    quizActive = false;

    const q = questions[currentIndex];
    const options = document.querySelectorAll(`input[name="answer-${currentIndex}"]`);

    document.getElementById("incorrectSound")?.play();

    options.forEach((input) => {
      const label = input.parentElement;
      if (input.value === q.answer) {
        label.style.backgroundColor = "rgba(0, 255, 0, 0.3)";
        label.style.border = "2px solid green";
      }
    });

    setTimeout(() => {
      currentIndex++;
      if (currentIndex < questions.length) {
        renderQuestion();
      } else {
        submitQuiz();
      }
    }, 1000);
  }

  function highlightAnswers(selectedInput, correctAnswer) {
    const options = document.querySelectorAll(`input[name="answer-${currentIndex}"]`);
    options.forEach((input) => {
      const label = input.parentElement;
      label.style.backgroundColor = "";
      label.style.border = "";
      label.style.borderRadius = "5px";

      if (input.value === correctAnswer) {
        label.style.backgroundColor = "rgba(0, 255, 0, 0.3)";
        label.style.border = "2px solid green";
      } else if (input === selectedInput) {
        label.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
        label.style.border = "2px solid red";
      }
    });
  }

  function saveAnswer() {
    const selected = document.querySelector(`input[name="answer-${currentIndex}"]:checked`);
    answers[currentIndex] = selected ? selected.value : null;
  }

  function submitQuiz() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      alert("Please log in before submitting the quiz.");
      return;
    }

    clearInterval(questionTimer);
    saveAnswer();

    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].answer) {
        score += 1;
      }
    }

    fetch("/submit-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, answers, score })
    })
      .then((res) => res.json())
      .then(() => {
        document.getElementById("finalScore").textContent = score;
        document.getElementById("totalQuestions").textContent = questions.length;

        fetch("/leaderboard")
          .then((res) => res.json())
          .then((leaderboard) => {
            const list = document.getElementById("leaderboardList");
            list.innerHTML = "";

            leaderboard.forEach((entry) => {
              const li = document.createElement("li");
              li.textContent = `${entry.username}: ${entry.score}`;
              list.appendChild(li);
            });
          })
          .catch((err) => console.error("Leaderboard fetch error:", err));

        const cheerSound = document.getElementById("cheerSound");
        const booSound = document.getElementById("booSound");

        if (score >= questions.length / 2) {
          cheerSound?.play();
        } else {
          booSound?.play();
        }

        document.getElementById("quizPage").classList.add("d-none");
        document.getElementById("resultPage").classList.remove("d-none");
      })
      .catch((err) => console.error("Quiz submit error:", err));
  }

  function setQuestionCount(count) {
    selectedQuestionCount = count ?? allQuestions.length;
  }

  window.quizModule = {
    fetchQuestions,
    startQuiz,
    setQuestionCount
  };
})();

// Global restart function for leaderboard button
window.restartQuiz = () => {
  // Hide result and quiz pages
  document.getElementById("resultPage")?.classList.add("d-none");
  document.getElementById("quizPage")?.classList.add("d-none");

  // Show question selection
  document.getElementById("questionCountPage")?.classList.remove("d-none");

  // Clear quiz display content
  const quizContainer = document.getElementById("quiz");
  if (quizContainer) quizContainer.innerHTML = "";

  // Re-fetch questions to reinitialize state
  if (window.quizModule?.fetchQuestions) {
    window.quizModule.fetchQuestions();
  }
};
