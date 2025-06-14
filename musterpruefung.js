// --------- MUSTERPRUEFUNG.JS ---------
// Kompatibel mit Exams-Teil1.json, Exams-Teil2.json, HTML/CSS Strukturen
// Teil 1: MCQ/Short | Teil 2: Short + Fallstudien
// Autor: ChatGPT | Stand: 2025-06

// --- STATE ---
let teil1Questions = [];
let teil1Index = 0;
let teil1Score = 0;
let teil1TotalPoints = 0;
let teil1Answered = [];

let teil2Short = [];
let teil2Cases = [];
let teil2Phase = "short"; // oder "case"
let teil2Index = 0;
let teil2Score = 0;
let teil2TotalPoints = 0;
let teil2CaseTaskIndex = 0;
let teil2CurrentCase = null;
let teil2CurrentCaseTasks = [];
let teil2UserAnswers = [];

let timerInterval = null;
let timerSeconds = 3600; // 60 Minuten

// --- UTILS ---
function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function formatTime(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function showTimer() {
  let t = document.getElementById("timer");
  if (t) t.innerText = `Verbleibende Zeit: ${formatTime(timerSeconds)}`;
}
function startTimer(onTimeout) {
  if (timerInterval) clearInterval(timerInterval);
  showTimer();
  timerInterval = setInterval(() => {
    timerSeconds--;
    showTimer();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 1000);
}

// --- UI State ---
function hideAll() {
  document.getElementById("exam-menu").style.display = "none";
  document.getElementById("teil1-container").style.display = "none";
  document.getElementById("teil2-container").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
}
function goBackExam() {
  hideAll();
  document.getElementById("exam-menu").style.display = "flex";
  document.getElementById("timer").innerText = "";
  if (timerInterval) clearInterval(timerInterval);
}

// --- TEIL 1: LADEN + ANZEIGEN ---
function loadTeil1() {
  fetch('Exams-Teil1.json')
    .then(r => r.json())
    .then(data => {
      teil1Questions = [];
      Object.values(data[0]).forEach(block => teil1Questions.push(...block));
      teil1Questions = shuffle(teil1Questions).slice(0, 25); // z.B. 25 Fragen pro Versuch
      teil1Index = 0;
      teil1Score = 0;
      teil1TotalPoints = 0;
      teil1Answered = [];
      showTeil1Question();
      hideAll();
      document.getElementById("teil1-container").style.display = "block";
      document.getElementById("backBtn").style.display = "block";
      timerSeconds = 3600;
      startTimer(teil1Finish);
    });
}

function showTeil1Question() {
  let q = teil1Questions[teil1Index];
  let container = document.getElementById("teil1-container");
  if (!q) {
    teil1Finish();
    return;
  }
  let opts = shuffle(q.optionen.map((opt, idx) => ({text: opt, idx})));
  let html = `<div class="quiz-container">
    <div class="quiz-question"><b>Frage ${teil1Index+1} von ${teil1Questions.length}:</b> ${q.frage}</div>
    <div class="quiz-answers">` +
    opts.map(o => `<button onclick="answerTeil1(${opts.findIndex(oo=>oo.idx===q.richtigeAntwort)})">${o.text}</button>`).join('') +
    `</div>
    <div id="teil1-feedback"></div>
    <div class="quiz-nav-btns">
      <button id="teil1-next" ${teil1Answered[teil1Index] ? "" : "disabled"}>Nächste Frage</button>
    </div>
    <div style="margin-top:1.2rem;font-size:0.98em;color:#567"><b>Punkte für diese Frage:</b> ${q.punkte}</div>
    <div style="margin-top:0.7em;font-size:0.98em;">Erklärung: ${q.erklaerung || ''}</div>
  </div>`;
  container.innerHTML = html;
  document.getElementById("teil1-next").onclick = () => {
    teil1Index++;
    showTeil1Question();
  };
}
window.answerTeil1 = function (selected) {
  let q = teil1Questions[teil1Index];
  let correct = (selected === q.richtigeAntwort);
  teil1Answered[teil1Index] = true;
  if (correct) teil1Score += q.punkte;
  teil1TotalPoints += q.punkte;
  document.getElementById("teil1-feedback").innerHTML =
    correct
      ? `<div class="fs-feedback">Richtig! +${q.punkte} Punkt(e)</div>`
      : `<div class="fs-feedback incorrect">Falsch. Die richtige Antwort: <b>${q.optionen[q.richtigeAntwort]}</b></div>`;
  let btns = document.querySelectorAll('.quiz-answers button');
  btns.forEach((b,i) => {
    b.disabled = true;
    if (i === q.richtigeAntwort) b.classList.add('correct');
    else if (i === selected) b.classList.add('wrong');
  });
  document.getElementById("teil1-next").disabled = false;
};

function teil1Finish() {
  hideAll();
  let html = `<div class="result-summary">
    <h2>Teil 1 abgeschlossen!</h2>
    <p>Sie haben <b>${teil1Score}</b> von <b>${teil1TotalPoints}</b> möglichen Punkten erreicht.</p>
    <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
  </div>`;
  document.getElementById("teil1-container").innerHTML = html;
  document.getElementById("teil1-container").style.display = "block";
  document.getElementById("backBtn").style.display = "none";
  if (timerInterval) clearInterval(timerInterval);
}

// --- TEIL 2: LADEN + ANZEIGEN ---
function loadTeil2() {
  fetch('Exams-Teil2.json')
    .then(r => r.json())
    .then(data => {
      teil2Short = data.shortQuestions || [];
      teil2Cases = data.fallstudien || [];
      teil2Index = 0;
      teil2Score = 0;
      teil2TotalPoints = 0;
      teil2Phase = "short";
      teil2CaseTaskIndex = 0;
      teil2CurrentCase = null;
      teil2CurrentCaseTasks = [];
      teil2UserAnswers = [];
      showTeil2Question();
      hideAll();
      document.getElementById("teil2-container").style.display = "block";
      document.getElementById("backBtn").style.display = "block";
      timerSeconds = 3600;
      startTimer(teil2Finish);
    });
}

function showTeil2Question() {
  let container = document.getElementById("teil2-container");
  if (teil2Phase === "short" && teil2Index < teil2Short.length) {
    let q = teil2Short[teil2Index];
    let html = `<div class="quiz-container">
      <div class="quiz-question"><b>Frage ${teil2Index+1} von ${teil2Short.length} (Kurzfrage):</b> ${q.frage}</div>
      <input id="teil2-input" class="fs-input" autocomplete="off">
      <div id="teil2-feedback"></div>
      <div class="quiz-nav-btns">
        <button id="teil2-next" disabled>Nächste Frage</button>
      </div>
      <div style="margin-top:1.2rem;font-size:0.98em;color:#567"><b>Punkte:</b> ${q.punkte}</div>
    </div>`;
    container.innerHTML = html;
    let input = document.getElementById('teil2-input');
    input.addEventListener('input', () => {
      document.getElementById("teil2-next").disabled = !input.value.trim();
    });
    document.getElementById("teil2-next").onclick = () => {
      // Bewertung (optional: richtige Antwort auswerten, punkte geben)
      if (input.value.trim().toLowerCase() === (q.antwort || "").toLowerCase()) teil2Score += q.punkte;
      teil2TotalPoints += q.punkte;
      teil2Index++;
      showTeil2Question();
    };
  } else if (teil2Phase === "short") {
    // Zu Fallstudien-Phase wechseln
    teil2Phase = "case";
    teil2Index = 0;
    showTeil2Question();
  } else if (teil2Phase === "case" && teil2Index < teil2Cases.length) {
    teil2CurrentCase = teil2Cases[teil2Index];
    teil2CurrentCaseTasks = shuffle(teil2CurrentCase.tasks).slice(0, 7); // z.B. 7 Aufgaben pro Fallstudie
    teil2CaseTaskIndex = 0;
    showTeil2CaseTask();
  } else {
    teil2Finish();
  }
}
function showTeil2CaseTask() {
  let container = document.getElementById("teil2-container");
  let c = teil2CurrentCase;
  let t = teil2CurrentCaseTasks[teil2CaseTaskIndex];
  let html = `<div class="fallstudien-container">
    <div class="fs-case-statement"><b>Fallstudie:</b> ${c.case || c.beschreibung}</div>
    <div class="fs-task-block">
      <div class="fs-question"><b>Aufgabe ${teil2CaseTaskIndex+1}:</b> ${t.frage}</div>
      <input id="fs-input" class="fs-input" autocomplete="off">
      <div id="fs-feedback"></div>
      <button id="show-solution" class="fs-show-btn">Lösung anzeigen</button>
    </div>
    <div class="quiz-nav-btns">
      <button id="teil2-next" disabled>${teil2CaseTaskIndex < teil2CurrentCaseTasks.length-1 ? "Nächste Aufgabe" : "Nächster Fall / Fertig"}</button>
    </div>
    <div style="margin-top:1.1rem;font-size:0.96em;color:#567"><b>Punkte für diese Aufgabe:</b> ${t.punkte}</div>
  </div>`;
  container.innerHTML = html;
  let input = document.getElementById('fs-input');
  input.addEventListener('input', () => {
    document.getElementById("teil2-next").disabled = !input.value.trim();
  });
  document.getElementById("teil2-next").onclick = () => {
    if (input.value.trim() === (t.antwort + "")) teil2Score += t.punkte;
    teil2TotalPoints += t.punkte;
    teil2CaseTaskIndex++;
    if (teil2CaseTaskIndex < teil2CurrentCaseTasks.length) {
      showTeil2CaseTask();
    } else {
      teil2Index++;
      showTeil2Question();
    }
  };
  document.getElementById("show-solution").onclick = () => {
    document.getElementById("fs-feedback").innerHTML =
      `<div class="fs-feedback">Richtige Lösung: <b>${t.antwort}</b><br><span style="font-size:0.98em;color:#005e9e">${t.rechnungsweg || ""}</span></div>`;
  };
}
function teil2Finish() {
  hideAll();
  let html = `<div class="result-summary">
    <h2>Teil 2 abgeschlossen!</h2>
    <p>Sie haben <b>${teil2Score}</b> von <b>${teil2TotalPoints}</b> möglichen Punkten erreicht.</p>
    <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
  </div>`;
  document.getElementById("teil2-container").innerHTML = html;
  document.getElementById("teil2-container").style.display = "block";
  document.getElementById("backBtn").style.display = "none";
  if (timerInterval) clearInterval(timerInterval);
}

// --- BUTTONS BINDING ---
window.goBackExam = goBackExam;
window.onload = () => {
  document.getElementById("start-teil1").onclick = loadTeil1;
  document.getElementById("start-teil2").onclick = loadTeil2;
  document.getElementById("backBtn").onclick = goBackExam;
  hideAll();
  document.getElementById("exam-menu").style.display = "flex";
};