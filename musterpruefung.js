// ------- musterpruefung.js -------

// Hilfsfunktion: shuffle
function shuffle(array) {
  let a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// JSON Laden
async function loadJSON(file) {
  const resp = await fetch(file);
  if (!resp.ok) throw new Error(file + " konnte nicht geladen werden");
  return resp.json();
}

// UI
const examMenu = document.getElementById("exam-menu");
const teil1Cont = document.getElementById("teil1-container");
const teil2Cont = document.getElementById("teil2-container");
const backBtn = document.getElementById("backBtn");

// Globale Variablen
let currentTeil = 0;
let timerInterval = null, timerSeconds = 0;

// ===========================
// === TEIL 1 ===============
// ===========================
let teil1Questions = [];
let teil1Shuffle = [];
let teil1Index = 0, teil1Score = 0, teil1Total = 0, teil1UserAnswers = [];
const TEIL1_FRAGEN_MIN = 20, TEIL1_FRAGEN_MAX = 30, TEIL1_MAX_SCORE = 60, TEIL1_TIMER = 60*60; // 60 min

document.getElementById("start-teil1").onclick = async () => {
  currentTeil = 1;
  examMenu.style.display = "none";
  teil2Cont.style.display = "none";
  teil1Cont.style.display = "block";
  backBtn.style.display = "block";
  teil1Questions = await loadJSON("./Exams-Teil1.json");
  // Shuffle & slice random Fragen
  let nFragen = Math.floor(Math.random() * (TEIL1_FRAGEN_MAX - TEIL1_FRAGEN_MIN + 1)) + TEIL1_FRAGEN_MIN;
  teil1Shuffle = shuffle(teil1Questions).slice(0, nFragen);
  teil1Index = 0; teil1Score = 0; teil1Total = 0; teil1UserAnswers = [];
  startTimer(TEIL1_TIMER, 1);
  showTeil1Question();
};

// Einzelne MC/Short Fragen anzeigen
function showTeil1Question() {
  teil1Cont.innerHTML = `<div id="timerbox1" class="fs-feedback" style="margin-bottom:1.2rem"></div>`;
  if(teil1Index >= teil1Shuffle.length) {
    showTeil1Result();
    return;
  }
  const q = teil1Shuffle[teil1Index];
  teil1Total += q.punkte || 1;
  let html = `<div class="quiz-container">
    <div class="quiz-question"><b>Frage ${teil1Index+1} von ${teil1Shuffle.length}</b><br>${q.frage}</div>`;
  if(q.optionen) {
    let opts = shuffle(q.optionen);
    opts.forEach((opt,i)=>{
      html += `<div><label for="opt_${teil1Index}_${i}">
        <input type="radio" name="answer" id="opt_${teil1Index}_${i}" value="${opt}"> ${opt}
      </label></div>`;
    });
  } else {
    html += `<label for="teil1-answer">Antwort</label>
      <input class="fs-input" id="teil1-answer" placeholder="Antwort eingeben" autocomplete="off">`;
  }
  html += `<button type="button" class="fs-show-btn" onclick="checkTeil1Answer()">Antwort prüfen</button></div>`;
  teil1Cont.innerHTML += html;
}
window.checkTeil1Answer = function() {
  const q = teil1Shuffle[teil1Index];
  let user = "";
  if(q.optionen) {
    const sel = teil1Cont.querySelector('input[type=radio]:checked');
    user = sel ? sel.value : "";
  } else {
    user = teil1Cont.querySelector('#teil1-answer').value.trim();
  }
  const correct = (""+q.antwort).trim().toLowerCase();
  const userAnswer = (""+user).trim().toLowerCase();
  let isCorrect = userAnswer === correct;
  if(!isCorrect && !q.optionen && !isNaN(correct) && !isNaN(userAnswer)) {
    isCorrect = Math.abs(parseFloat(correct)-parseFloat(userAnswer))<0.01;
  }
  if(isCorrect) teil1Score += q.punkte || 1;
  teil1UserAnswers.push({frage:q.frage, user:user, korrekt:isCorrect, loesung:q.antwort});
  teil1Index++;
  showTeil1Question();
};

function showTeil1Result() {
  stopTimer();
  let html = `<div class="result-summary"><h3>Teil 1 beendet!</h3>
  <p>Punkte: ${teil1Score} von ${TEIL1_MAX_SCORE}</p>
  <p>${teil1Score/TEIL1_MAX_SCORE>=0.5 ? "Bestanden ✅" : "Nicht bestanden ❌"}</p>
  <hr><b>Korrekte Antworten:</b><ul>`;
  teil1UserAnswers.forEach((x,i)=>{
    html += `<li><b>${i+1}.</b> ${x.frage}<br>
      Ihre Antwort: <em>${x.user}</em> – ${x.korrekt ? "✅ korrekt" : "❌ falsch"}<br>
      Richtige Lösung: <b>${x.loesung}</b></li>`;
  });
  html += "</ul></div><button class='fs-show-btn' onclick='restartExam(1)'>Teil 1 neu starten</button>";
  teil1Cont.innerHTML = html;
}

// ===========================
// === TEIL 2 ===============
// ===========================
let teil2Questions = [], teil2Fallstudien = [];
let teil2KurzShuffle = [], teil2FallShuffle = [];
let teil2KurzIndex = 0, teil2FallIndex = 0;
let teil2Score = 0, teil2Total = 0, teil2UserAnswers = [];
const TEIL2_KURZ_MIN = 13, TEIL2_KURZ_MAX = 15, TEIL2_KURZ_PUNKTE = 32;
const TEIL2_CASE_PUNKTE = 18; // kann angepasst werden (Rest bis max 52.5)
const TEIL2_TIMER = 60*60; // 60 min

document.getElementById("start-teil2").onclick = async () => {
  currentTeil = 2;
  examMenu.style.display = "none";
  teil1Cont.style.display = "none";
  teil2Cont.style.display = "block";
  backBtn.style.display = "block";
  teil2Questions = await loadJSON("./Exams-Teil2.json");
  // --- Teil 2 Block 1: Kurzfragen sammeln
  let allKurzfragen = [];
  teil2Questions.forEach(fall=>{
    if(fall.kurzfragen && Array.isArray(fall.kurzfragen)) {
      allKurzfragen = allKurzfragen.concat(fall.kurzfragen);
    }
    // Oder falls alle Fallstudien auch als kurzfrage taugen, so:
    if (fall.tasks && Array.isArray(fall.tasks)) {
      for (let task of fall.tasks) {
        if((task.frage||"").length < 80) { // nur kurze Fragen nehmen
          allKurzfragen.push(task);
        }
      }
    }
  });
  let nKurz = Math.floor(Math.random()*(TEIL2_KURZ_MAX-TEIL2_KURZ_MIN+1))+TEIL2_KURZ_MIN;
  teil2KurzShuffle = shuffle(allKurzfragen).slice(0, nKurz);
  teil2KurzIndex = 0; teil2FallIndex = 0; teil2Score = 0; teil2Total = 0; teil2UserAnswers = [];
  startTimer(TEIL2_TIMER, 2);
  showTeil2Kurzfrage();
};

// === Teil 2, Block 1: Kurzfragen (Short questions) ===
function showTeil2Kurzfrage() {
  teil2Cont.innerHTML = `<div id="timerbox2" class="fs-feedback" style="margin-bottom:1.2rem"></div>`;
  if (teil2KurzIndex >= teil2KurzShuffle.length) {
    // Weiter zu Fallstudie
    showTeil2Fallstudie();
    return;
  }
  const q = teil2KurzShuffle[teil2KurzIndex];
  teil2Total += q.punkte || 2;
  let html = `<div class="quiz-container">
    <div class="quiz-question"><b>Kurzfrage ${teil2KurzIndex+1} von ${teil2KurzShuffle.length}</b><br>${q.frage}</div>
    <label for="teil2-kurz">${q.frage}</label>
    <input class="fs-input" id="teil2-kurz" placeholder="Antwort eingeben" autocomplete="off">
    <button type="button" class="fs-show-btn" onclick="checkTeil2Kurz()">Antwort prüfen</button>
    </div>`;
  teil2Cont.innerHTML += html;
}
window.checkTeil2Kurz = function() {
  const q = teil2KurzShuffle[teil2KurzIndex];
  const user = teil2Cont.querySelector('#teil2-kurz').value.trim();
  const correct = (""+q.richtigeAntwort).trim().toLowerCase();
  const userAnswer = (""+user).trim().toLowerCase();
  let isCorrect = userAnswer === correct;
  if(!isCorrect && !isNaN(correct) && !isNaN(userAnswer)) {
    isCorrect = Math.abs(parseFloat(correct)-parseFloat(userAnswer))<0.01;
  }
  if(isCorrect) teil2Score += q.punkte || 2;
  teil2UserAnswers.push({frage:q.frage, user:user, korrekt:isCorrect, loesung:q.richtigeAntwort});
  teil2KurzIndex++;
  showTeil2Kurzfrage();
};

// === Teil 2, Block 2: 1x Fallstudie (Case Study) ===
function showTeil2Fallstudie() {
  // random Fallstudie mit 6–13 Tasks
  let bigCases = teil2Questions.filter(f=>f.tasks && f.tasks.length >= 6);
  let caseStudy = shuffle(bigCases)[0];
  let nTasks = Math.max(6, Math.min(13, caseStudy.tasks.length));
  let caseTasks = shuffle(caseStudy.tasks).slice(0, nTasks);
  teil2FallShuffle = [{caseText: caseStudy.caseText, tasks: caseTasks}];
  teil2FallIndex = 0;
  showTeil2Case();
}
function showTeil2Case() {
  if (teil2FallIndex >= teil2FallShuffle.length) {
    showTeil2Result();
    return;
  }
  const fall = teil2FallShuffle[teil2FallIndex];
  let html = `<div class="fallstudien-container"><div class="fs-case-statement">${fall.caseText}</div><form id="tasks-form">`;
  fall.tasks.forEach((task, j) => {
    html += `<div class="fs-task-block">
      <label for="task_${j}" class="fs-question">${task.frage}</label>
      <input class="fs-input" id="task_${j}" autocomplete="off" placeholder="Antwort...">
    </div>`;
  });
  html += `</form><button type="button" class="fs-show-btn" onclick="checkTeil2Answers()">Antworten prüfen</button></div>`;
  teil2Cont.innerHTML += html;
}
window.checkTeil2Answers = function() {
  const fall = teil2FallShuffle[teil2FallIndex];
  let points = 0, total = 0, feedbacks = [];
  fall.tasks.forEach((task, j) => {
    const user = teil2Cont.querySelector(`#task_${j}`).value.trim();
    const correct = (""+task.richtigeAntwort).trim().toLowerCase();
    const userAnswer = (""+user).trim().toLowerCase();
    let isCorrect = userAnswer === correct;
    if(!isCorrect && !isNaN(correct) && !isNaN(userAnswer)) {
      isCorrect = Math.abs(parseFloat(correct)-parseFloat(userAnswer))<0.01;
    }
    if(isCorrect) points += task.punkte || 2;
    total += task.punkte || 2;
    feedbacks.push({frage:task.frage, user:user, korrekt:isCorrect, loesung:task.richtigeAntwort});
  });
  teil2Score += points;
  teil2Total += total;
  teil2UserAnswers.push(...feedbacks);
  teil2FallIndex++;
  showTeil2Case();
};

// ==== Teil 2 Result ====
function showTeil2Result() {
  stopTimer();
  let html = `<div class="result-summary"><h3>Teil 2 beendet!</h3>
    <p>Punkte: ${teil2Score} von 52</p>
    <p>${teil2Score/52>=0.5 ? "Bestanden ✅" : "Nicht bestanden ❌"}</p>
    <hr><b>Korrekte Antworten:</b><ul>`;
  teil2UserAnswers.forEach((x,i)=>{
    html += `<li><b>${i+1}.</b> ${x.frage}<br>
      Ihre Antwort: <em>${x.user}</em> – ${x.korrekt ? "✅ korrekt" : "❌ falsch"}<br>
      Richtige Lösung: <b>${x.loesung}</b></li>`;
  });
  html += "</ul></div><button class='fs-show-btn' onclick='restartExam(2)'>Teil 2 neu starten</button>";
  teil2Cont.innerHTML = html;
}

// === Timer ===
function startTimer(secs, teil) {
  timerSeconds = secs;
  showTimer(teil);
  timerInterval = setInterval(()=>{
    timerSeconds--;
    showTimer(teil);
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Zeit abgelaufen!");
      if (teil === 1) showTeil1Result();
      else showTeil2Result();
    }
  }, 1000);
}
function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
function showTimer(teil) {
  let mins = Math.floor(timerSeconds/60), sec = timerSeconds%60;
  let txt = `⏰ Zeit: ${String(mins).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  if (teil === 1) document.getElementById("timerbox1").innerText = txt;
  if (teil === 2) document.getElementById("timerbox2").innerText = txt;
}

// === Restart/Zurück ===
window.goBackExam = function() {
  stopTimer();
  currentTeil = 0;
  examMenu.style.display = "flex";
  teil1Cont.style.display = "none";
  teil2Cont.style.display = "none";
  backBtn.style.display = "none";
};
window.restartExam = function(teil) {
  if(teil===1) document.getElementById("start-teil1").onclick();
  else document.getElementById("start-teil2").onclick();
};