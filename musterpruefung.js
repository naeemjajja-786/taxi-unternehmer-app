let examData, timer, countdown;
let currentTeil = 1;
const timerElement = document.getElementById("timer");

fetch('Exams-30-Muster.json')
  .then(res => res.json())
  .then(data => {
    const selected = data.exams[Math.floor(Math.random() * data.exams.length)];
    examData = selected;
    renderTeil(selected.teil_1, 'questions1');
    startTimer(50 * 60); // 50 Minuten für Teil 1
  });

function renderTeil(questions, containerId) {
  const container = document.getElementById(containerId);
  questions.forEach((q, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "frageblock";
    wrapper.innerHTML = `
      <div class="question"><strong>${idx + 1}.</strong> ${q.frage}</div>
      <textarea class="antwort" data-index="${idx}" rows="3" placeholder="Antwort schreiben..."></textarea>
    `;
    container.appendChild(wrapper);
  });
}

function startTimer(seconds) {
  clearInterval(countdown);
  updateTimerDisplay(seconds);
  countdown = setInterval(() => {
    seconds--;
    updateTimerDisplay(seconds);
    if (seconds <= 0) {
      clearInterval(countdown);
      if (currentTeil === 1) {
        document.getElementById("teil2-btn").classList.remove("hidden");
        alert("Teil 1 ist beendet. Jetzt kannst du Teil 2 starten.");
      } else {
        document.getElementById("submit-btn").classList.remove("hidden");
        alert("Teil 2 ist beendet. Du kannst jetzt abschließen.");
      }
    }
  }, 1000);
}

function updateTimerDisplay(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  timerElement.textContent = `🕒 ${min}:${sec < 10 ? "0" + sec : sec}`;
}

document.getElementById("teil2-btn").addEventListener("click", () => {
  document.getElementById("teil1").classList.add("hidden");
  document.getElementById("teil2").classList.remove("hidden");
  document.getElementById("teil2-btn").classList.add("hidden");
  currentTeil = 2;
  renderTeil(examData.teil_2, 'questions2');
  startTimer(60 * 60); // 60 Minuten für Teil 2
});

document.getElementById("submit-btn").addEventListener("click", () => {
  document.getElementById("submit-btn").classList.add("hidden");
  const antworten = document.querySelectorAll("textarea.antwort");
  let antwortText = "<h3>Deine Antworten</h3><ol>";
  antworten.forEach(a => {
    antwortText += `<li>${a.value.trim() || "<em>(keine Antwort)</em>"}</li>`;
  });
  antwortText += "</ol>";
  document.getElementById("result").innerHTML = antwortText;
});
