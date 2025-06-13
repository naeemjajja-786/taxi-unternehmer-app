let teil1Data = [];
let currentQuestionIndex = 0;
let teil1Score = 0;

async function startTeil(teilNummer) {
  document.getElementById("start-buttons").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");

  if (teilNummer === 1) {
    const response = await fetch("Exams-Teil1.json");
    teil1Data = await response.json();
    currentQuestionIndex = 0;
    teil1Score = 0;
    showTeil1Question();
  } else if (teilNummer === 2) {
    startTeil2(); // Aufruf der Funktion aus teil2.js
  }
}

function showTeil1Question() {
  const question = teil1Data[currentQuestionIndex];
  document.getElementById("question-number").textContent = Frage ${currentQuestionIndex + 1} von ${teil1Data.length};
  document.getElementById("question-text").textContent = question.frage;
  document.getElementById("feedback").textContent = "";

  // Unterscheiden zwischen MC und Freitext
  const optionsContainer = document.getElementById("options-container");
  const userAnswer = document.getElementById("user-answer");

  optionsContainer.innerHTML = "";
  if (question.optionen && question.optionen.length > 0) {
    optionsContainer.classList.remove("hidden");
    userAnswer.classList.add("hidden");

    question.optionen.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.onclick = () => {
        checkTeil1Answer(option);
      };
      optionsContainer.appendChild(btn);
    });
  } else {
    userAnswer.value = "";
    userAnswer.classList.remove("hidden");
    optionsContainer.classList.add("hidden");
  }
}

function submitAnswer() {
  const question = teil1Data[currentQuestionIndex];
  const userInput = document.getElementById("user-answer").value.trim();
  if (userInput === "") return;

  checkTeil1Answer(userInput);
}

function checkTeil1Answer(answer) {
  const correct = teil1Data[currentQuestionIndex].richtigeAntwort.trim().toLowerCase();
  const user = answer.trim().toLowerCase();
  const feedback = document.getElementById("feedback");

  if (user === correct) {
    feedback.textContent = "Richtig!";
    feedback.style.color = "green";
    teil1Score += teil1Data[currentQuestionIndex].punkte;
  } else {
    feedback.textContent = Falsch! Richtige Antwort: ${teil1Data[currentQuestionIndex].richtigeAntwort};
    feedback.style.color = "red";
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < teil1Data.length) {
      showTeil1Question();
    } else {
      showTeil1Ergebnis();
    }
  }, 1500);
}

function showTeil1Ergebnis() {
  document.getElementById("quiz-container").classList.add("hidden");
  const resultBox = document.getElementById("teil1-result");
  resultBox.innerHTML = <h2>Teil 1 abgeschlossen</h2><p>Punkte: ${teil1Score}</p>;
  resultBox.classList.remove("hidden");

  showGesamtergebnis();
}

function showGesamtergebnis() {
  document.getElementById("final-result").classList.remove("hidden");
  document.getElementById("gesamtpunkte").textContent = Teil 1 Punkte: ${teil1Score};
}

function goBack() {
  location.reload();
}
