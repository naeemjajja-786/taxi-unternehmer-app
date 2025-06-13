let teil2Fragen = [];
let currentQuestionIndex2 = 0;
let scoreTeil2 = 0;
let answeredTeil2 = [];

function startExamTeil2() {
  fetch("Exams-Teil2.json")
    .then((res) => res.json())
    .then((data) => {
      teil2Fragen = data.slice(0, 10); // پہلی 10 Fallstudien یا Fragen
      document.getElementById("start-buttons").style.display = "none";
      document.getElementById("quiz-container").classList.remove("hidden");
      document.getElementById("quiz-container").dataset.teil = "2";
      currentQuestionIndex2 = 0;
      scoreTeil2 = 0;
      answeredTeil2 = [];
      showQuestionTeil2();
    })
    .catch((err) => {
      console.error("Fehler beim Laden von Teil 2:", err);
      alert("❌ Teil 2 konnte nicht geladen werden.");
    });
}

function showQuestionTeil2() {
  const frageObj = teil2Fragen[currentQuestionIndex2];
  let text = "";

  if (frageObj.fallstudie && frageObj.tasks) {
    // Fallstudie
    text += `Fallstudie: ${frageObj.fallstudie}\n\n`;
    frageObj.tasks.forEach((task, idx) => {
      text += `${idx + 1}. ${task.frage}\n`;
    });
  } else {
    text = frageObj.frage;
  }

  document.getElementById("question-number").textContent = `Frage ${currentQuestionIndex2 + 1} von ${teil2Fragen.length}`;
  document.getElementById("question-text").textContent = text;
  document.getElementById("user-answer").value = "";
  document.getElementById("feedback").textContent = "";
}

function submitAnswerTeil2() {
  const input = document.getElementById("user-answer").value.trim();
  const frageObj = teil2Fragen[currentQuestionIndex2];
  let correct = false;

  if (frageObj.fallstudie && frageObj.tasks) {
    // Bei Fallstudien kein direkter Vergleich
    document.getElementById("feedback").textContent = "Fallstudie beantwortet. Antwort gespeichert.";
    correct = true; // Bewertet wird später manuell oder mit Tiefe
  } else {
    const richtigeAntwort = frageObj.richtigeAntwort?.trim() || "";
    correct = input.toLowerCase() === richtigeAntwort.toLowerCase();

    if (correct) {
      document.getElementById("feedback").textContent = "✅ Richtig!";
      scoreTeil2++;
    } else {
      document.getElementById("feedback").textContent = `❌ Falsch. Richtige Antwort: ${richtigeAntwort}`;
    }
  }

  answeredTeil2.push({
    frage: frageObj.frage || frageObj.fallstudie,
    userAntwort: input,
    richtig: correct,
  });

  currentQuestionIndex2++;
  if (currentQuestionIndex2 < teil2Fragen.length) {
    setTimeout(showQuestionTeil2, 2000);
  } else {
    showResultTeil2();
  }
}

function showResultTeil2() {
  document.getElementById("quiz-container").classList.add("hidden");
  const result = document.getElementById("teil2-result");
  result.classList.remove("hidden");
  result.innerHTML = `<h2>Teil 2 Ergebnis</h2><p>${scoreTeil2} von ${teil2Fragen.length} richtig beantwortet (bei Einzelaufgaben)</p>
  <button onclick="location.reload()">Zurück zur Startseite</button>`;
}