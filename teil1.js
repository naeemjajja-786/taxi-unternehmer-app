let teil1Fragen = [];
let teil1Index = 0;
let teil1Punkte = 0;

function startTeil1() {
  fetch("Exams-Teil1.json")
    .then((res) => res.json())
    .then((data) => {
      teil1Fragen = data.slice(0, 30); // oder volle 200, wenn nötig
      document.getElementById("teil1-container").classList.remove("hidden");
      showTeil1Frage();
    })
    .catch((err) => {
      console.error("Fehler beim Laden von Teil 1:", err);
    });
}

function showTeil1Frage() {
  const frageObj = teil1Fragen[teil1Index];
  document.getElementById("teil1-question-number").textContent =
    Frage ${teil1Index + 1} von ${teil1Fragen.length};
  document.getElementById("teil1-question-text").textContent = frageObj.frage;

  const optionsContainer = document.getElementById("teil1-options");
  const textAnswer = document.getElementById("teil1-answer");

  if (frageObj.antworten && Array.isArray(frageObj.antworten)) {
    optionsContainer.innerHTML = "";
    frageObj.antworten.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => {
        frageObj.userAntwort = opt;
        Array.from(optionsContainer.children).forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      optionsContainer.appendChild(btn);
    });
    optionsContainer.classList.remove("hidden");
    textAnswer.classList.add("hidden");
  } else {
    textAnswer.value = frageObj.userAntwort || "";
    textAnswer.classList.remove("hidden");
    optionsContainer.classList.add("hidden");
  }

  document.getElementById("teil1-feedback").textContent = "";
}

function submitTeil1() {
  const frage = teil1Fragen[teil1Index];
  let userAntwort = frage.userAntwort;

  if (!userAntwort) {
    userAntwort = document.getElementById("teil1-answer").value.trim();
    frage.userAntwort = userAntwort;
  }

  if (
    userAntwort &&
    frage.richtigeAntwort &&
    userAntwort.trim().toLowerCase() === frage.richtigeAntwort.trim().toLowerCase()
  ) {
    teil1Punkte += frage.punkte || 1;
    document.getElementById("teil1-feedback").textContent = "✅ Richtig!";
  } else {
    document.getElementById("teil1-feedback").textContent =
      ❌ Falsch. Richtige Antwort: ${frage.richtigeAntwort};
  }

  setTimeout(() => {
    teil1Index++;
    if (teil1Index < teil1Fragen.length) {
      showTeil1Frage();
    } else {
      showTeil1Ergebnis();
    }
  }, 1500);
}

function showTeil1Ergebnis() {
  document.getElementById("teil1-container").classList.add("hidden");
  const ergebnis = Teil 1 abgeschlossen. Punkte: ${teil1Punkte} / ${berechneMaxPunkte(teil1Fragen)}.;
  document.getElementById("teil1-result").textContent = ergebnis;
  document.getElementById("teil1-result").classList.remove("hidden");
  maybeShowFinalResult();
}

function berechneMaxPunkte(fragen) {
  return fragen.reduce((sum, f) => sum + (f.punkte || 1), 0);
}

function maybeShowFinalResult() {
  if (!document.getElementById("teil2-container")?.classList.contains("hidden") &&
      document.getElementById("teil2-result")?.textContent) {
    const gesamt = teil1Punkte + (window.teil2Punkte || 0);
    const max = berechneMaxPunkte(teil1Fragen) + (window.teil2Max || 0);
    document.getElementById("final-result").classList.remove("hidden");
    document.getElementById("gesamtpunkte").textContent = Gesamtpunktzahl: ${gesamt} / ${max};
  }
}
