// ------- musterpruefung.js (Teil 1 full, Teil 2 template) -------

// Element refs
const examMenu = document.getElementById('exam-menu');
const teil1Container = document.getElementById('teil1-container');
const teil2Container = document.getElementById('teil2-container');
const backBtn = document.getElementById('backBtn');
const timerDiv = document.getElementById('timer');

// --- Exam state vars ---
let teil1Questions = [], examQuestions = [], teil2Data = [];
let currentIdx = 0, userAnswers = [], score = 0, maxPunkte = 0;
let timer = null, timeLeft = 3600;

// --- Exam menu handlers ---
document.getElementById('start-teil1').onclick = async function() {
  examMenu.style.display = 'none';
  teil1Container.style.display = '';
  teil2Container.style.display = 'none';
  backBtn.style.display = '';
  userAnswers = [];
  currentIdx = 0;
  score = 0;
  timeLeft = 3600;
  timerDiv.innerText = '';
  startTimer();

  // Load JSON, flatten all topic blocks
  const res = await fetch('Exams-Teil1.json');
  const data = await res.json();
  teil1Questions = [];
  data.forEach(block => {
    if (Array.isArray(block)) {
      block.forEach(item => teil1Questions.push(item));
    } else if (typeof block === 'object') {
      Object.values(block).forEach(arr => {
        if (Array.isArray(arr)) arr.forEach(item => teil1Questions.push(item));
      });
    }
  });
  // Pick 25 random questions for exam
  examQuestions = shuffle(teil1Questions).slice(0, 25);
  maxPunkte = examQuestions.reduce((acc, q) => acc + (q.punkte || 1), 0);
  renderQuestionTeil1();
};

document.getElementById('start-teil2').onclick = async function() {
  examMenu.style.display = 'none';
  teil1Container.style.display = 'none';
  teil2Container.style.display = '';
  backBtn.style.display = '';
  timeLeft = 3600;
  timerDiv.innerText = '';
  startTimer();
  // You can load your Teil2 logic here, for now just a placeholder
  teil2Container.innerHTML = `<div class="result-summary">Teil 2 ist in Bearbeitung.</div>`;
};

// --- Timer logic ---
function startTimer() {
  timerDiv.style.display = '';
  showTimer();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (--timeLeft <= 0) {
      clearInterval(timer);
      timerDiv.innerText = 'Zeit abgelaufen!';
      if (teil1Container.style.display !== 'none') showExamResultTeil1();
      if (teil2Container.style.display !== 'none') showExamResultTeil2();
    } else {
      showTimer();
    }
  }, 1000);
}
function showTimer() {
  let min = Math.floor(timeLeft/60), sec = timeLeft%60;
  timerDiv.innerText = `Verbleibende Zeit: ${min}:${sec.toString().padStart(2,'0')}`;
}

// --- Question rendering ---
function renderQuestionTeil1() {
  teil1Container.innerHTML = '';
  if (currentIdx >= examQuestions.length) {
    showExamResultTeil1();
    return;
  }
  const q = examQuestions[currentIdx];
  // shuffle options
  let options = q.optionen.map((text, i) => ({ text, idx: i }));
  options = shuffle(options);

  let html = `<div class="quiz-question"><b>Frage ${currentIdx+1} von ${examQuestions.length}:</b> ${q.frage}</div>
    <div class="quiz-answers">`;
  options.forEach(opt => {
    html += `<button onclick="answerTeil1(${opt.idx}, this)">${opt.text}</button>`;
  });
  html += `</div>
    <div id="feedback"></div>`;
  teil1Container.innerHTML = html;
}

// --- Antwort prüfen ---
window.answerTeil1 = function(answerIdx, btn) {
  const q = examQuestions[currentIdx];
  const isCorrect = (answerIdx === q.richtigeAntwort);
  userAnswers.push({
    user: answerIdx,
    correct: q.richtigeAntwort,
    punkte: isCorrect ? (q.punkte || 1) : 0
  });
  score += isCorrect ? (q.punkte || 1) : 0;
  Array.from(document.querySelectorAll('.quiz-answers button')).forEach(b => b.disabled = true);
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  document.getElementById('feedback').innerHTML = `
    <div class="quiz-feedback ${isCorrect ? '' : 'incorrect'}">
      ${isCorrect ? 'Richtig!' : 'Falsch!'}<br>
      <b>Erklärung:</b> ${q.erklaerung}
    </div>
    <button class="fs-show-btn" onclick="nextTeil1()">Nächste Frage</button>
  `;
};

window.nextTeil1 = function() {
  currentIdx++;
  renderQuestionTeil1();
};

function showExamResultTeil1() {
  clearInterval(timer);
  teil1Container.innerHTML = `
    <div class="result-summary">
      <b>Ergebnis:</b> ${score} / ${maxPunkte} Punkte<br>
      <button class="back-btn" onclick="goBackExam()">Zurück zum Menü</button>
    </div>`;
}

// --- Go back logic ---
window.goBackExam = function() {
  clearInterval(timer);
  teil1Container.style.display = 'none';
  teil2Container.style.display = 'none';
  examMenu.style.display = '';
  backBtn.style.display = 'none';
  timerDiv.innerText = '';
};

// --- Hilfsfunktionen ---
function shuffle(arr) {
  return arr.map(v => [v, Math.random()]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);
}