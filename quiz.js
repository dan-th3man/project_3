(() => {
  let selectedQuestionCount = 10;
  let allQuestions = [];
  let questions = [];
  let currentIndex = 0;
  let questionTimer;
  let quizActive = false;
  const timeLimit = 20;
  const answers = [];

  // Helper to decode HTML entities from OpenTDB
  function decode(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  // Questions fetch here
  function fetchQuestions() {
    const API_KEY = `https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple`;

    return fetch(API_KEY)
      .then(res => res.json())
      .then(data => {
        allQuestions = data.results.map((q) => {
          const answers = [q.correct_answer, ...q.incorrect_answers].sort(() => Math.random() - 0.5);
          const answerLabels = ["A", "B", "C", "D"];
          const answerObj = {};
          answers.forEach((answer, i) => answerObj[answerLabels[i]] = decode(answer));

          const correctLabel = answerLabels[answers.indexOf(q.correct_answer)];

          return {
            question: decode(q.question),
            ...answerObj,
            answer: correctLabel
          };
        });
      })
      .catch(err => {
        console.error("Error fetching quiz questions:", err);
        alert("Failed to load quiz questions. Please try again later.");
      });
  }

  function startQuiz() {
  // Hide all pages except quizPage
  document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
  document.getElementById("quizPage")?.classList.remove("d-none");

  // Reset quiz state
  questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, selectedQuestionCount);
  currentIndex = 0;
  answers.length = 0;

  // Clear any previous timer
  clearInterval(questionTimer);
  quizActive = false;

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
  // Always clear any previous timer before starting a new one
  clearInterval(questionTimer);
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

  // Reveal the correct answer
  options.forEach((input) => {
    const label = input.parentElement;
    if (input.value === q.answer) {
      label.style.backgroundColor = "#39ff14";
      label.style.border = "2px solid green";
      label.style.color = "#000";
    }
  });

  // Mark this question as unanswered (no point)
  answers[currentIndex] = null;

  // Move to the next question after a short delay
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < questions.length) {
      renderQuestion();
    } else {
      submitQuiz();
    }
  }, 1000); // 1 second delay to show the correct answer
}

  function highlightAnswers(selectedInput, correctAnswer) {
    const options = document.querySelectorAll(`input[name="answer-${currentIndex}"]`);
    options.forEach((input) => {
      const label = input.parentElement;
      label.style.backgroundColor = "";
      label.style.border = "";
      label.style.borderRadius = "5px";

      if (input.value === correctAnswer) {
        label.style.backgroundColor = "#39ff14";
        label.style.border = "2px solid green";
        label.style.color = "#000";
      } else if (input === selectedInput) {
        label.style.backgroundColor = "#ff1744";
        label.style.border = "2px solid #ff1744";
        label.style.color = "#fff";
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

    const userObj = JSON.parse(currentUser);

    fetch("/submit-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: userObj.username, answers, score })
    })
      .then((res) => res.json())
      .then(() => {
        document.getElementById("finalScore").textContent = score;
        document.getElementById("totalQuestions").textContent = questions.length;

        fetch(`/leaderboard/${userObj.username}`)
          .then((res) => res.json())
          .then(({ top10, rank }) => {
            const list = document.getElementById("leaderboardList");
            list.innerHTML = "";

            top10.forEach((entry) => {
              const li = document.createElement("li");
              li.textContent = `${entry.username}: ${entry.score}`;
              list.appendChild(li);
            });

            const rankInfo = document.createElement("p");
            rankInfo.textContent = `Your Global Rank: #${rank}`;
            list.appendChild(rankInfo);
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

        // ✅ Update user score history on account page
        if (window.loadAccountInfo) {
          window.loadAccountInfo();
        }
      })
      .catch((err) => console.error("Quiz submit error:", err));
  }

  function setQuestionCount(count) {
    selectedQuestionCount = count ?? allQuestions.length;
  }

window.quizModule = {
  fetchQuestions,
  startQuiz,
  setQuestionCount,
  get questionTimer() {
    return questionTimer;
  },
  clearTimer() {
    clearInterval(questionTimer);
    questionTimer = null;
    quizActive = false;
  }
};

})();

// Global restart function for leaderboard button
window.restartQuiz = () => {
  // Hide result and quiz pages
  document.getElementById("resultPage")?.classList.add("d-none");
  document.getElementById("quizPage")?.classList.add("d-none");

  // Show rules page only (not quiz page)
  document.getElementById("rulesPage")?.classList.remove("d-none");

  // Clear quiz display content
  const quizContainer = document.getElementById("quiz");
  if (quizContainer) quizContainer.innerHTML = "";
};