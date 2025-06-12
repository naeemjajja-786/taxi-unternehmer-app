let examData;
let userAnswers = { teil_1: [], teil_2: [] };
let timer1, timer2;
let seconds1 = 50 * 60;
let seconds2 = 60 * 60;

function startTimer(seconds, displayId, callback) {
  const timerInterval = setInterval(() => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    document.getElementById(displayId).textContent = `⏳ ${min}:${sec.toString().padStart(2, "0")}`;
    seconds--;
    if (seconds < 0) {
      clearInterval(timerInterval);
      callback();
    }
  }, 1000);
  return timerInterval;
}

function renderQuestion(q, index, teilName) {
  const container = document.createElement("div");
  container.className = "question-block";
  const qText = document.createElement("p");
  qText.innerHTML = `<strong>${index + 1}. ${q.frage}</strong>`;
  container.appendChild(qText);

  if (q.antworten) {
    const ul = document.createElement("ul");
    ul.className = "options";
    q.antworten.forEach(ans => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "option-button";
      btn.textContent = ans;
      btn.onclick = () => {
        userAnswers[teilName][index] = ans;
        Array.from(ul.children).forEach(b => b.firstChild.classList.remove("selected"));
        btn.classList.add("selected");
      };
      li.appendChild(btn);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  } else if (q.antwort !== undefined) {
    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.oninput = () => userAnswers[teilName][index] = textarea.value.trim();
    container.appendChild(textarea);
  }

  return container;
}

function loadExam(data) {
  examData = data.exams[Math.floor(Math.random() * data.exams.length)];

  const t1 = document.getElementById("teil1-questions");
  examData.teil_1.forEach((q, i) => {
    t1.appendChild(renderQuestion(q, i, "teil_1"));
  });

  const t2 = document.getElementById("teil2-questions");
  examData.teil_2.forEach((q, i) => {
    t2.appendChild(renderQuestion(q, i, "teil_2"));
  });

  timer1 = startTimer(seconds1, "timer1", finishTeil1);
}

function finishTeil1() {
  clearInterval(timer1);
  document.getElementById("teil1-container").style.display = "none";
  document.getElementById("teil2-container").style.display = "block";
  timer2 = startTimer(seconds2, "timer2", finishExam);
}

function finishExam() {
  clearInterval(timer2);
  let total = 0, correct = 0;
  ["teil_1", "teil_2"].forEach(teil => {
    examData[teil].forEach((q, i) => {
      const given = userAnswers[teil][i];
      if (q.richtigeAntwort && given === q.richtigeAntwort) correct++;
      total++;
    });
  });

  document.getElementById("teil2-container").style.display = "none";
  document.getElementById("result").innerHTML = `
    <h3>Ergebnis</h3>
    <p>${correct} von ${total} Fragen richtig beantwortet. (${Math.round(correct / total * 100)}%)</p>
  `;
}

fetch("Exams-30-Muster.json")
  .then(res => res.json())
  .then(loadExam)
  .catch(err => {
    document.getElementById("app").innerHTML = `<p>❌ Fehler beim Laden der Prüfung.</p>`;
    console.error(err);
  });
