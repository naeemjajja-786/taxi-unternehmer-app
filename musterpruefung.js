// ------- musterpruefung.js -------

async function loadJSON(file) {
  const resp = await fetch(file);
  if (!resp.ok) throw new Error(file + " konnte nicht geladen werden");
  return resp.json();
}

let teil1Questions = [], teil2Cases = [];
let currentTeil = 0;
let teil1Index = 0, teil2Index = 0;
let teil1Score = 0, teil2Score = 0;
let teil1Total = 0, teil2Total = 0;
let teil1UserAnswers = [], teil2UserAnswers = [];
let shuffledTeil1 = [], shuffledTeil2 = [];

const examMenu = document.getElementById("exam-menu");
const teil1Cont = document.getElementById("teil1-container");
const teil2Cont = document.getElementById("teil2-container");
const backBtn = document.getElementById("backBtn");

// Start Teil 1
document.getElementById("start-teil1").onclick = async () => {
  currentTeil = 1;
  examMenu.style.display = "none";
  teil2Cont.style.display = "none";
  teil1Cont.style.display = "block";
  backBtn.style.display = "block";
  teil1Questions = await loadJSON("Exams-Teil1.json");
  shuffledTeil1 = teil1Questions.slice().sort(()=>Math.random()-0.5);
  teil1Index = 0; teil1Score = 0; teil1Total = 0; teil1UserAnswers = [];
  showTeil1Question();
};
// Start Teil 2
document.getElementById("start-teil2").onclick = async () => {
  currentTeil = 2;
  examMenu.style.display = "none";
  teil1Cont.style.display = "none";
  teil2Cont.style.display = "block";
  backBtn.style.display = "block";
  teil2Cases = await loadJSON("Exams-Teil2.json");
  shuffledTeil2 = teil2Cases.slice().sort(()=>Math.random()-0.5);
  teil2Index = 0; teil2Score = 0; teil2Total = 0; teil2UserAnswers = [];
  showTeil2Case();
};

// Teil 1: Einzelne Fragen
function showTeil1Question() {
  teil1Cont.innerHTML = "";
  if(teil1Index >= shuffledTeil1.length) {
    showTeil1Result();
    return;
  }
  const q = shuffledTeil1[teil1Index];
  teil1Total += q.punkte || 1;
  let html = `<div class="quiz-container">
    <div class="quiz-question"><b>Frage ${teil1Index+1} von ${shuffledTeil1.length}</b><br>${q.frage}</div>`;
  if(q.optionen) {
    let opts = q.optionen.slice().sort(()=>Math.random()-0.5);
    opts.forEach(opt=>{
      html += `<div><label><input type="radio" name="answer" value="${opt}"> ${opt}</label></div>`;
    });
  } else {
    html += `<input class="fs-input" id="teil1-answer" placeholder="Antwort eingeben">`;
  }
  html += `<button class="fs-show-btn" onclick="checkTeil1Answer()">Antwort prüfen</button></div>`;
  teil1Cont.innerHTML = html;
}
window.checkTeil1Answer = function() {
  const q = shuffledTeil1[teil1Index];
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
}

// Teil 1 Result
function showTeil1Result() {
  let html = `<div class="result-summary"><h3>Teil 1 beendet!</h3>
  <p>Punkte: ${teil1Score} von ${teil1Total}</p>
  <p>${teil1Score/teil1Total>=0.5 ? "Bestanden ✅" : "Nicht bestanden ❌"}</p>`;
  html += `<hr><b>Korrekte Antworten:</b><ul>`;
  teil1UserAnswers.forEach((x,i)=>{
    html += `<li><b>${i+1}.</b> ${x.frage}<br>
      Ihre Antwort: <em>${x.user}</em> – ${x.korrekt ? "✅ korrekt" : "❌ falsch"}<br>
      Richtige Lösung: <b>${x.loesung}</b><br></li>`;
  });
  html += "</ul></div><button class='fs-show-btn' onclick='restartExam(1)'>Teil 1 neu starten</button>";
  teil1Cont.innerHTML = html;
}

// Teil 2: Fallstudien & Tasks
function showTeil2Case() {
  teil2Cont.innerHTML = "";
  if(teil2Index >= shuffledTeil2.length) {
    showTeil2Result();
    return;
  }
  const fall = shuffledTeil2[teil2Index];
  let html = `<div class="fallstudien-container"><div class="fs-case-statement">${fall.caseText||fall.titel||fall.ausgangslage}</div>`;
  let taskCount = 0, taskScore = 0;
  html += `<form id="tasks-form">`;
  fall.tasks.forEach((task,j)=>{
    taskCount++;
    taskScore += task.punkte||1;
    html += `<div class="fs-task-block">
      <div class="fs-question">${task.frage}</div>
      <input class="fs-input" id="task_${j}" autocomplete="off" placeholder="Antwort...">
    </div>`;
  });
  html += `</form><button class="fs-show-btn" onclick="checkTeil2Answers()">Antworten prüfen</button></div>`;
  teil2Cont.innerHTML = html;
}
window.checkTeil2Answers = function() {
  const fall = shuffledTeil2[teil2Index];
  let points = 0, total = 0, feedbacks = [];
  fall.tasks.forEach((task,j)=>{
    const user = teil2Cont.querySelector(`#task_${j}`).value.trim();
    const correct = (""+task.richtigeAntwort).trim().toLowerCase();
    const userAnswer = (""+user).trim().toLowerCase();
    let isCorrect = userAnswer === correct;
    if(!isCorrect && !isNaN(correct) && !isNaN(userAnswer)) {
      isCorrect = Math.abs(parseFloat(correct)-parseFloat(userAnswer))<0.01;
    }
    if(isCorrect) points += task.punkte||1;
    total += task.punkte||1;
    feedbacks.push({frage:task.frage, user:user, korrekt:isCorrect, loesung:task.richtigeAntwort});
  });
  teil2Score += points;
  teil2Total += total;
  teil2UserAnswers.push(...feedbacks);
  teil2Index++;
  showTeil2Case();
}

// Teil 2 Result
function showTeil2Result() {
  let html = `<div class="result-summary"><h3>Teil 2 beendet!</h3>
  <p>Punkte: ${teil2Score} von ${teil2Total}</p>
  <p>${teil2Score/teil2Total>=0.5 ? "Bestanden ✅" : "Nicht bestanden ❌"}</p>`;
  html += `<hr><b>Korrekte Antworten:</b><ul>`;
  teil2UserAnswers.forEach((x,i)=>{
    html += `<li><b>${i+1}.</b> ${x.frage}<br>
      Ihre Antwort: <em>${x.user}</em> – ${x.korrekt ? "✅ korrekt" : "❌ falsch"}<br>
      Richtige Lösung: <b>${x.loesung}</b><br></li>`;
  });
  html += "</ul></div><button class='fs-show-btn' onclick='restartExam(2)'>Teil 2 neu starten</button>";
  teil2Cont.innerHTML = html;
}

// Back/Restart
window.goBackExam = function() {
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
