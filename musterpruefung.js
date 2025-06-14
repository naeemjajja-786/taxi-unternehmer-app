// ---- MUSTERPRUEFUNG.JS ----
// Manually revised: Vertical menu, timer, error-proof, random, result + back btn!

const teil1File = "Exams-Teil1.json";
const teil2File = "Exams-Teil2.json";

const examMenu = document.getElementById("exam-menu");
const teil1Container = document.getElementById("teil1-container");
const teil2Container = document.getElementById("teil2-container");
const backBtn = document.getElementById("backBtn");
const timerDiv = document.getElementById("timer");

let timer = null, timerEnd = null, timerInterval = null;

// ---- Timer-Block ----
function startTimer(minutes = 60, callback) {
  timerEnd = Date.now() + minutes * 60 * 1000;
  showTimer();
  timerInterval = setInterval(() => {
    showTimer();
    if (Date.now() >= timerEnd) {
      clearInterval(timerInterval);
      if (callback) callback();
    }
  }, 1000);
}
function showTimer() {
  if (!timerDiv) return;
  let left = Math.max(0, timerEnd - Date.now());
  let min = Math.floor(left / 60000);
  let sec = Math.floor((left % 60000) / 1000);
  timerDiv.innerText = "Zeit: " + min.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");
  if (left <= 0) timerDiv.innerText = "Zeit abgelaufen!";
}
function resetTimer() {
  clearInterval(timerInterval);
  if (timerDiv) timerDiv.innerText = "";
}

function goBackExam() {
  resetTimer();
  teil1Container.style.display = "none";
  teil2Container.style.display = "none";
  examMenu.style.display = "flex";
  backBtn.style.display = "none";
}

function randomizeArray(arr) {
  return arr.map(v => [v, Math.random()]).sort((a,b) => a[1]-b[1]).map(x => x[0]);
}

// ---- TEIL 1 LOGIK ----
document.getElementById("start-teil1").onclick = async function() {
  examMenu.style.display = "none";
  teil1Container.style.display = "block";
  teil2Container.style.display = "none";
  backBtn.style.display = "inline-block";
  resetTimer();

  let data;
  try {
    data = await fetch(teil1File).then(r=>r.json());
  } catch(e) {
    teil1Container.innerHTML = "<div style='color:red'>Fehler beim Laden der Fragen: "+e.message+"</div>";
    return;
  }

  // ----  flatten all MCQs across topics (manual parsing for your format) ----
  let allQuestions = [];
  if (Array.isArray(data)) {
    for (const block of data) {
      if (typeof block === "object") {
        for (const topic in block) {
          if (Array.isArray(block[topic])) {
            allQuestions = allQuestions.concat(block[topic]);
          }
        }
      }
      // ggf. lose Fragen im Array (wie in deiner JSON) einfügen
      if (Array.isArray(block)) {
        allQuestions = allQuestions.concat(block);
      }
    }
  }
  // nur MCQs nehmen (frage + optionen + richtigeAntwort)
  allQuestions = allQuestions.filter(q => q && q.frage && q.optionen && typeof q.richtigeAntwort !== "undefined");

  // ---- Zufall 20-30 Fragen, max 60 Punkte ----
  let numQuestions = Math.min(30, Math.max(20, allQuestions.length));
  let selected = randomizeArray(allQuestions).slice(0, numQuestions);

  // ---- EXAM LOOP ----
  let score = 0, points = 0, qIndex = 0, answers = [];

  function showQuestion(idx) {
    if (idx >= selected.length) {
      // Result/summary
      teil1Container.innerHTML = `
        <div class="result-summary">
          <h2>Ergebnis</h2>
          <p>Du hast <b>${score}</b> von <b>${points}</b> Punkten erreicht.</p>
          <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
        </div>
      `;
      resetTimer();
      return;
    }
    let q = selected[idx];
    let options = randomizeArray(q.optionen.map((opt, i) => ({opt, i})));
    teil1Container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-question"><b>Frage ${idx+1} von ${selected.length}</b><br>${q.frage}</div>
        <div class="quiz-answers">${options.map(o => `
          <button type="button" class="quiz-answer-btn" data-idx="${o.i}">${o.opt}</button>
        `).join("")}</div>
        <div id="feedback" class="quiz-feedback" style="display:none"></div>
        <div class="quiz-nav-btns">
          ${idx > 0 ? `<button id="prevBtn">Zurück</button>` : ""}
          <button id="nextBtn" style="display:none;">Nächste Frage</button>
        </div>
      </div>
    `;
    // score up
    points += Number(q.punkte || 1);

    let answered = false;
    document.querySelectorAll(".quiz-answer-btn").forEach(btn => {
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        let userAns = Number(btn.dataset.idx);
        let correct = userAns === q.richtigeAntwort;
        btn.classList.add(correct ? "correct" : "wrong");
        if (correct) score += Number(q.punkte || 1);
        document.getElementById("feedback").innerHTML = 
          (correct ? "Richtig! " : "Falsch! ") + (q.erklaerung || "");
        document.getElementById("feedback").style.display = "block";
        document.querySelectorAll(".quiz-answer-btn").forEach(b => b.disabled = true);
        document.getElementById("nextBtn").style.display = "inline-block";
      };
    });
    if (idx > 0) {
      document.getElementById("prevBtn").onclick = ()=>showQuestion(idx-1);
    }
    document.getElementById("nextBtn").onclick = ()=>showQuestion(idx+1);
  }

  startTimer(60, ()=>{ // 60 Minuten!
    teil1Container.innerHTML = `<div class="result-summary">
      <h2>Die Zeit ist abgelaufen!</h2>
      <p>Dein Punktestand: <b>${score}</b> von <b>${points}</b>.</p>
      <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
    </div>`;
  });
  showQuestion(0);
};

window.goBackExam = goBackExam;

document.getElementById("start-teil2").onclick = async function() {
  examMenu.style.display = "none";
  teil1Container.style.display = "none";
  teil2Container.style.display = "block";
  backBtn.style.display = "inline-block";
  resetTimer();

  let data;
  try {
    data = await fetch(teil2File).then(r=>r.json());
  } catch(e) {
    teil2Container.innerHTML = "<div style='color:red'>Fehler beim Laden der Fragen: "+e.message+"</div>";
    return;
  }

  // ---- STRUKTUR: shortQuestions + fallstudien ----
  let shortQuestions = [], cases = [];
  if (data.shortQuestions && Array.isArray(data.shortQuestions)) {
    shortQuestions = data.shortQuestions;
  }
  if (data.fallstudien && Array.isArray(data.fallstudien)) {
    cases = data.fallstudien;
  }
  // Falls andere Struktur:
  if (!shortQuestions.length && Array.isArray(data)) {
    if (data[0]?.shortQuestions) shortQuestions = data[0].shortQuestions;
    if (data[0]?.fallstudien) cases = data[0].fallstudien;
  }
  // 13-15 short, 1 case
  shortQuestions = randomizeArray(shortQuestions).slice(0, 15);
  let selectedCase = randomizeArray(cases).slice(0, 1)[0];

  let score = 0, points = 0, qIndex = 0;

  function showShort(idx) {
    if (idx >= shortQuestions.length) {
      showCase();
      return;
    }
    let q = shortQuestions[idx];
    teil2Container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-question"><b>Frage ${idx+1} von ${shortQuestions.length}</b><br>${q.frage}</div>
        <input type="text" id="shortInput" class="fs-input" autocomplete="off" />
        <div id="feedback" class="quiz-feedback" style="display:none"></div>
        <div class="quiz-nav-btns">
          ${idx > 0 ? `<button id="prevBtn">Zurück</button>` : ""}
          <button id="checkBtn">Antwort prüfen</button>
          <button id="nextBtn" style="display:none;">Nächste Frage</button>
        </div>
      </div>
    `;
    if (idx > 0) {
      document.getElementById("prevBtn").onclick = ()=>showShort(idx-1);
    }
    document.getElementById("checkBtn").onclick = ()=>{
      let userA = document.getElementById("shortInput").value.trim();
      let ok = false;
      // Answer: akzeptiert String-Vergleich oder tolerante Prüfung
      if (typeof q.antwort === "string" && userA.length && userA.toLowerCase() === q.antwort.toLowerCase()) ok = true;
      document.getElementById("feedback").innerHTML = (ok ? "Richtig!" : "Falsch!") + " " + (q.erklaerung || "");
      document.getElementById("feedback").style.display = "block";
      if (ok) score += Number(q.punkte || 2);
      points += Number(q.punkte || 2);
      document.getElementById("nextBtn").style.display = "inline-block";
      document.getElementById("shortInput").disabled = true;
      document.getElementById("checkBtn").disabled = true;
    }
    document.getElementById("nextBtn").onclick = ()=>showShort(idx+1);
  }

  function showCase() {
    // Ein Case, Tasks random
    if (!selectedCase || !selectedCase.tasks || !Array.isArray(selectedCase.tasks)) {
      teil2Container.innerHTML = "<div class='result-summary'>Keine passende Fallstudie gefunden.<br><button class='back-btn' onclick='goBackExam()'>Zurück</button></div>";
      return;
    }
    let tasks = randomizeArray(selectedCase.tasks).slice(0, Math.min(13, selectedCase.tasks.length));
    let tIndex = 0;
    let csScore = 0, csPoints = 0;
    function showTask(idx) {
      if (idx >= tasks.length) {
        // Fallstudie beendet, Gesamtresultat zeigen
        teil2Container.innerHTML = `
          <div class="result-summary">
            <h2>Ergebnis Teil 2</h2>
            <p>Punkte Kurzfragen: <b>${score}</b> von <b>${points}</b></p>
            <p>Punkte Fallstudie: <b>${csScore}</b> von <b>${csPoints}</b></p>
            <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
          </div>
        `;
        resetTimer();
        return;
      }
      let t = tasks[idx];
      teil2Container.innerHTML = `
        <div class="fallstudien-container">
          ${idx === 0 ? `<div class="fs-case-statement">${selectedCase.falltext}</div>` : ""}
          <div class="fs-task-block">
            <div class="fs-question"><b>Aufgabe ${idx+1} von ${tasks.length}</b><br>${t.frage}</div>
            <input type="text" id="caseInput" class="fs-input" autocomplete="off" />
            <div id="feedback" class="fs-feedback" style="display:none"></div>
            <button id="loesungBtn" class="fs-show-btn">Lösung anzeigen</button>
            <button id="checkBtn">Antwort prüfen</button>
            <div class="quiz-nav-btns">
              ${idx > 0 ? `<button id="prevBtn">Zurück</button>` : ""}
              <button id="nextBtn" style="display:none;">Nächste Aufgabe</button>
            </div>
          </div>
        </div>
      `;
      if (idx > 0) document.getElementById("prevBtn").onclick = ()=>showTask(idx-1);
      document.getElementById("loesungBtn").onclick = ()=>{
        document.getElementById("feedback").innerHTML = `<b>Lösung:</b> ${t.antwort || ''}<br>${t.rechnungsweg || ''}`;
        document.getElementById("feedback").style.display = "block";
      };
      document.getElementById("checkBtn").onclick = ()=>{
        let userA = document.getElementById("caseInput").value.trim();
        let ok = false;
        if (typeof t.antwort === "string" && userA.length && userA.toLowerCase() === t.antwort.toLowerCase()) ok = true;
        document.getElementById("feedback").innerHTML = (ok ? "Richtig!" : "Falsch!") + "<br><b>Lösung:</b> " + (t.antwort||"") + "<br>" + (t.rechnungsweg||"");
        document.getElementById("feedback").style.display = "block";
        if (ok) csScore += Number(t.punkte || 1);
        csPoints += Number(t.punkte || 1);
        document.getElementById("nextBtn").style.display = "inline-block";
        document.getElementById("caseInput").disabled = true;
        document.getElementById("checkBtn").disabled = true;
      }
      document.getElementById("nextBtn").onclick = ()=>showTask(idx+1);
    }

    startTimer(60, ()=>{
      teil2Container.innerHTML = `<div class="result-summary">
        <h2>Die Zeit ist abgelaufen!</h2>
        <p>Dein Punktestand: <b>${score+csScore}</b> von <b>${points+csPoints}</b>.</p>
        <button class="back-btn" onclick="goBackExam()">Zurück zum Prüfungsmenü</button>
      </div>`;
    });
    showTask(0);
  }

  startTimer(60); // for the whole teil 2
  showShort(0);
};