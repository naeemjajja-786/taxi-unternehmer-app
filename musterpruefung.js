let examData;
let timerInterval;
let timeLeft = 110 * 60;

function startTimer() {
  const timerDisplay = document.getElementById('timer');
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `⏳ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      alert("⏰ Zeit ist abgelaufen!");
      document.getElementById('submit-btn').click();
    }
  }, 1000);
}

fetch('Exams-30-Muster.json')
  .then(res => res.json())
  .then(data => {
    const exams = data.exams;
    const selected = exams[Math.floor(Math.random() * exams.length)];
    examData = selected;
    loadTeil(selected.teil_1, 'questions1');
    loadTeil(selected.teil_2, 'questions2');
    startTimer();
  })
  .catch(err => console.error(err));

function loadTeil(questions, containerId) {
  const container = document.getElementById(containerId);
  questions.forEach((q, idx) => {
    const qEl = document.createElement('div');
    qEl.className = 'question';
    qEl.textContent = (idx + 1) + ". " + q.frage;
    container.appendChild(qEl);

    const optionsList = document.createElement('ul');
    optionsList.className = 'options';
    q.antworten.forEach(ans => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'option-button';
      btn.textContent = ans;
      btn.onclick = () => {
        q.selected = ans;
        Array.from(optionsList.children).forEach(l => l.firstChild.classList.remove('selected'));
        btn.classList.add('selected');
      };
      li.appendChild(btn);
      optionsList.appendChild(li);
    });
    container.appendChild(optionsList);
  });
}

document.getElementById('submit-btn').addEventListener('click', () => {
  clearInterval(timerInterval);
  let total = 0, correctCount = 0;
  ['questions1', 'questions2'].forEach((id, partIndex) => {
    const questions = partIndex === 0 ? examData.teil_1 : examData.teil_2;
    const div = document.getElementById(id);
    const questionBlocks = div.querySelectorAll('.question');
    questionBlocks.forEach((qEl, i) => {
      const options = qEl.nextElementSibling;
      const selectedBtn = Array.from(options.children).find(li => li.firstChild.classList.contains('selected'));
      const selected = selectedBtn ? selectedBtn.firstChild.textContent : null;
      const correct = questions[i].richtigeAntwort;
      if (selected === correct) {
        correctCount++;
      }
      total++;
    });
  });
  const score = Math.round((correctCount / total) * 100);
  document.getElementById('result').innerHTML = 
    `<h3>Ergebnis: ${correctCount} von ${total} richtig (${score}%)</h3>`;
});
