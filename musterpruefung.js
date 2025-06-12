let examData;
let duration = 110 * 60; // 110 minutes

function startTimer() {
  const timerEl = document.getElementById("timer");
  let interval = setInterval(() => {
    let minutes = Math.floor(duration / 60);
    let seconds = duration % 60;
    timerEl.textContent = `⏳ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (duration <= 0) {
      clearInterval(interval);
      document.getElementById("submit-btn").click();
    }
    duration--;
  }, 1000);
}

function loadTeil(questions, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  questions.forEach((q, idx) => {
    const qEl = document.createElement("div");
    qEl.className = "question";
    qEl.textContent = `${idx + 1}. ${q.frage}`;
    container.appendChild(qEl);

    const ul = document.createElement("ul");
    ul.className = "options";

    q.antworten.forEach(ans => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "option-button";
      btn.textContent = ans;
      btn.onclick = () => {
        q.selected = ans;
        Array.from(ul.children).forEach(li => li.firstChild.classList.remove("selected"));
        btn.classList.add("selected");
      };
      li.appendChild(btn);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  });
}

fetch("Exams-30-Muster.json")
  .then(res => res.json())
  .then(data => {
    const exams = data.exams;
    const selected = exams[Math.floor(Math.random() * exams.length)];
    examData = selected;
    loadTeil(selected.teil_1, "questions1");
    loadTeil(selected.teil_2, "questions2");
    startTimer();
  })
  .catch(err => {
    console.error("Fehler beim Laden der Prüfung:", err);
  });

document.getElementById("submit-btn").addEventListener("click", () => {
  let total = 0, correct = 0;
  ["questions1", "questions2"].forEach((id, partIdx) => {
    const div = document.getElementById(id);
    Array.from(div.children).forEach((child, i) => {
      if (child.className === "question") {
        const answers = div.children[i + 1];
        const selectedBtn = Array.from(answers.children).find(li => li.firstChild.classList.contains("selected"));
        const selected = selectedBtn ? selectedBtn.firstChild.textContent : null;
        const correctAns = (partIdx === 0 ? examData.teil_1[i / 2] : examData.teil_2[i / 2]).richtigeAntwort;
        if (selected === correctAns) correct++;
        total++;
      }
    });
  });

  document.getElementById("result").innerHTML = 
    `<h3>Ergebnis: ${correct} von ${total} richtig (${Math.round((correct / total) * 100)}%)</h3>`;
});
