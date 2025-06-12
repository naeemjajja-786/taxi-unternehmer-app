function $(id) {
  return document.getElementById(id);
}

window.onload = function () {
  renderQuizMenu();
};

// All quiz files for topic-wise quizzes (file paths and display names)
const quizFiles = [
  { file: "Quiz-Buchführung.json", name: "Buchführung" },
  { file: "Quiz-Datenshutzrecht.json", name: "Datenschutzrecht" },
  { file: "Quiz_Sozialrecht.json", name: "Sozialrecht" },
  { file: "Quiz-marketing.json", name: "Marketing" },
  { file: "Quiz-strassenverkehrsrecht.json", name: "Straßenverkehrsrecht" },
  { file: "Quiz-kostenrechnung.json", name: "Kostenrechnung" },
  { file: "Quiz-mietwagen.json", name: "Mietwagen" },
  { file: "Quiz-versicherungswesen.json", name: "Versicherungswesen" },
  { file: "Quiz_personenbefoerderung.json", name: "Personenbeförderung" },
  { file: "Quiz-kaufmaennisch.json", name: "Kaufmännisch" },
  { file: "Quiz-gewerberecht.json", name: "Gewerberecht" },
  { file: "Quiz-handelrecht.json", name: "Handelsrecht" },
  { file: "Quiz-arbeitsrecht.json", name: "Arbeitsrecht" },
  { file: "Quiz-auslandrecht.json", name: "Auslandrecht" },
  { file: "Quiz-Steuerrecht.json", name: "Steuerrecht" },
  { file: "Quiz-technische_normen.json", name: "Technische Normen" },
  { file: "Quiz-Sonderrecht.json", name: "Sonderrecht" },
  { file: "Quiz-Umweltschutz.json", name: "Umweltschutz" },
  { file: "Quiz-Befördungsverhalten.json", name: "Beförderungsverhalten" }
];

// Render the quiz topics selection menu
function renderQuizMenu() {
  const area = $("dynamic-content");
  let html = `<h2>Quiz Themen auswählen:</h2>
    <div style="display:flex; flex-wrap: wrap; gap:10px;">`;
  quizFiles.forEach(q => {
    html += `<button class="quiz-btn" style="flex:1 1 48%;" onclick="startQuiz('${q.file}')">${q.name}</button>`;
  });
  html += `</div>
    <br><button class="back-btn" onclick="window.location.href='index.html'">← Zurück zum Hauptmenü</button>`;
  area.innerHTML = html;
}

// Quiz state variables
let currentQuiz = [];
let currentQuestion = 0;
let score = 0;

// Start a quiz by loading questions from the chosen JSON file
function startQuiz(file) {
  $("dynamic-content").innerHTML = "📄 Quiz wird geladen...";
  fetch(file)
    .then(r => r.json())
    .then(data => {
      currentQuiz = Array.isArray(data) ? data : (data.questions || []);
      // Randomize question order for variety
      currentQuiz = currentQuiz.sort(() => Math.random() - 0.5);
      currentQuestion = 0;
      score = 0;
      showQuizQuestion();
    })
    .catch(() => {
      $("dynamic-content").innerHTML = "❌ Quiz konnte nicht geladen werden.";
    });
}

// Display the current question and options
function showQuizQuestion() {
  if (currentQuestion >= currentQuiz.length) {
    // All questions done, show result
    return showQuizResult();
  }
  const q = currentQuiz[currentQuestion];
  let html = `<div class="question-box">
      <div class="frage">${currentQuestion + 1}. ${q.question}</div>
      <div>`;
  // Create a button for each answer option
  Object.entries(q.options).forEach(([key, val]) => {
    html += `<button class="quiz-option" onclick="selectQuizOption('${key}')">${key}: ${val}</button>`;
  });
  html += `</div>
      <div id="quiz-feedback"></div>
      <br><button class="back-btn" onclick="renderQuizMenu()">Zurück zur Themenauswahl</button>
    </div>`;
  $("dynamic-content").innerHTML = html;
}

// Handle an answer selection
function selectQuizOption(opt) {
  const q = currentQuiz[currentQuestion];
  // Disable all options after one is selected
  Array.from(document.getElementsByClassName("quiz-option")).forEach(btn => btn.disabled = true);
  const correct = (opt === q.correctAnswer);
  const feedback = $("quiz-feedback");
  if (correct) {
    score++;
    markOption(opt, "correct");
    feedback.innerHTML = `<div class="explanation">✅ Richtig!<br>${q.explanation || ""}</div>
                          <div class="hinweis">${q.trickHint || ""}</div>`;
  } else {
    markOption(opt, "incorrect");
    markOption(q.correctAnswer, "correct");
    feedback.innerHTML = `<div class="explanation">❌ Leider falsch.<br>${q.explanation || ""}</div>
                          <div class="hinweis">${q.trickHint || ""}</div>`;
  }
  // Move to the next question after a brief delay to show feedback
  setTimeout(() => {
    currentQuestion++;
    showQuizQuestion();
  }, 1800);
}

// Highlight the chosen option and correct answer
function markOption(opt, className) {
  const options = Array.from(document.getElementsByClassName("quiz-option"));
  options.forEach(btn => {
    if (btn.textContent.startsWith(opt + ":")) {
      btn.classList.add(className);
    }
  });
}

// Show the quiz results at the end
function showQuizResult() {
  let html = `<div class="card"><h3>Quiz beendet!</h3>
      <p>Du hast <strong>${score}</strong> von <strong>${currentQuiz.length}</strong> Punkten erreicht.</p>`;
  html += `<br><button class="back-btn" onclick="renderQuizMenu()">Zurück zur Themenauswahl</button></div>`;
  $("dynamic-content").innerHTML = html;
}
