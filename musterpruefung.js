let examData;
let timerInterval;

function startTimer(duration, display) {
  let timer = duration, minutes, seconds;
  timerInterval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = `⏱️ ${minutes}:${seconds} Minuten`;
    if (--timer < 0) {
      clearInterval(timerInterval);
      alert("⏰ Die Zeit ist um!");
    }
  }, 1000);
}

window.onload = function () {
  fetch("Exams-30-Muster.json")
    .then(res => res.json())
    .then(data => {
      const exams = data.exams;
      const selected = exams[Math.floor(Math.random() * exams.length)];
      examData = selected;
      loadTeil(selected.teil_1, 'questions1', true);
      loadTeil(selected.teil_2, 'questions2', false);
      const timerDisplay = document.getElementById("timer");
      startTimer(110 * 60, timerDisplay);
    })
    .catch(err => console.error("Fehler beim Laden der Prüfungsdaten:", err));
};

function loadTeil(questions, containerId, reveal = true) {
  const container = document.getElementById(containerId);
  questions.forEach((q, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-box";
    const qEl = document.createElement("div");
    qEl.className = "frage";
    qEl.textContent = (idx + 1) + ". " + q.frage;
    wrapper.appendChild(qEl);
    const optionsList = document.createElement("div");
    optionsList.className = "options-list";
    q.antworten.forEach(ans => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = ans;
      btn.onclick = () => {
        q.selected = ans;
        optionsList.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      optionsList.appendChild(btn);
    });
    wrapper.appendChild(optionsList);
    container.appendChild(wrapper);
  });
}

document.getElementById("submit-btn").addEventListener("click", () => {
  let total = 0, correctCount = 0;
  ['teil_1', 'teil_2'].forEach((teil, idx) => {
    const questions = examData[teil];
    questions.forEach(q => {
      total++;
      if (q.selected === q.richtigeAntwort) correctCount++;
    });
  });
  clearInterval(timerInterval);
  document.getElementById("result").innerHTML =
    `<div class="explanation">✅ Ergebnis: <strong>${correctCount} von ${total}</strong> richtig (${Math.round((correctCount / total) * 100)}%)</div>`;
});
