// --------- musterpruefung.js ---------

// Config
const TEIL1_FILE = "Exams-Teil1.json";
const TEIL2_FILE = "Exams-Teil2.json";
const EXAM_DURATION = 60 * 60; // 60 min = 3600 sec

// DOM elements
const examMenu = document.getElementById('exam-menu');
const teil1Container = document.getElementById('teil1-container');
const teil2Container = document.getElementById('teil2-container');
const backBtn = document.getElementById('backBtn');
const timerDiv = document.getElementById('timer');

// --- Helper ---
function showTimer(time) {
  if (timerDiv) timerDiv.innerText = time;
}
function formatTime(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

let timerInterval = null;
function startTimer(seconds, onEnd) {
  let left = seconds;
  showTimer(formatTime(left));
  timerInterval = setInterval(() => {
    left--;
    showTimer(formatTime(left));
    if (left <= 0) {
      clearInterval(timerInterval);
      showTimer('Zeit abgelaufen!');
      if (typeof onEnd === "function") onEnd();
    }
  }, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
}

// --- State ---
let currentPart = null; // "teil1" | "teil2"
let examData = [];
let userAnswers = [];
let questionOrder = [];
let currentIdx = 0;

// --- UI Logic ---
function resetExam() {
  teil1Container.style.display = "none";
  teil2Container.style.display = "none";
  examMenu.style.display = "flex";
  backBtn.style.display = "none";
  showTimer(""); // hide timer
  stopTimer();
  currentPart = null;
  examData = [];
  userAnswers = [];
  questionOrder = [];
  currentIdx = 0;
}

function goBackExam() {
  resetExam();
}
window.goBackExam = goBackExam;

// ---- Teil 1 Exam Logic ----
document.getElementById('start-teil1').onclick = async function() {
  currentPart = "teil1";
  examMenu.style.display = "none";
  teil2Container.style.display = "none";
  teil1Container.style.display = "block";
  backBtn.style.display = "block";
  teil1Container.innerHTML = "<div class='loading'>Lade Fragen ...</div>";
  showTimer(""); // blank before start

  // Load questions
  let json = await fetch(TEIL1_FILE).then(r=>r.json()).catch(()=>null);
  if (!json || !Array.isArray(json)) {
    teil1Container.innerHTML = "<div style='color:red'>Fehler beim Laden der Prüfungsfragen.</div>";
    return;
  }

  // Flatten questions if nested by topic
  let flatQuestions = [];
  for (const block of json) {
    for (const topic in block) {
      if (Array.isArray(block[topic])) flatQuestions.push(...block[topic]);
    }
  }

  // Shuffle and select random 24-28 questions (fit to 60 Punkte)
  shuffle(flatQuestions);
  let selectedQ = flatQuestions.slice(0, 26);
  examData = selectedQ;
  userAnswers = Array(selectedQ.length).fill(null);
  questionOrder = Array.from(selectedQ.keys());
  currentIdx = 0;

  // Start timer
  startTimer(EXAM_DURATION, showTeil1Result);
  renderTeil1Question();
};

function renderTeil1Question() {
  let q = examData[currentIdx];
  if (!q) return;
  teil1Container.innerHTML = `
    <div class="quiz-container">
      <div style="margin-bottom:1.1rem;font-weight:500;font-size:1.05rem;">Frage ${currentIdx + 1} / ${examData.length}</div>
      <div class="quiz-question">${q.frage}</div>
      <div class="quiz-answers">
        ${q.optionen.map((opt, i) =>
          `<button type="button" class="quiz-answer-btn${userAnswers[currentIdx] === i ? " selected" : ""}" onclick="selectTeil1Answer(${i})">${opt}</button>`
        ).join("")}
      </div>
      <div class="quiz-nav-btns" style="margin-top:1.2rem;">
        ${currentIdx > 0 ? `<button onclick="gotoTeil1(-1)">Zurück</button>` : ""}
        ${currentIdx < examData.length-1 ? `<button onclick="gotoTeil1(1)">Weiter</button>` : `<button onclick="showTeil1Result()">Abschließen</button>`}
      </div>
    </div>
  `;
}
window.selectTeil1Answer = function(idx) {
  userAnswers[currentIdx] = idx;
  renderTeil1Question();
};
window.gotoTeil1 = function(delta) {
  currentIdx += delta;
  renderTeil1Question();
};
window.showTeil1Result = function() {
  stopTimer();
  let correct = 0, total = 0, details = [];
  for (let i=0;i<examData.length;i++) {
    let q = examData[i], ans = userAnswers[i];
    total += q.punkte || 1;
    if (ans === q.richtigeAntwort) correct += q.punkte || 1;
    details.push({
      frage: q.frage,
      richtig: ans === q.richtigeAntwort,
      loesung: q.optionen[q.richtigeAntwort],
      erklaerung: q.erklaerung
    });
  }
  let percent = Math.round((correct / total) * 100);
  teil1Container.innerHTML = `
    <div class="result-summary">
      <h2>Ergebnis – Teil 1</h2>
      <p>Punkte: <b>${correct}</b> von <b>${total}</b> (${percent}%)</p>
      <hr style="margin:1.1rem 0">
      ${details.map((d,i)=>`
        <div style="margin-bottom:1.2rem">
          <b>Frage ${i+1}:</b> ${d.frage}<br>
          ${d.richtig ? '<span style="color:#219a36;font-weight:500;">Richtig</span>' : '<span style="color:#e01919;">Falsch</span>'}
          <br>Lösung: <b>${d.loesung}</b><br>
          <em style="color:#007bb5;font-size:0.99em;">${d.erklaerung || ""}</em>
        </div>
      `).join("")}
      <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
    </div>
  `;
};

function shuffle(arr) {
  for (let i=arr.length-1; i>0; i--) {
    let j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ---- Teil 2 Exam Logic (Case studies, short answer, mix) ----
document.getElementById('start-teil2').onclick = async function() {
  currentPart = "teil2";
  examMenu.style.display = "none";
  teil1Container.style.display = "none";
  teil2Container.style.display = "block";
  backBtn.style.display = "block";
  teil2Container.innerHTML = "<div class='loading'>Lade Teil 2 ...</div>";
  showTimer(""); // blank before start

  let json = await fetch(TEIL2_FILE).then(r=>r.json()).catch(()=>null);
  if (!json || !Array.isArray(json)) {
    teil2Container.innerHTML = "<div style='color:red'>Fehler beim Laden von Teil 2.</div>";
    return;
  }
  // Randomize and select cases/tasks as per your exam policy
  shuffle(json);
  let selected = json.slice(0, 2); // Example: 2 case studies, each with multiple tasks
  examData = selected;
  userAnswers = [];
  currentIdx = 0;

  // Timer starten
  startTimer(EXAM_DURATION, showTeil2Result);
  renderTeil2Case();
};

function renderTeil2Case() {
  let c = examData[currentIdx];
  if (!c) return;
  teil2Container.innerHTML = `
    <div class="fallstudien-container">
      <div class="fs-case-statement"><b>Fallstudie ${currentIdx+1}:</b> ${c.fallbeschreibung || c.beschreibung || c.fall || ''}</div>
      <div class="fs-tasks">
        ${c.tasks.map((t,i)=>`
          <div class="fs-task-block">
            <div class="fs-question"><b>Aufgabe ${i+1}:</b> ${t.frage || t.aufgabe || t.task}</div>
            <input class="fs-input" type="text" id="task${i}" placeholder="Antwort eingeben" autocomplete="off">
            <button class="fs-show-btn" onclick="showSolution(${i})">Lösung anzeigen</button>
            <div id="solution${i}" class="fs-feedback" style="display:none;"></div>
          </div>
        `).join("")}
      </div>
      <div class="quiz-nav-btns" style="margin-top:1.2rem;">
        ${currentIdx > 0 ? `<button onclick="gotoTeil2(-1)">Zurück</button>` : ""}
        ${currentIdx < examData.length-1 ? `<button onclick="gotoTeil2(1)">Weiter</button>` : `<button onclick="showTeil2Result()">Abschließen</button>`}
      </div>
    </div>
  `;
}
window.showSolution = function(taskIdx) {
  let c = examData[currentIdx];
  let t = c.tasks[taskIdx];
  let div = document.getElementById("solution"+taskIdx);
  if (div && t && t.loesung) {
    div.style.display = "block";
    div.innerHTML = `<b>Lösung:</b> ${t.loesung} <br><em style="color:#007bb5">${t.rechnungsweg || ""}</em>`;
  }
};
window.gotoTeil2 = function(delta) {
  currentIdx += delta;
  renderTeil2Case();
};
window.showTeil2Result = function() {
  stopTimer();
  teil2Container.innerHTML = `
    <div class="result-summary">
      <h2>Ergebnis – Teil 2</h2>
      <p>Ihre Fallstudien und Antworten wurden bearbeitet.<br>(Detaillierte Auswertung: siehe Lösungen oben.)</p>
      <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
    </div>
  `;
};

resetExam(); // App start, reset all