// JS must wait for DOM ready!
document.addEventListener('DOMContentLoaded', function () {
  const teil1Btn = document.getElementById('start-teil1');
  const teil2Btn = document.getElementById('start-teil2');
  const teil1Container = document.getElementById('teil1-container');
  const teil2Container = document.getElementById('teil2-container');
  const menu = document.getElementById('exam-menu');
  const timerBox = document.getElementById('timer');
  const backBtn = document.getElementById('backBtn');

  let timerInterval = null;
  let timerSeconds = 3600; // 60 min

  // Reset/Hide All Sections
  function resetExamUI() {
    menu.style.display = "flex";
    teil1Container.style.display = "none";
    teil2Container.style.display = "none";
    backBtn.style.display = "none";
    timerBox.innerText = "";
    clearInterval(timerInterval);
  }
  window.goBackExam = resetExamUI;

  function showTimer(secs) {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    timerBox.innerText = `⏰ Verbleibende Zeit: ${min.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  function startTimer(onTimeUp) {
    timerSeconds = 3600;
    showTimer(timerSeconds);
    timerInterval = setInterval(() => {
      timerSeconds--;
      showTimer(timerSeconds);
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerBox.innerText = "Zeit abgelaufen!";
        if (onTimeUp) onTimeUp();
      }
    }, 1000);
  }

  // PART 1: Wissensfragen / MCQ
  teil1Btn.onclick = async function () {
    menu.style.display = "none";
    teil1Container.style.display = "block";
    teil2Container.style.display = "none";
    backBtn.style.display = "block";
    startTimer(() => {
      teil1Container.innerHTML += `<div class='result-summary'><b>Die Zeit ist abgelaufen!</b></div>`;
    });

    // Fetch questions from JSON
    try {
      const res = await fetch("Exams-Teil1.json");
      if (!res.ok) throw new Error("Datei nicht gefunden");
      const allQuestions = await res.json();
      // Fragen als Array
      let questions = [];
      // Array flattening falls nötig:
      Object.values(allQuestions).forEach(val => {
        if (Array.isArray(val)) questions = questions.concat(val);
        else if (typeof val === "object") questions.push(val);
      });
      // Shuffle questions
      questions = questions.sort(() => Math.random() - 0.5).slice(0, 25); // zB 25 Fragen
      let qIndex = 0, score = 0;
      renderQuestion();

      function renderQuestion() {
        if (qIndex >= questions.length) {
          teil1Container.innerHTML = `<div class='result-summary'>Ergebnis: <b>${score}</b> von ${questions.length * 2} Punkten.</div>`;
          return;
        }
        const q = questions[qIndex];
        teil1Container.innerHTML = `
          <div class="quiz-question">${q.frage}</div>
          <div class="quiz-answers"></div>
          <button class="fs-show-btn" id="nextQBtn" style="display:none;margin-top:1.4rem;">Nächste Frage</button>
        `;
        const answersDiv = teil1Container.querySelector(".quiz-answers");
        // Shuffle answers
        let opts = q.optionen.map((opt, i) => ({opt, i}));
        opts = opts.sort(() => Math.random() - 0.5);

        opts.forEach(({opt, i}, btnIdx) => {
          let btn = document.createElement('button');
          btn.textContent = opt;
          btn.onclick = () => {
            // Disable all
            answersDiv.querySelectorAll('button').forEach(b => b.disabled = true);
            if (i === q.richtigeAntwort) {
              btn.classList.add("correct");
              score += q.punkte || 1;
              teil1Container.innerHTML += `<div class='fs-feedback'>Richtig! <br>${q.erklaerung || ""}</div>`;
            } else {
              btn.classList.add("wrong");
              teil1Container.innerHTML += `<div class='fs-feedback incorrect'>Falsch!<br>${q.erklaerung || ""}</div>`;
            }
            teil1Container.querySelector("#nextQBtn").style.display = "block";
          };
          answersDiv.appendChild(btn);
        });

        teil1Container.querySelector("#nextQBtn").onclick = () => {
          qIndex++; renderQuestion();
        };
      }
    } catch (e) {
      teil1Container.innerHTML = `<div class='fs-feedback incorrect'>Fehler beim Laden der Fragen: ${e.message}</div>`;
    }
  };

  // PART 2: Fallstudien/Short-Answer
  teil2Btn.onclick = async function () {
    menu.style.display = "none";
    teil1Container.style.display = "none";
    teil2Container.style.display = "block";
    backBtn.style.display = "block";
    startTimer(() => {
      teil2Container.innerHTML += `<div class='result-summary'><b>Die Zeit ist abgelaufen!</b></div>`;
    });
    // Fetch case studies from JSON
    try {
      const res = await fetch("Exams-Teil2.json");
      if (!res.ok) throw new Error("Datei nicht gefunden");
      const allCases = await res.json();
      // Array flattening falls nötig
      let cases = Array.isArray(allCases) ? allCases : Object.values(allCases).flat();
      // Shuffle
      cases = cases.sort(() => Math.random() - 0.5).slice(0, 2); // zB 2 Fallstudien
      let cIndex = 0, totalScore = 0;
      renderCase();

      function renderCase() {
        if (cIndex >= cases.length) {
          teil2Container.innerHTML = `<div class='result-summary'>Ergebnis: <b>${totalScore}</b> Punkte. <br>Teil 2 abgeschlossen!</div>`;
          return;
        }
        const fall = cases[cIndex];
        teil2Container.innerHTML = `
          <div class="fs-case-statement">${fall.case || fall.fallbeschreibung || "Fallstudie"}</div>
          <form id="caseForm" autocomplete="off"></form>
        `;
        const form = teil2Container.querySelector("#caseForm");
        let punktSum = 0;
        // Render tasks
        (fall.tasks || fall.aufgaben || []).forEach((t, idx) => {
          punktSum += t.punkte || 1;
          const block = document.createElement("div");
          block.className = "fs-task-block";
          block.innerHTML = `
            <div class="fs-question">${t.frage || t.task || `Aufgabe ${idx+1}`}</div>
            <input class="fs-input" name="ans${idx}" type="text" autocomplete="off" aria-label="Antwort auf Aufgabe ${idx+1}" />
            <button type="button" class="fs-show-btn" data-solution="${t.loesung || t.solution || ''}" tabindex="0">Lösung anzeigen</button>
            <div class="fs-feedback" style="display:none"></div>
          `;
          // Lösung anzeigen-Button Event
          block.querySelector(".fs-show-btn").onclick = function() {
            block.querySelector(".fs-feedback").style.display = "block";
            block.querySelector(".fs-feedback").innerHTML =
              `<b>Lösung:</b> ${t.loesung || t.solution || "–"}<br><b>Rechnungsweg:</b> ${t.rechnungsweg || t.formel || ""}`;
            this.disabled = true;
          };
          form.appendChild(block);
        });

        form.innerHTML += `<button type="submit" class="fs-show-btn" style="margin-top:1.3rem;">Nächster Fall</button>`;
        form.onsubmit = function(e) {
          e.preventDefault();
          totalScore += punktSum; // realistisch könnte man hier auch Antwortprüfung machen
          cIndex++; renderCase();
        };
      }
    } catch (e) {
      teil2Container.innerHTML = `<div class='fs-feedback incorrect'>Fehler beim Laden der Fallstudien: ${e.message}</div>`;
    }
  };

  // Reset on back
  backBtn.onclick = resetExamUI;

  // Start-UI
  resetExamUI();
});