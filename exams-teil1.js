// ========== Globale Variablen ==========
let quizData = [];
let frageListe = [];
let currentQ = 0;
let userScore = 0;
let timerInterval = null;
let timeLeft = 30 * 60; // 30 Minuten

// Proportionen wie Bild
const anzahlProSachgebiet = [
  { sachgebiet: "Recht",                 count: 12 },
  { sachgebiet: "Kaufmännische und finanzielle Führung des Betriebes", count: 24 },
  { sachgebiet: "Technischer Betrieb und Betriebsdurchführung",        count: 9 },
  { sachgebiet: "Straßenverkehrssicherheit, Unfallverhütung, Umwelt",  count: 9 },
  { sachgebiet: "Grenzüberschreitende Personenbeförderung",            count: 6 }
];

// ========== Utility ==========
function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function decodeHTML(html) {
  let e = document.createElement('textarea');
  e.innerHTML = html;
  return e.value;
}
function startTimer() {
  timeLeft = 30 * 60;
  showTimer();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    showTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResult();
    }
  }, 1000);
}
function showTimer() {
  const el = document.getElementById('timer');
  if (!el) return;
  let min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  let sec = (timeLeft % 60).toString().padStart(2, '0');
  el.innerText = `Verbleibende Zeit: ${min}:${sec}`;
}
function goBackQuiz() {
  window.location.reload();
}

// ========== Daten laden und Fragepool erzeugen ==========
async function loadQuiz() {
  let data = await fetch("Exams-Teil1.json").then(r => r.json());
  quizData = [];
  for (let block of data) {
    // Falls Sachgebiet als Schlüssel
    if (block.sachgebiet) {
      quizData.push(block);
    } else {
      // Falls es ein Objekt mit verschiedenen Sachgebieten ist
      for (let sg in block) {
        block[sg].forEach(q => quizData.push({
          sachgebiet: sg,
          subthema: q.subthema || "",
          fragen: q.fragen || [q]
        }));
      }
    }
  }
  frageListe = assembleQuestions();
}

// Proportionale Auswahl nach Gewichtung
function assembleQuestions() {
  let result = [];
  anzahlProSachgebiet.forEach(sg => {
    // Fragen sammeln aus allen Subthemen dieses Sachgebietes
    let allQs = [];
    quizData.filter(qb => qb.sachgebiet === sg.sachgebiet).forEach(qb => {
      if (qb.fragen) allQs = allQs.concat(qb.fragen);
    });
    // Shuffle & Pick passende Anzahl
    result = result.concat(shuffle(allQs).slice(0, sg.count));
  });
  // Reihenfolge shuffeln (optionale)
  return shuffle(result).slice(0, 60);
}

// ========== QUIZ Ablauf ==========
function startQuiz() {
  currentQ = 0;
  userScore = 0;
  document.getElementById('quiz-menu').style.display = "none";
  document.getElementById('quiz-container').style.display = "block";
  document.getElementById('backBtn').style.display = "block";
  startTimer();
  showFrage();
}
function showFrage() {
  if (currentQ >= frageListe.length) return showResult();
  let q = frageListe[currentQ];
  let allOpts = shuffle(q.optionen.map((opt, i) => ({ txt: opt, idx: i })));
  let html = `
    <div class="quiz-container">
      <div class="quiz-question">
        Frage ${currentQ+1} von ${frageListe.length}: ${decodeHTML(q.frage)}
      </div>
      <div class="quiz-answers">
        ${allOpts.map(opt => `
          <button class="quiz-opt" data-idx="${opt.idx}">${decodeHTML(opt.txt)}</button>
        `).join('')}
      </div>
      <div id="feedback"></div>
      <button id="nextBtn" class="back-btn" style="display:none;">Nächste Frage</button>
    </div>
  `;
  document.getElementById('quiz-container').innerHTML = html;
  let locked = false;
  document.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', function() {
      if (locked) return;
      locked = true;
      document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
      let idx = parseInt(this.getAttribute('data-idx'));
      let correct = (idx === q.richtigeAntwort);
      if (correct) {
        userScore += (q.punkte || 1);
        this.classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback">Richtig! ${q.erklaerung || ''}</div>`;
      } else {
        this.classList.add('wrong');
        let cIdx = allOpts.findIndex(o=>o.idx===q.richtigeAntwort);
        document.querySelectorAll('.quiz-opt')[cIdx].classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback incorrect">Falsch. Die richtige Antwort: ${decodeHTML(q.optionen[q.richtigeAntwort])}<br>${q.erklaerung || ''}</div>`;
      }
      document.getElementById('nextBtn').style.display = "block";
    });
  });
  document.getElementById('nextBtn').onclick = function() {
    currentQ++;
    showFrage();
  };
}

// ========== Ergebnis ==========
function showResult() {
  clearInterval(timerInterval);
  let correct = userScore;
  let total = frageListe.length;
  let html = `
    <div class="result-summary">
      <h2>Test abgeschlossen!</h2>
      <p>Sie haben <b>${correct}</b> von <b>${total}</b> möglichen Punkten erreicht.</p>
      <p>Richtige Antworten: <b>${correct}</b></p>
      <p>Falsche Antworten: <b>${total - correct}</b></p>
      <button class="back-btn" onclick="goBackQuiz()">Zurück zum Menü</button>
    </div>
  `;
  document.getElementById('quiz-container').innerHTML = html;
}

// ========== INIT ==========
window.onload = async function() {
  await loadQuiz();
  document.getElementById('startBtn').onclick = startQuiz;
  document.getElementById('backBtn').onclick = goBackQuiz;
};