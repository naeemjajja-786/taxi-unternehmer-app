let teil2Data = [];
let currentCaseIndex = 0;
let currentTaskIndex = 0;
let teil2Score = 0;

async function startTeil2() {
  document.getElementById("start-buttons").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");

  const response = await fetch("Exams-Teil2.json");
  teil2Data = await response.json();

  currentCaseIndex = 0;
  currentTaskIndex = 0;
  teil2Score = 0;

  showTeil2Question();
}

function showTeil2Question() {
  const currentCase = teil2Data[currentCaseIndex];
  const currentTask = currentCase.tasks[currentTaskIndex];

  document.getElementById("question-number").textContent = Fall ${currentCaseIndex + 1} – Aufgabe ${currentTaskIndex + 1} von ${currentCase.tasks.length};
  document.getElementById("question-text").innerHTML = <strong>${currentCase.fallstudie}</strong><br><br>${currentTask.frage};
  document.getElementById("feedback").textContent = "";

  document.getElementById("user-answer").classList.remove("hidden");
  document.getElementById("user-answer").value = "";
  document.getElementById("options-container").innerHTML = "";
}

function submitAnswer() {
  const answer = document.getElementById("user-answer").value.trim().toLowerCase();
  const correctAnswer = teil2Data[currentCaseIndex].tasks[currentTaskIndex].richtigeAntwort.trim().toLowerCase();
  const feedback = document.getElementById("feedback");

  if (answer === correctAnswer) {
    feedback.textContent = "Richtig!";
    feedback.style.color = "green";
    teil2Score += teil2Data[currentCaseIndex].tasks[currentTaskIndex].punkte;
  } else {
    feedback.textContent = Falsch! Richtige Antwort: ${teil2Data[currentCaseIndex].tasks[currentTaskIndex].richtigeAntwort};
    feedback.style.color = "red";
  }

  setTimeout(() => {
    nextTeil2Question();
  }, 1500);
}

function nextTeil2Question() {
  currentTaskIndex++;
  if (currentTaskIndex < teil2Data[currentCaseIndex].tasks.length) {
    showTeil2Question();
  } else {
    currentCaseIndex++;
    currentTaskIndex = 0;

    if (currentCaseIndex < teil2Data.length) {
      showTeil2Question();
    } else {
      showTeil2Ergebnis();
    }
  }
}

function showTeil2Ergebnis() {
  document.getElementById("quiz-container").classList.add("hidden");
  const resultBox = document.getElementById("teil2-result");
  resultBox.innerHTML = <h2>Teil 2 abgeschlossen</h2><p>Punkte: ${teil2Score}</p>;
  resultBox.classList.remove("hidden");

  showGesamtergebnis();
}

function showGesamtergebnis() {
  document.getElementById("final-result").classList.remove("hidden");

  const teil1Result = typeof teil1Score !== "undefined" ? teil1Score : 0;
  document.getElementById("gesamtpunkte").textContent = Teil 1 Punkte: ${teil1Result} | Teil 2 Punkte: ${teil2Score};
}

function goBack() {
  location.reload();
}
