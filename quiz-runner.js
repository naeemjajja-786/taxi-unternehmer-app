function $(id) {
  return document.getElementById(id);
}

window.onload = function () {
  // Determine which quiz to run based on the page (musterpruefung vs test)
  const file = window.location.pathname.includes("musterpruefung") 
               ? "Exams-30-Muster.json" 
               : "Quiz-gesamt.json";
  const isExam = file.includes("Muster");  // true for Musterprüfung (exam mode)
  startQuiz(file, isExam);
};

let currentQuiz = [];
let currentQuestion = 0;
let score = 0;
let quizAnswers = [];   // to store answers in exam mode for review
let examMode = false;

function startQuiz(file, isExam = false) {
  examMode = isExam;
  $("dynamic-content").innerHTML = "📄 Quiz wird geladen...";
  fetch(file)
    .then(r => r.json())
    .then(data => {
      currentQuiz = Array.isArray(data) ? data : (data.questions || []);
      // Randomize questions and limit to 30 if exam mode
      currentQuiz = currentQuiz.sort(() => Math.random() - 0.5);
      if (isExam) {
        currentQuiz = currentQuiz.slice(0, 30);
      }
      currentQuestion = 0;
      score = 0;
      quizAnswers = [];
      showQuizQuestion();
    })
    .catch(() => {
      $("dynamic-content").innerHTML = "❌ Quiz konnte nicht geladen werden.";
    });
}

function showQuizQuestion() {
  if (currentQuestion >= currentQuiz.length) {
    // Finished all questions
    return showQuizResult();
  }
  const q = currentQuiz[currentQuestion];
  let html = `<div class="question-box">
      <div class="frage">${currentQuestion + 1}. ${q.question}</div>
      <div>`;
  // Generate answer option buttons
  Object.entries(q.options).forEach(([key, val]) => {
    html += `<button class="quiz-option" onclick="selectQuizOption('${key}')">${key}: ${val}</button>`;
  });
  html += `</div>`;
  if (!examMode) {
    // Provide a feedback area for self-test mode
    html += `<div id="quiz-feedback"></div>`;
  }
  // Back button returns to main menu (no intermediate topics for test/exam)
  html += `<br><button class="back-btn" onclick="window.location.href='index.html'">Zurück zum Hauptmenü</button>
    </div>`;
  $("dynamic-content").innerHTML = html;
}

function selectQuizOption(opt) {
  const q = currentQuiz[currentQuestion];
  // Disable all options after selection
  Array.from(document.getElementsByClassName("quiz-option")).forEach(btn => btn.disabled = true);
  const correct = (opt === q.correctAnswer);
  if (!examMode) {
    // Selbsttest mode: show immediate feedback and then move on
    const feedbackDiv = $("quiz-feedback");
    if (correct) {
      score++;
      markOption(opt, "correct");
      feedbackDiv.innerHTML = `<div class="explanation">✅ Richtig!<br>${q.explanation || ""}</div>
                               <div class="hinweis">${q.trickHint || ""}</div>`;
    } else {
      markOption(opt, "incorrect");
      markOption(q.correctAnswer, "correct");
      feedbackDiv.innerHTML = `<div class="explanation">❌ Falsch.<br>${q.explanation || ""}</div>
                               <div class="hinweis">${q.trickHint || ""}</div>`;
    }
    // Proceed to next question after a brief delay
    setTimeout(() => {
      currentQuestion++;
      showQuizQuestion();
    }, 1800);
  } else {
    // Prüfungssimulation mode: record answer and proceed without feedback
    quizAnswers.push({ picked: opt, correct: q.correctAnswer });
    if (correct) {
      score++;
    }
    currentQuestion++;
    showQuizQuestion();
  }
}

function markOption(opt, className) {
  const buttons = Array.from(document.getElementsByClassName("quiz-option"));
  buttons.forEach(btn => {
    if (btn.textContent.startsWith(opt + ":")) {
      btn.classList.add(className);
    }
  });
}

function showQuizResult() {
  // Show final score
  let html = `<div class="card"><h3>Quiz beendet!</h3>
      <p>Punkte: <strong>${score}</strong> von <strong>${currentQuiz.length}</strong></p>`;
  if (examMode) {
    // In exam mode, list each question result for review
    html += "<ul>";
    quizAnswers.forEach((a, i) => {
      const wasCorrect = (a.picked === a.correct);
      html += `<li>Frage ${i + 1}: ${wasCorrect ? "✅" : "❌"} (Deine Antwort: ${a.picked} – Richtig: ${a.correct})</li>`;
    });
    html += "</ul>";
  }
  html += `<br><button class="back-btn" onclick="window.location.href='index.html'">Zurück zum Hauptmenü</button></div>`;
  $("dynamic-content").innerHTML = html;
}
