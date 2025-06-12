
let examData;

// Teil 1 Timer Start (50 Minuten)
window.onload = () => {
  fetch('Exams-30-Muster.json')
    .then(res => res.json())
    .then(data => {
      const exams = data.exams;
      const selected = exams[Math.floor(Math.random() * exams.length)];
      examData = selected;
      loadTeil(selected.teil_1, 'questions1');
      loadTeil(selected.teil_2, 'questions2');
      startTimer(50 * 60, document.getElementById('timer'), () => {
        alert("⏰ Zeit für Teil 1 ist abgelaufen!");
        document.getElementById('next-to-teil2').click();
      });
    });
};

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

function startTimer(duration, display, callback) {
  let timer = duration, minutes, seconds;
  const interval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = `⏱️ ${minutes}:${seconds}`;
    if (--timer < 0) {
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

document.getElementById('next-to-teil2').addEventListener('click', () => {
  document.getElementById('teil1').style.display = 'none';
  document.getElementById('teil2').style.display = 'block';
  startTimer(60 * 60, document.getElementById('timer'), () => {
    alert("⏰ Zeit für Teil 2 ist abgelaufen!");
    document.getElementById('submit-btn').click();
  });
});

document.getElementById('submit-btn').addEventListener('click', () => {
  let total = 0, correctCount = 0;
  ['questions1', 'questions2'].forEach((id, partIndex) => {
    const div = document.getElementById(id);
    const questions = partIndex === 0 ? examData.teil_1 : examData.teil_2;
    Array.from(div.children).forEach((qEl, i) => {
      if (qEl.className === 'question') {
        const ansBtns = qEl.nextSibling;
        const selectedBtn = Array.from(ansBtns.children).find(li => li.firstChild.classList.contains('selected'));
        const selected = selectedBtn ? selectedBtn.firstChild.textContent : null;
        const correct = questions[i].richtigeAntwort;
        if (selected === correct) correctCount++;
        total++;
      }
    });
  });
  const score = Math.round((correctCount / total) * 100);
  document.getElementById('result').innerHTML =
    `<h3>Ergebnis: ${correctCount} von ${total} richtig (${score}%)</h3>`;
});
