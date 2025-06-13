// ----------- THEMENQUIZ.JS -------------
// Alle Topic-Quiz-Files (JSON) bleiben unverändert
const quizTopics = [
  {file: "Quiz-arbeitsrecht.json", label: "Arbeitsrecht"},
  {file: "Quiz-Befördungsverhalten.json", label: "Beförderungsverhalten"},
  {file: "Quiz-Buchführung.json", label: "Buchführung"},
  {file: "Quiz-Datenshutzrecht.json", label: "Datenschutzrecht"},
  {file: "Quiz-gewerberecht.json", label: "Gewerberecht"},
  {file: "Quiz-handelrecht.json", label: "Handelsrecht"},
  {file: "Quiz-kaufmaennisch.json", label: "Kaufmännisch/Finanzen"},
  {file: "Quiz-kostenrechnung.json", label: "Kostenrechnung"},
  {file: "Quiz-marketing.json", label: "Marketing"},
  {file: "Quiz-mietwagen.json", label: "Mietwagen"},
  {file: "Quiz-personenbefoerderung.json", label: "Personenbeförderung"},
  {file: "Quiz-Sonderrecht.json", label: "Sonderrecht"},
  {file: "Quiz-Steuerrecht.json", label: "Steuerrecht"},
  {file: "Quiz-strassenverkehrsrecht.json", label: "Straßenverkehrsrecht"},
  {file: "Quiz-technische_normen.json", label: "Technische Normen"},
  {file: "Quiz-Umweltschutz.json", label: "Umweltschutz"},
  {file: "Quiz-versicherungswesen.json", label: "Versicherungswesen"},
  {file: "Quiz_Sozialrecht.json", label: "Sozialrecht"},
  {file: "Quiz-auslandrecht.json", label: "Auslandsrecht"}
];

const topicSelect = document.getElementById("topic-select");
const quizArea = document.getElementById("quiz-area");
const backBtnTQ = document.getElementById("backBtnTQ");

let currentQuiz = null;
let currentQ = 0;
let userAnswers = [];

// ---------- Zwei-Spalten Topics anzeigen
function renderTopicButtons() {
  quizArea.style.display = "none";
  backBtnTQ.style.display = "none";
  topicSelect.innerHTML = "<h2>Wähle ein Thema:</h2>";
  let container = document.createElement("div");
  container.className = "topic-grid";
  quizTopics.forEach((topic, i) => {
    let btn = document.createElement("button");
    btn.className = "chapter-btn";
    btn.textContent = topic.label;
    btn.onclick = () => loadTopicQuiz(topic.file, topic.label);
    container.appendChild(btn);
  });
  topicSelect.appendChild(container);
}

// ----------- Quiz laden (aus JSON) + Start
function loadTopicQuiz(jsonFile, topicLabel) {
  fetch(`./${jsonFile}`)
    .then(r => r.json())
    .then(data => {
      // Shuffle questions (min 5, max 20 per topic)
      let questions = data.slice();
      for (let i = questions.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      if (questions.length > 20) questions = questions.slice(0, 20);
      else if (questions.length < 5) questions = questions.slice(0, questions.length);

      currentQuiz = questions;
      currentQ = 0;
      userAnswers = [];
      topicSelect.innerHTML = "";
      quizArea.style.display = "";
      backBtnTQ.style.display = "";
      showQuestion(topicLabel);
    })
    .catch(e => {
      quizArea.innerHTML = "<div style='color:red'>Fehler beim Laden des Quiz.</div>";
    });
}

// ----------- Einzelne Quizfrage anzeigen
function showQuestion(topicLabel) {
  let qObj = currentQuiz[currentQ];
  quizArea.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-question"><b>${topicLabel}:</b> ${qObj.frage}</div>
      <div class="quiz-answers" id="answers"></div>
      <div id="quiz-feedback"></div>
    </div>
  `;

  const answersDiv = document.getElementById("answers");
  qObj.antworten.forEach((ans, i) => {
    let btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(i, qObj);
    answersDiv.appendChild(btn);
  });
}

// ----------- Antwort prüfen + Feedback zeigen
function checkAnswer(i, qObj) {
  const answersDiv = document.getElementById("answers");
  Array.from(answersDiv.children).forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === i) btn.classList.add(i === qObj.richtigeAntwort ? "correct" : "wrong");
    if (idx === qObj.richtigeAntwort && i !== qObj.richtigeAntwort) btn.classList.add("correct");
  });

  let isCorrect = i === qObj.richtigeAntwort;
  userAnswers.push({q: qObj.frage, correct: isCorrect});
  let feedback = document.getElementById("quiz-feedback");
  feedback.className = "quiz-feedback" + (isCorrect ? "" : " incorrect");
  feedback.innerHTML = isCorrect
    ? "Richtig!<br>" + (qObj.erklaerung ? `<span>${qObj.erklaerung}</span>` : "")
    : "Falsch.<br>" + (qObj.erklaerung ? `<span>${qObj.erklaerung}</span>` : "");

  // Nächste Frage/Nächster Schritt Button
  let navBtns = document.createElement("div");
  navBtns.className = "quiz-nav-btns";
  let nextBtn = document.createElement("button");
  nextBtn.textContent = currentQ + 1 < currentQuiz.length ? "Nächste Frage" : "Quiz beenden";
  nextBtn.onclick = () => {
    if (currentQ + 1 < currentQuiz.length) {
      currentQ++;
      showQuestion(qObj.topic || "");
    } else {
      showQuizResult();
    }
  };
  navBtns.appendChild(nextBtn);
  feedback.appendChild(navBtns);
}

// ----------- Quiz-Resultat/Statistik zeigen
function showQuizResult() {
  let correct = userAnswers.filter(a => a.correct).length;
  let total = currentQuiz.length;
  quizArea.innerHTML = `
    <div class="result-summary">
      <h2>Quiz beendet!</h2>
      <div>Richtige Antworten: <b>${correct}</b> von <b>${total}</b></div>
      <button onclick="renderTopicButtons()" class="back-btn" style="margin-top:2rem;">Zurück zu den Themen</button>
    </div>
  `;
  backBtnTQ.style.display = "";
}

// ----------- Back-Button/Zurück
function goBackThemenQuiz() {
  quizArea.style.display = "none";
  backBtnTQ.style.display = "none";
  renderTopicButtons();
}
window.goBackThemenQuiz = goBackThemenQuiz;

// ----------- Initialisierung
renderTopicButtons();
