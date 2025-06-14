// ============================
// musterpruefung.js – Fully Manual Audit, Teil 1 & 2, Clean Logic
// ============================

// HTML IDs:
// #timer, #exam-menu, #teil1-container, #teil2-container, #backBtn

let teil1Data = [];
let teil2Data = [];
let quizQuestions = [];
let caseStudy = null;
let currentQ = 0;
let score = 0;
let timer = null;
let secondsLeft = 60 * 60; // 60 minutes default
let examMode = ""; // "teil1" or "teil2"

const timerDiv = document.getElementById("timer");
const examMenu = document.getElementById("exam-menu");
const teil1Container = document.getElementById("teil1-container");
const teil2Container = document.getElementById("teil2-container");
const backBtn = document.getElementById("backBtn");

// --- Util: shuffle array ---
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Timer ---
function showTimer() {
  if (timerDiv) {
    const min = Math.floor(secondsLeft / 60);
    const sec = secondsLeft % 60;
    timerDiv.innerText = `Zeit: ${min}:${sec.toString().padStart(2, '0')}`;
  }
}
function startTimer(duration, callback) {
  clearInterval(timer);
  secondsLeft = duration;
  showTimer();
  timer = setInterval(() => {
    secondsLeft--;
    showTimer();
    if (secondsLeft <= 0) {
      clearInterval(timer);
      callback();
    }
  }, 1000);
}

// --- Load Questions for Teil 1 ---
async function startTeil1Exam() {
  examMode = "teil1";
  teil1Container.innerHTML = "";
  teil2Container.style.display = "none";
  teil1Container.style.display = "block";
  examMenu.style.display = "none";
  backBtn.style.display = "none";
  timerDiv.style.display = "block";
  score = 0;
  currentQ = 0;

  // Fetch questions only if not already loaded
  if (!teil1Data.length) {
    const resp = await fetch("Exams-Teil1.json");
    const rawData = await resp.json();

    // Flatten ALL questions from all topics into one array
    teil1Data = [];
    for (let block of rawData) {
      const topic = Object.keys(block)[0];
      for (let q of block[topic]) {
        teil1Data.push({ ...q, topic });
      }
    }
  }

  // Randomly select 24-28 questions (or your desired count)
  quizQuestions = shuffle(teil1Data).slice(0, 24);
  showTeil1Q();
  startTimer(60 * 60, finishTeil1Exam);
}

function showTeil1Q() {
  const q = quizQuestions[currentQ];
  if (!q) {
    finishTeil1Exam();
    return;
  }
  teil1Container.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-question"><b>Frage ${currentQ + 1} von ${quizQuestions.length}</b><br>${q.frage}</div>
      <div class="quiz-answers">
        ${shuffle(q.optionen).map((opt, i) => `
          <button class="quiz-answer" data-idx="${q.optionen.indexOf(opt)}">${opt}</button>
        `).join("")}
      </div>
    </div>
    <div class="quiz-nav-btns">
      <button id="nextQBtn" style="display:none;">Nächste Frage</button>
    </div>
  `;
  const answerBtns = teil1Container.querySelectorAll(".quiz-answer");
  answerBtns.forEach(btn => btn.onclick = () => checkTeil1Answer(btn, q));
}

function checkTeil1Answer(btn, q) {
  const selected = Number(btn.dataset.idx);
  const allBtns = teil1Container.querySelectorAll(".quiz-answer");
  allBtns.forEach(b => b.disabled = true);

  if (selected === q.richtigeAntwort) {
    btn.classList.add("correct");
    score += q.punkte || 1;
    showFeedback(true, q.erklaerung);
  } else {
    btn.classList.add("wrong");
    allBtns[q.richtigeAntwort]?.classList.add("correct");
    showFeedback(false, q.erklaerung);
  }
  teil1Container.querySelector("#nextQBtn").style.display = "inline-block";
  teil1Container.querySelector("#nextQBtn").onclick = () => {
    currentQ++;
    showTeil1Q();
  };
}

function showFeedback(correct, erklaerung) {
  let fb = document.createElement("div");
  fb.className = "quiz-feedback" + (correct ? "" : " incorrect");
  fb.innerHTML = (correct ? "✅ Richtig!" : "❌ Falsch!") + "<br>" + (erklaerung || "");
  teil1Container.querySelector(".quiz-container").appendChild(fb);
}

function finishTeil1Exam() {
  clearInterval(timer);
  teil1Container.innerHTML = `
    <div class="result-summary">
      <h2>Ergebnis – Teil 1</h2>
      <p>Punkte: <b>${score}</b> von <b>${quizQuestions.reduce((a, b) => a + (b.punkte || 1), 0)}</b></p>
      <button onclick="location.reload()">Zurück zum Prüfungsmenü</button>
    </div>
  `;
  timerDiv.style.display = "none";
}

document.getElementById("start-teil1").onclick = startTeil1Exam;


/// ==== TEIL 2 ====
async function startTeil2Exam() {
  examMode = "teil2";
  teil2Container.innerHTML = "";
  teil1Container.style.display = "none";
  teil2Container.style.display = "block";
  examMenu.style.display = "none";
  backBtn.style.display = "none";
  timerDiv.style.display = "block";
  score = 0;
  currentQ = 0;

  // Fetch cases if not already loaded
  if (!teil2Data.length) {
    const resp = await fetch("Exams-Teil2.json");
    teil2Data = await resp.json();
  }

  // Pick a random case study for this session
  caseStudy = shuffle(teil2Data)[0];

  // Reshuffle tasks if needed, pick 6-10 tasks
  caseStudy.shuffledTasks = shuffle(caseStudy.tasks).slice(0, Math.min(10, caseStudy.tasks.length));
  showTeil2Case();
  startTimer(60 * 60, finishTeil2Exam);
}

function showTeil2Case() {
  // Show Case statement, any tables, then tasks
  let html = `<div class="fallstudien-container">
    <div class="fs-case-statement">${caseStudy.caseStatement || caseStudy.caseText || ""}</div>`;

  if (caseStudy.table) {
    html += `<table class="fs-table">${caseStudy.table}</table>`;
  }
  html += `<div class="fs-tasks">`;
  caseStudy.shuffledTasks.forEach((task, idx) => {
    html += `
      <div class="fs-task-block">
        <div class="fs-question"><b>Aufgabe ${idx + 1}:</b> ${task.frage}</div>
        <input class="fs-input" id="fs-answer-${idx}" autocomplete="off" />
        <button class="fs-show-btn" onclick="showSolution(${idx})">Lösung anzeigen</button>
        <div class="fs-feedback" id="fs-feedback-${idx}" style="display:none"></div>
      </div>`;
  });
  html += `</div>
    <button class="back-btn" onclick="location.reload()">Zurück zum Prüfungsmenü</button>
    </div>`;
  teil2Container.innerHTML = html;
}

window.showSolution = function(idx) {
  // Show solution in feedback area
  const fb = document.getElementById(`fs-feedback-${idx}`);
  if (!fb) return;
  const task = caseStudy.shuffledTasks[idx];
  fb.style.display = "block";
  fb.innerHTML = `<b>Lösung/Rechnungsweg:</b><br>${task.loesung || task.loesungsweg || task.solution || "Keine Lösung hinterlegt."}`;
};

function finishTeil2Exam() {
  clearInterval(timer);
  teil2Container.innerHTML = `
    <div class="result-summary">
      <h2>Ergebnis – Teil 2</h2>
      <p>Sie haben die Fallstudie bearbeitet.</p>
      <button onclick="location.reload()">Zurück zum Prüfungsmenü</button>
    </div>
  `;
  timerDiv.style.display = "none";
}

document.getElementById("start-teil2").onclick = startTeil2Exam;

/// ---- Back Button ----
window.goBackExam = function() {
  clearInterval(timer);
  teil1Container.style.display = "none";
  teil2Container.style.display = "none";
  examMenu.style.display = "flex";
  backBtn.style.display = "none";
  timerDiv.style.display = "none";
  score = 0;
  currentQ = 0;
};