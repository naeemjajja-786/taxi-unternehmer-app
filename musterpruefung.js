// === Globale Variablen ===
let teil1Data = [];
let teil2ShortData = [];
let teil2Cases = [];
let teil1Quiz = [];
let teil2ShortQuiz = [];
let teil2CaseQuiz = null;
let currentTeil = 0; // 1=Teil1, 2=Teil2
let currentQ = 0;
let userScore = 0;
let teil2Points = 0;
let timerInterval = null;
let timeLeft = 60 * 60; // 60 Minuten

// === Utility Funktionen ===
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
  // Exams-Teil1: Flache Array (aus verschachteltem [ {Kapitel: [Fragen]} ] in eine Liste)
  teil1Data = [];
  for (let kap of teil1) {
    for (let key in kap) {
      teil1Data = teil1Data.concat(kap[key]);
    }
  }
  // Exams-Teil2: Short questions & Cases
  teil2ShortData = [];
  teil2Cases = [];
  for (let blk of teil2) {
    if (blk.type === "short") teil2ShortData = teil2ShortData.concat(blk.questions);
    if (blk.type === "case") teil2Cases = teil2Cases.concat(blk.cases);
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
  // Map index for each button to shuffled order, but track original idx for correct answer
  let allOpts = shuffle(q.optionen.map((opt, i) => ({ txt: opt, origIdx: i })));
  let html = `
    <div class="quiz-container">
      <div class="quiz-question">
        Frage ${currentQ + 1} von ${teil1Quiz.length}: ${decodeHTML(q.frage)}
      </div>
      <div class="quiz-answers">
        ${allOpts.map((opt, i) => `
          <button class="quiz-opt" data-orig-idx="${opt.origIdx}" data-pos="${i}">${decodeHTML(opt.txt)}</button>
        `).join('')}
      </div>
      <div id="feedback"></div>
      <button id="nextBtn" class="back-btn" style="display:none;">Nächste Frage</button>
    </div>
  `;
  document.getElementById('teil1-container').innerHTML = html;
  let locked = false;
  let btns = document.querySelectorAll('.quiz-opt');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (locked) return;
      locked = true;
      btns.forEach(b => b.disabled = true);
      let origIdx = parseInt(this.getAttribute('data-orig-idx'));
      let correctBtn = Array.from(btns).find(b => parseInt(b.getAttribute('data-orig-idx')) === q.richtigeAntwort);
      if (origIdx === q.richtigeAntwort) {
        userScore += (q.punkte || 1);
        this.classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback">Richtig! ${q.erklaerung || ''}</div>`;
      } else {
        this.classList.add('wrong');
        if (correctBtn) correctBtn.classList.add('correct');
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

// === TEIL 2: Kurzfragen + Fallstudie ===
function startTeil2() {
  currentTeil = 2;
  userScore = 0;
  teil2Points = 0;
  document.getElementById('exam-menu').style.display = "none";
  document.getElementById('teil2-container').style.display = "block";
  document.getElementById('teil1-container').style.display = "none";
  document.getElementById('backBtn').style.display = "block";
  // 13-15 kurze Fragen, 1 Fallstudie mit 6-13 Tasks
  teil2ShortQuiz = shuffle(teil2ShortData).slice(0, 14);
  teil2CaseQuiz = shuffle(teil2Cases)[0];
  currentQ = 0;
  startTimer();
  showTeil2ShortFrage();
}
function showTeil2ShortFrage() {
  // Only show if there are short questions, else go directly to case
  if (!teil2ShortQuiz || teil2ShortQuiz.length === 0) return showTeil2Case();
  if (currentQ >= teil2ShortQuiz.length) return showTeil2Case();
  let q = teil2ShortQuiz[currentQ];
  let allOpts = shuffle(q.optionen.map((opt, i) => ({ txt: opt, origIdx: i })));
  let html = `
    <div class="quiz-container">
      <div class="quiz-question">
        Frage ${currentQ + 1} von ${teil2ShortQuiz.length}: ${decodeHTML(q.frage)}
      </div>
      <div class="quiz-answers">
        ${allOpts.map((opt, i) => `
          <button class="quiz-opt" data-orig-idx="${opt.origIdx}" data-pos="${i}">${decodeHTML(opt.txt)}</button>
        `).join('')}
      </div>
      <div id="feedback"></div>
      <button id="nextBtn2" class="back-btn" style="display:none;">Nächste Frage</button>
    </div>
  `;
  document.getElementById('teil2-container').innerHTML = html;
  let locked = false;
  let btns = document.querySelectorAll('.quiz-opt');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (locked) return;
      locked = true;
      btns.forEach(b => b.disabled = true);
      let origIdx = parseInt(this.getAttribute('data-orig-idx'));
      let correctBtn = Array.from(btns).find(b => parseInt(b.getAttribute('data-orig-idx')) === q.richtigeAntwort);
      if (origIdx === q.richtigeAntwort) {
        userScore += (q.punkte || 2);
        this.classList.add('correct');
        document.getElementById('feedback').innerHTML = `<div class="fs-feedback">Richtig! ${q.erklaerung || ''}</div>`;
      } else {
        this.classList.add('wrong');
        if (correctBtn) correctBtn.classList.add('correct');
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
  // Safety: if caseObj is missing or no tasks, show end
  if (!caseObj || !caseObj.tasks || !caseObj.tasks.length) return showResult();
  let caseHtml = `
    <div class="fallstudien-container">
      <div class="fs-case-statement">${decodeHTML(caseObj.falltext)}</div>
      <div class="fs-tasks">
        ${caseObj.tasks.map((task, i) => `
          <div class="fs-task-block">
            <div class="fs-question">Aufgabe ${i + 1}: ${decodeHTML(task.frage)}</div>
            <input class="fs-input" id="caseAns${i}" type="text" autocomplete="off" placeholder="Ihre Antwort ...">
            <button class="fs-show-btn" onclick="document.getElementById('fs-solution-${i}').style.display='block'">Lösung anzeigen</button>
            <div id="fs-solution-${i}" style="display:none;" class="fs-feedback">${decodeHTML(task.loesung)}</div>
          </div>
        `).join('')}
      </div>
      <button id="submitCaseBtn" class="back-btn">Abschließen & Auswertung</button>
    </div>
  `;
  document.getElementById('teil2-container').innerHTML = caseHtml;
  document.getElementById('submitCaseBtn').onclick = function() {
    let total = 0, points = 0;
    caseObj.tasks.forEach((task, i) => {
      let val = (document.getElementById('caseAns' + i).value || "").trim();
      total += (task.punkte || 2);
    });
    userScore += points;
    teil2Points = total;
    showResult();
  };
}

// === Ergebnisse ===
function showResult() {
  clearInterval(timerInterval);
  let html = `
    <div class="result-summary">
      <h2>Prüfung abgeschlossen!</h2>
      <p>Sie haben <b>${userScore}</b> von <b>${currentTeil == 1 ? teil1Quiz.length * 2 : teil2Points || 32}</b> möglichen Punkten erreicht.</p>
      <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
    </div>
  `;
  if (currentTeil === 1) document.getElementById('teil1-container').innerHTML = html;
  if (currentTeil === 2) document.getElementById('teil2-container').innerHTML = html;
}

// === INIT ===
window.onload = async function() {
  await loadAllData();
  document.getElementById('start-teil1').onclick = startTeil1;
  document.getElementById('start-teil2').onclick = startTeil2;
  document.getElementById('backBtn').onclick = goBackExam;
};