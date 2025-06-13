let teil1Fragen = [];
let currentQuestionIndex1 = 0;
let scoreTeil1 = 0;
let answeredTeil1 = [];

function startExamTeil1() {
  fetch("Exams-Teil1.json")
    .then((res) => res.json())
    .then((data) => {
      teil1Fragen = data.slice(0, 30); // پہلی 30 سوال
      document.getElementById("start-buttons").style.display = "none";
      document.getElementById("quiz-container").classList.remove("hidden");
      document.getElementById("quiz-container").dataset.teil = "1";
      currentQuestionIndex1 = 0;
      scoreTeil1 = 0;
      answeredTeil1 = [];
      showQuestionTeil1();
    })
    .catch((err) => {
      console.error("Fehler beim Laden von Teil 1:", err);
      alert("❌ Teil 1 konnte nicht geladen werden.");
    });
}

function showQuestionTeil1() {
  const frage = teil1Fragen[currentQuestionIndex1];
  document.getElementById("question-number").textContent = `Frage ${currentQuestionIndex1 + 1} von ${teil1Fragen.length}`;
  document.getElementById("question-text").textContent = frage.frage;
  document.getElementById("user-answer").value = "";
  document.getElementById("feedback").textContent = "";
}

function submitAnswerTeil1() {
  const input = document.getElementById("user-answer").value.trim();
  const richtigeAntwort = teil1Fragen[currentQuestionIndex1].richtigeAntwort?.trim() || "";

  if (input.toLowerCase() === richtigeAntwort.toLowerCase()) {
    scoreTeil1++;
    document.getElementById("feedback").textContent = "✅ Richtig!";
  } else {
    document.getElementById("feedback").textContent = `❌ Falsch. Richtige Antwort: ${richtigeAntwort}`;
  }

  answeredTeil1.push({
    frage: teil1Fragen[currentQuestionIndex1].frage,
    userAntwort: input,
    richtig: input.toLowerCase() === richtigeAntwort.toLowerCase(),
  });

  currentQuestionIndex1++;
  if (currentQuestionIndex1 < teil1Fragen.length) {
    setTimeout(showQuestionTeil1, 1200);
  } else {
    showResultTeil1();
  }
}

function showResultTeil1() {
  document.getElementById("quiz-container").classList.add("hidden");
  const result = document.getElementById("teil1-result");
  result.classList.remove("hidden");
  result.innerHTML = `<h2>Teil 1 Ergebnis</h2><p>${scoreTeil1} von ${teil1Fragen.length} richtig beantwortet</p>
  <button onclick="location.reload()">Zurück zur Startseite</button>`;
}