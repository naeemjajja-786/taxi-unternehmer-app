// musterpruefung.js

let teil1Fragen = [];
let teil2Fallstudien = [];
let currentTeil = 1;
let currentIndex = 0;
let currentFragen = [];
let userAnswers = [];
let scoreTeil1 = 0;
let scoreTeil2 = 0;

async function loadExams() {
  try {
    const [teil1Response, teil2Response] = await Promise.all([
      fetch('Exams-Teil1.json'),
      fetch('Exams-Teil2.json')
    ]);

    teil1Fragen = await teil1Response.json();
    teil2Fallstudien = await teil2Response.json();

    document.getElementById("start-buttons").style.display = "block";
  } catch (error) {
    document.getElementById("quiz-container").innerHTML = "<p style='color:red;'>Fehler beim Laden der Prüfungsdaten.</p>";
    console.error(error);
  }
}

function startExam(teil) {
  currentTeil = teil;
  currentIndex = 0;
  userAnswers = [];
  currentFragen = teil === 1 ? teil1Fragen : teil2Fallstudien;
  document.getElementById("start-buttons").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  showQuestion();
}

function showQuestion() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  if (currentIndex >= currentFragen.length) {
    calculateScore();
    return;
  }

  const frageObj = currentFragen[currentIndex];

  if (currentTeil === 1) {
    const frageEl = document.createElement("div");
    frageEl.innerHTML = `
      <h3>Frage ${currentIndex + 1} von ${currentFragen.length}</h3>
      <p><strong>${frageObj.frage}</strong></p>
      <textarea id="antwort" rows="3" placeholder="Ihre Antwort..."></textarea>
      <button onclick="nextQuestion()">Weiter</button>
    `;
    container.appendChild(frageEl);
  } else {
    const fallstudieEl = document.createElement("div");
    fallstudieEl.innerHTML = `
      <h3>Fallstudie ${currentIndex + 1} von ${currentFragen.length}</h3>
      <p><strong>${frageObj.fallstudie}</strong></p>
    `;

    frageObj.tasks.forEach((task, idx) => {
      const taskEl = document.createElement("div");
      taskEl.innerHTML = `
        <p><strong>Aufgabe ${idx + 1}:</strong> ${task.frage}</p>
        <textarea data-task="${idx}" rows="2" placeholder="Ihre Antwort..."></textarea>
      `;
      fallstudieEl.appendChild(taskEl);
    });

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Weiter";
    nextBtn.onclick = nextQuestion;
    fallstudieEl.appendChild(nextBtn);
    container.appendChild(fallstudieEl);
  }
}

function nextQuestion() {
  if (currentTeil === 1) {
    const answer = document.getElementById("antwort").value.trim();
    userAnswers.push({
      user: answer,
      correct: currentFragen[currentIndex].richtigeAntwort,
      punkte: currentFragen[currentIndex].punkte
    });
  } else {
    const inputs = document.querySelectorAll("textarea[data-task]");
    const tasks = currentFragen[currentIndex].tasks;
    inputs.forEach((input, i) => {
      userAnswers.push({
        user: input.value.trim(),
        correct: tasks[i].richtigeAntwort,
        punkte: tasks[i].punkte
      });
    });
  }

  currentIndex++;
  showQuestion();
}

function calculateScore() {
  let score = 0;
  let max = 0;

  userAnswers.forEach(entry => {
    max += entry.punkte;
    if (entry.user.toLowerCase() === entry.correct.toLowerCase()) {
      score += entry.punkte;
    }
  });

  if (currentTeil === 1) {
    scoreTeil1 = score;
  } else {
    scoreTeil2 = score;
  }

  document.getElementById("quiz-container").innerHTML = `
    <h2>Teil ${currentTeil} abgeschlossen</h2>
    <p>Erreichte Punkte: ${score} von ${max}</p>
    <button onclick="goToMenu()">Zurück zum Menü</button>
    <button onclick="showFinalScore()">Gesamtergebnis anzeigen</button>
  `;
}

function goToMenu() {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("start-buttons").style.display = "block";
}

function showFinalScore() {
  const total = scoreTeil1 + scoreTeil2;
  document.getElementById("quiz-container").innerHTML = `
    <h2>Gesamtergebnis</h2>
    <p>Teil 1: ${scoreTeil1} Punkte</p>
    <p>Teil 2: ${scoreTeil2} Punkte</p>
    <p><strong>Gesamt: ${total} Punkte</strong></p>
    <button onclick="goToMenu()">Zurück zum Menü</button>
  `;
}

document.addEventListener("DOMContentLoaded", loadExams);
