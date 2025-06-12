let examData;
let timerInterval;
let currentTeil = 1;
let timeLeft = 0;

function startTimer(duration) {
  clearInterval(timerInterval);
  timeLeft = duration;
  updateTimeDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimeDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (currentTeil === 1) {
        document.getElementById("teil1").style.display = "none";
        document.getElementById("next-btn").style.display = "block";
      } else {
        document.getElementById("submit-btn").style.display = "block";
      }
    }
  }, 1000);
}

function updateTimeDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  document.getElementById("time").textContent = `${minutes}:${seconds}`;
}

function renderTeil(questions, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  questions.forEach((q, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-block";
    wrapper.innerHTML = `
      <p><strong>${index + 1}. ${q.frage}</strong></p>
      <textarea rows="3" data-index="${index}" data-teil="${containerId}"></textarea>
    `;
    container.appendChild(wrapper);
  });
}

function showResults() {
  const resultBox = document.getElementById("result");
  let html = "<h3>📋 Auswertung:</h3>";
  ["teil1", "teil2"].forEach(id => {
    const inputs = document.querySelectorAll(`#${id} textarea`);
    inputs.forEach(input => {
      const teil = id === "teil1" ? examData.teil_1 : examData.teil_2;
      const idx = parseInt(input.getAttribute("data-index"));
      const original = teil[idx];
      const userAnswer = input.value.trim();
      html += `
        <div class="result-block">
          <strong>Frage:</strong> ${original.frage}<br>
          <strong>Ihre Antwort:</strong> ${userAnswer || "<em>Keine Antwort</em>"}<br>
          <strong>Richtige Antwort:</strong> ${original.antwort}<br><hr>
        </div>
      `;
    });
  });
  resultBox.innerHTML = html;
  document.getElementById("submit-btn").style.display = "none";
}

fetch("Exams-30-Muster.json")
  .then(res => res.json())
  .then(data => {
    const selected = data.exams[Math.floor(Math.random() * data.exams.length)];
    examData = selected;
    renderTeil(selected.teil_1, "teil1");
    document.getElementById("teil1").style.display = "block";
    startTimer(50 * 60); // 50 Minuten
  })
  .catch(err => {
    document.getElementById("exam-container").innerHTML = "Fehler beim Laden der Prüfung.";
    console.error(err);
  });

document.getElementById("next-btn").addEventListener("click", () => {
  currentTeil = 2;
  document.getElementById("teil1").style.display = "none";
  document.getElementById("teil2").style.display = "block";
  renderTeil(examData.teil_2, "teil2");
  document.getElementById("next-btn").style.display = "none";
  startTimer(60 * 60); // 60 Minuten
});

document.getElementById("submit-btn").addEventListener("click", () => {
  clearInterval(timerInterval);
  showResults();
});
