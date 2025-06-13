// === teil2.js ===

let teil2Fragen = [];
let teil2AktuelleFrage = 0;
let teil2Punkte = 0;

async function ladeTeil2Fragen() {
  try {
    const res = await fetch('Exams-Teil2.json');
    const data = await res.json();
    teil2Fragen = data;
    teil2AktuelleFrage = 0;
    teil2Punkte = 0;
    zeigeTeil2Frage();
  } catch (err) {
    document.getElementById('question-text').innerText = 'Fehler beim Laden der Teil 2 Prüfungsdaten: ' + err;
  }
}

function zeigeTeil2Frage() {
  const frageBlock = teil2Fragen[teil2AktuelleFrage];
  const questionDiv = document.getElementById('question-text');
  const numberDiv = document.getElementById('question-number');
  const feedbackDiv = document.getElementById('feedback');

  if (!frageBlock) {
    zeigeTeil2Ergebnis();
    return;
  }

  feedbackDiv.innerHTML = '';
  numberDiv.innerText = Teil 2 – Fallstudie ${teil2AktuelleFrage + 1} von ${teil2Fragen.length};

  let html = <strong>${frageBlock.fallstudie}</strong><br/><br/>;

  frageBlock.tasks.forEach((task, index) => {
    html += <div><strong>${task.frage}</strong><br/> +
            <textarea id="answer-${index}" placeholder="Antwort eingeben..."></textarea></div><br/>;
  });

  html += <button onclick="pruefeTeil2Antworten()">Antworten überprüfen</button>;
  questionDiv.innerHTML = html;
}

function pruefeTeil2Antworten() {
  const frageBlock = teil2Fragen[teil2AktuelleFrage];
  const feedbackDiv = document.getElementById('feedback');
  let richtigInDieserFrage = 0;
  let punkteInDieserFrage = 0;

  let feedbackHTML = '<h4>Rückmeldung:</h4><ul>';

  frageBlock.tasks.forEach((task, index) => {
    const userInput = document.getElementById(answer-${index}).value.trim().toLowerCase();
    const correct = task.richtigeAntwort.trim().toLowerCase();
    const istRichtig = userInput === correct;
    if (istRichtig) richtigInDieserFrage++;
    if (istRichtig) teil2Punkte += task.punkte;
    punkteInDieserFrage += task.punkte;
    feedbackHTML += <li>${task.frage}<br/><em>Ihre Antwort:</em> ${userInput || 'Keine Antwort'}<br/><em>Richtige Antwort:</em> ${task.richtigeAntwort} – <strong>${istRichtig ? 'Richtig' : 'Falsch'}</strong> (${task.punkte} Punkte)</li>;
  });

  feedbackHTML += '</ul>';
  feedbackHTML += <p><strong>Punkte in dieser Fallstudie: ${richtigInDieserFrage} / ${frageBlock.tasks.length}</strong></p>;

  feedbackDiv.innerHTML = feedbackHTML;
  teil2AktuelleFrage++;

  setTimeout(() => {
    zeigeTeil2Frage();
  }, 3000);
}

function zeigeTeil2Ergebnis() {
  document.getElementById('quiz-container').classList.add('hidden');
  const resultBox = document.getElementById('teil2-result');
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = <h2>Teil 2 abgeschlossen</h2><p>Gesamtpunkte Teil 2: ${teil2Punkte}</p>;
  document.getElementById('final-result').classList.remove('hidden');
  aktualisiereGesamtpunkte();
}
