
let examData;
let currentTeil = 1;
let timeLeft = 50 * 60;
let timerInterval;

fetch('Exams-30-Muster-FINAL-COMPLETE.json')
  .then(res => res.json())
  .then(data => {
    const selected = data.exams[Math.floor(Math.random() * data.exams.length)];
    examData = selected;
    loadTeil(selected.teil_1, 'questions1');
    startTimer();
  });

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      if (currentTeil === 1) {
        switchToTeil2();
      } else {
        clearInterval(timerInterval);
        submitExam();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  document.getElementById("time").textContent = `${minutes}:${seconds}`;
}

function loadTeil(questions, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  questions.forEach((q, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'question-block';

    const qText = document.createElement('p');
    qText.className = 'question';
    qText.textContent = (idx + 1) + '. ' + q.frage;
    wrapper.appendChild(qText);

    const ul = document.createElement('ul');
    ul.className = 'options';

    q.antworten.forEach(ans => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'option-button';
      btn.textContent = ans;
      btn.onclick = () => {
        q.selected = ans;
        Array.from(ul.children).forEach(child => child.firstChild.classList.remove('selected'));
        btn.classList.add('selected');
      };
      li.appendChild(btn);
      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
    container.appendChild(wrapper);
  });
}

document.getElementById('to-teil2').onclick = () => {
  currentTeil = 2;
  timeLeft = 60 * 60;
  document.getElementById('teil1').style.display = 'none';
  document.getElementById('teil2').style.display = 'block';
  loadTeil(examData.teil_2, 'questions2');
};

document.getElementById('submit-btn').onclick = submitExam;

function submitExam() {
  clearInterval(timerInterval);
  let total = 0, correct = 0, score = 0;

  ['teil_1', 'teil_2'].forEach((teil, index) => {
    examData[teil].forEach(q => {
      total++;
      if (q.selected === q.richtigeAntwort) correct++;
      if (q.punkte && q.selected === q.richtigeAntwort) score += q.punkte;
    });
  });

  const percent = Math.round((correct / total) * 100);
  document.getElementById('result').innerHTML = `
    <h3>Ergebnis</h3>
    <p>${correct} von ${total} richtig (${percent}%)</p>
    <p>Gesamtpunktzahl: ${score}</p>
  `;
}
