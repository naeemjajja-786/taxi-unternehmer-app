// JS für die Musterprüfung (Teil 1 & Teil 2)
let teil1Fragen = [];
let teil2Fallstudien = [];
let currentTeil = null;
let currentIndex = 0;
let userPointsTeil1 = 0;
let userPointsTeil2 = 0;

function ladeDaten() {
  Promise.all([
    fetch('Exams-Teil1.json').then(r => r.json()),
    fetch('Exams-Teil2.json').then(r => r.json())
  ]).then(([teil1, teil2]) => {
    teil1Fragen = shuffleArray(teil1);
    teil2Fallstudien = shuffleArray(teil2);
    document.getElementById('startContainer').style.display = 'block';
  }).catch(err => {
    alert('Fehler beim Laden der Prüfungsdaten: ' + err);
  });
}

document.addEventListener('DOMContentLoaded', ladeDaten);

function starteTeil(teil) {
  currentTeil = teil;
  currentIndex = 0;
  userPointsTeil1 = 0;
  userPointsTeil2 = 0;
  document.getElementById('startContainer').style.display = 'none';
  document.getElementById('quizContainer').style.display = 'block';
  zeigeNaechsteFrage();
}

function zeigeNaechsteFrage() {
  const container = document.getElementById('frageContainer');
  container.innerHTML = '';

  if (currentTeil === 1 && currentIndex < teil1Fragen.length) {
    const frageObj = teil1Fragen[currentIndex];
    container.innerHTML = `
      <div><strong>Frage ${currentIndex + 1}:</strong> ${frageObj.frage}</div>
      <textarea id="antwortInput" rows="3" placeholder="Ihre Antwort..."></textarea>
      <button onclick="bewerteAntwort()">Antwort prüfen</button>
    `;
  } else if (currentTeil === 2 && currentIndex < teil2Fallstudien.length) {
    const fallObj = teil2Fallstudien[currentIndex];
    container.innerHTML = `<div><strong>Fallstudie ${currentIndex + 1}:</strong> ${fallObj.fallstudie}</div>`;
    fallObj.tasks.forEach((task, i) => {
      container.innerHTML += `
        <div><strong>Teilaufgabe ${i + 1}:</strong> ${task.frage}</div>
        <textarea id="antwortInput${i}" rows="2" placeholder="Ihre Antwort..."></textarea>
      `;
    });
    container.innerHTML += '<button onclick="bewerteAntwort()">Antworten prüfen</button>';
  } else {
    zeigeErgebnis();
  }
}

function bewerteAntwort() {
  if (currentTeil === 1) {
    const input = document.getElementById('antwortInput').value.trim().toLowerCase();
    const korrekt = teil1Fragen[currentIndex].richtigeAntwort.trim().toLowerCase();
    if (input === korrekt) {
      userPointsTeil1 += teil1Fragen[currentIndex].punkte;
    }
    currentIndex++;
    zeigeNaechsteFrage();

  } else if (currentTeil === 2) {
    const fall = teil2Fallstudien[currentIndex];
    fall.tasks.forEach((task, i) => {
      const userAntwort = document.getElementById('antwortInput' + i).value.trim().toLowerCase();
      const richtigeAntwort = task.richtigeAntwort.trim().toLowerCase();
      if (userAntwort === richtigeAntwort) {
        userPointsTeil2 += task.punkte;
      }
    });
    currentIndex++;
    zeigeNaechsteFrage();
  }
}

function zeigeErgebnis() {
  document.getElementById('quizContainer').style.display = 'none';
  const ergebnis = document.getElementById('ergebnisContainer');
  ergebnis.style.display = 'block';
  ergebnis.innerHTML = `
    <h2>Ergebnis</h2>
    <p><strong>Teil 1 Punkte:</strong> ${userPointsTeil1}</p>
    <p><strong>Teil 2 Punkte:</strong> ${userPointsTeil2}</p>
    <p><strong>Gesamt:</strong> ${userPointsTeil1 + userPointsTeil2}</p>
    <button onclick="location.reload()">Neu starten</button>
  `;
}

function shuffleArray(arr) {
  return arr.map(x => [Math.random(), x]).sort().map(x => x[1]);
}