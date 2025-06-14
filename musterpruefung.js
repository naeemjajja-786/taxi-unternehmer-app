// === Globale Variablen ===
let teil1Data = [];
let teil2ShortData = [];
let teil2Cases = [];
let teil1Quiz = [];
let teil2ShortQuiz = [];
let teil2CaseQuiz = null;
let currentTeil = 0;
let currentQ = 0;
let userScore = 0;
let teil2Points = 0;
let timerInterval = null;
let timeLeft = 60 * 60;

// === Utility ===
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
  timeLeft = 60 * 60;
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
function goBackExam() {
  window.location.reload();
}

// === Lade Daten ===
async function loadAllData() {
  let [teil1, teil2] = await Promise.all([
    fetch("Exams-Teil1.json").then(r => r.json()),
    fetch("Exams-Teil2.json").then(r => r.json())
  ]);
  teil1Data = [];
  for (let kap of teil1) {
    for (let key in kap) {
      teil1Data = teil1Data.concat(kap[key]);
    }
  }
  teil2ShortData = [];
  teil2Cases = [];
  for (let blk of teil2) {
    if (blk.type === "short" && Array.isArray(blk.questions)) {
      teil2ShortData = teil2ShortData.concat(blk.questions);
    }
    if (blk.type === "case" && Array.isArray(blk.cases)) {
      teil2Cases = teil2Cases.concat(blk.cases);
    }
  }
}

// === TEIL 1 ===
function startTeil1() {
  currentTeil = 1;
  userScore = 0;
  document.getElementById('exam-menu').style.display = "none";
  document.getElementById('teil1-container').style.display = "block";
  document.getElementById('teil2-container').style.display = "none";
  document.getElementById('backBtn').style.display = "block";
  teil1Quiz = shuffle(teil1Data).slice(0, 25);
  currentQ = 0;
  startTimer();
  showTeil1Frage();
}

function showTeil1Frage() {
  if (currentQ >= teil1Quiz.length) return showResult();
  let q = teil1Quiz[currentQ];
  let allOpts = shuffle(q.optionen.map((opt, i) => ({ txt: opt, idx: i })));
  let html = `
    <div class="quiz-container">
      <div class="quiz-question">
        Frage ${currentQ+1} von ${teil1Quiz.length}: ${decodeHTML(q.frage)}
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
  document.getElementById('teil1-container').innerHTML = html;

  // --- EVENTS NUR EINMAL ---
  let locked = false;
  let opts = document.querySelectorAll('#teil1-container .quiz-opt');
  opts.forEach(btn => {
    btn.addEventListener('click', function() {
      if (locked) return;
      locked = true;
      opts.forEach(b => b.disabled = true);
      let idx = parseInt(this.getAttribute('data-idx'));
      let correct = (idx === q.richtigeAntwort);
      if (correct) {
        userScore += (q.punkte || 2);
        this.classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback">Richtig! ${q.erklaerung || ''}</div>`;
      } else {
        this.classList.add('wrong');
        let cIdx = allOpts.findIndex(o=>o.idx===q.richtigeAntwort);
        opts[cIdx].classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback incorrect">Falsch. Die richtige Antwort: ${decodeHTML(q.optionen[q.richtigeAntwort])}<br>${q.erklaerung || ''}</div>`;
      }
      document.getElementById('nextBtn').style.display = "block";
    });
  });
  document.getElementById('nextBtn').onclick = function() {
    currentQ++;
    showTeil1Frage();
  };
}

// === TEIL 2 ===
function startTeil2() {
  currentTeil = 2;
  userScore = 0;
  teil2Points = 0;
  document.getElementById('exam-menu').style.display = "none";
  document.getElementById('teil2-container').style.display = "block";
  document.getElementById('teil1-container').style.display = "none";
  document.getElementById('backBtn').style.display = "block";
  teil2ShortQuiz = shuffle(teil2ShortData).slice(0, 14);
  teil2CaseQuiz = shuffle(teil2Cases)[0];
  currentQ = 0;
  startTimer();
  showTeil2ShortFrage();
}

function showTeil2ShortFrage() {
  if (!teil2ShortQuiz || teil2ShortQuiz.length === 0) {
    // Korrekt: Wenn keine short questions: überspringen
    return showTeil2Case();
  }
  if (currentQ >= teil2ShortQuiz.length) return showTeil2Case();
  let q = teil2ShortQuiz[currentQ];
  let allOpts = shuffle(q.optionen.map((opt, i) => ({ txt: opt, idx: i })));
  let html = `
    <div class="quiz-container">
      <div class="quiz-question">
        Frage ${currentQ+1} von ${teil2ShortQuiz.length}: ${decodeHTML(q.frage)}
      </div>
      <div class="quiz-answers">
        ${allOpts.map(opt => `
          <button class="quiz-opt" data-idx="${opt.idx}">${decodeHTML(opt.txt)}</button>
        `).join('')}
      </div>
      <div id="feedback"></div>
      <button id="nextBtn2" class="back-btn" style="display:none;">Nächste Frage</button>
    </div>
  `;
  document.getElementById('teil2-container').innerHTML = html;
  let locked = false;
  let opts = document.querySelectorAll('#teil2-container .quiz-opt');
  opts.forEach(btn => {
    btn.addEventListener('click', function() {
      if (locked) return;
      locked = true;
      opts.forEach(b => b.disabled = true);
      let idx = parseInt(this.getAttribute('data-idx'));
      let correct = (idx === q.richtigeAntwort);
      if (correct) {
        userScore += (q.punkte || 2);
        this.classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback">Richtig! ${q.erklaerung || ''}</div>`;
      } else {
        this.classList.add('wrong');
        let cIdx = allOpts.findIndex(o=>o.idx===q.richtigeAntwort);
        opts[cIdx].classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback incorrect">Falsch. Die richtige Antwort: ${decodeHTML(q.optionen[q.richtigeAntwort])}<br>${q.erklaerung || ''}</div>`;
      }
      document.getElementById('nextBtn2').style.display = "block";
    });
  });
  document.getElementById('nextBtn2').onclick = function() {
    currentQ++;
    showTeil2ShortFrage();
  };
}

function showTeil2Case() {
  let caseObj = teil2CaseQuiz;
  if (!caseObj || !caseObj.tasks || !Array.isArray(caseObj.tasks)) {
    document.getElementById('teil2-container').innerHTML = `<div class="result-summary"><h2>Kein Case geladen!</h2></div>`;
    return;
  }
  let caseHtml = `
    <div class="fallstudien-container">
      <div class="fs-case-statement">${decodeHTML(caseObj.falltext || "")}</div>
      <div class="fs-tasks">
        ${caseObj.tasks.map((task, i) => `
          <div class="fs-task-block">
            <div class="fs-question">Aufgabe ${i+1}: ${decodeHTML(task.frage)}</div>
            <input class="fs-input" id="caseAns${i}" type="text" autocomplete="off" placeholder="Ihre Antwort ...">
            <button class="fs-show-btn" onclick="document.getElementById('fs-solution-${i}').style.display='block'">Lösung anzeigen</button>
            <div id="fs-solution-${i}" style="display:none;" class="fs-feedback">${decodeHTML(task.loesung || "")}</div>
          </div>
        `).join('')}
      </div>
      <button id="submitCaseBtn" class="back-btn">Abschließen & Auswertung</button>
    </div>
  `;
  document.getElementById('teil2-container').innerHTML = caseHtml;
  document.getElementById('submitCaseBtn').onclick = function() {
    // Bewertung der Tasks
    let total = 0, points = 0;
    caseObj.tasks.forEach((task, i) => {
      let val = (document.getElementById('caseAns'+i).value||"").trim();
      total += (task.punkte||2);
      // Optional: Hier exakte Bewertung falls Lösung exakt ist (kann nach Bedarf erweitert werden)
      // if(val === task.richtigeAntwort) points += (task.punkte||2);
    });
    userScore += points;
    teil2Points = total + (teil2ShortQuiz ? teil2ShortQuiz.length*2 : 0); // max Punkte korrekt!
    showResult();
  }
}

// === Ergebnisse ===
function showResult() {
  clearInterval(timerInterval);
  let maxPoints = (currentTeil==1 ? teil1Quiz.reduce((sum, q) => sum + (q.punkte||2),0) : teil2Points);
  let html = `
    <div class="result-summary">
      <h2>Prüfung abgeschlossen!</h2>
      <p>Sie haben <b>${userScore}</b> von <b>${maxPoints}</b> möglichen Punkten erreicht.</p>
      <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
    </div>
  `;
  if (currentTeil === 1) document.getElementById('teil1-container').innerHTML = html;
  if (currentTeil === 2) document.getElementById('teil2-container').innerHTML = html;
}

// === INIT ===
window.onload = async function() {
  await loadAllData();
  document.getElementById('start-teil1').onclick = function() {
    document.getElementById('start-teil1').disabled = true;
    document.getElementById('start-teil2').disabled = true;
    startTeil1();
  };
  document.getElementById('start-teil2').onclick = function() {
    document.getElementById('start-teil1').disabled = true;
    document.getElementById('start-teil2').disabled = true;
    startTeil2();
  };
  document.getElementById('backBtn').onclick = goBackExam;
};