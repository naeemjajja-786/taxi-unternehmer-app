let teil1, teil2;

window.onload = () => {
  Promise.all([
    fetch('Exams-Teil1.json').then(r => r.json()),
    fetch('Exams-Teil2.json').then(r => r.json())
  ]).then(([teil1data, teil2data]) => {
    // Zufällige Fragen, 30 von Teil1, 10 von Teil2 (یا اپنی ضرورت)
    teil1 = shuffle(teil1data).slice(0, 30);
    teil2 = shuffle(teil2data).slice(0, 10);
    renderTeil1();
    startTimer(50 * 60, document.getElementById('timer'), () => {
      alert("⏰ Zeit für Teil 1 ist abgelaufen!");
      document.getElementById('next-to-teil2').click();
    });
  });
};

function renderTeil1() {
  const container = document.getElementById('questions1');
  container.innerHTML = "";
  teil1.forEach((q, idx) => {
    let html = `<div class="question">${idx + 1}. ${q.frage}</div>`;
    if (q.antworten && Array.isArray(q.antworten)) {
      html += '<ul class="options">';
      q.antworten.forEach(ans => {
        html += `<li><button class="option-button" onclick="selectOption('teil1',${idx},this)">${ans}</button></li>`;
      });
      html += '</ul>';
    } else {
      html += `<input type="text" placeholder="Antwort eingeben..." oninput="saveInput('teil1',${idx},this)">`;
    }
    container.innerHTML += html;
  });
}

function renderTeil2() {
  const container = document.getElementById('questions2');
  container.innerHTML = "";
  let qNum = 0;
  teil2.forEach((q, idx) => {
    // Fallstudie
    if (q.fallstudie && Array.isArray(q.tasks)) {
      container.innerHTML += `<div class="question"><b>Fallstudie:</b> ${q.fallstudie}</div>`;
      q.tasks.forEach((t, tIdx) => {
        container.innerHTML += `<div class="question">${++qNum}. ${t.frage}</div>
        <input type="text" placeholder="Antwort eingeben..." oninput="saveTaskInput(${idx},${tIdx},this)">`;
      });
    } else {
      container.innerHTML += `<div class="question">${++qNum}. ${q.frage}</div>`;
      if (q.antworten && Array.isArray(q.antworten)) {
        container.innerHTML += `<ul class="options">`;
        q.antworten.forEach(ans => {
          container.innerHTML += `<li><button class="option-button" onclick="selectOption('teil2',${idx},this)">${ans}</button></li>`;
        });
        container.innerHTML += `</ul>`;
      } else {
        container.innerHTML += `<input type="text" placeholder="Antwort eingeben..." oninput="saveInput('teil2',${idx},this)">`;
      }
    }
  });
}

// Option & Input Handling
function selectOption(teil, idx, btn) {
  const parent = btn.parentElement.parentElement;
  Array.from(parent.children).forEach(li => li.firstChild.classList.remove('selected'));
  btn.classList.add('selected');
  if (teil === 'teil1') teil1[idx].selected = btn.textContent;
  else teil2[idx].selected = btn.textContent;
}
function saveInput(teil, idx, input) {
  if (teil === 'teil1') teil1[idx].selected = input.value;
  else teil2[idx].selected = input.value;
}
function saveTaskInput(qIdx, tIdx, input) {
  if (!teil2[qIdx].tasks[tIdx]) teil2[qIdx].tasks[tIdx] = {};
  teil2[qIdx].tasks[tIdx].selected = input.value;
}

// Teil wechseln
document.getElementById('next-to-teil2').onclick = function() {
  document.getElementById('teil1').style.display = 'none';
  document.getElementById('teil2').style.display = 'block';
  startTimer(60 * 60, document.getElementById('timer'), () => {
    alert("⏰ Zeit für Teil 2 ist abgelaufen!");
    document.getElementById('submit-btn').click();
  });
  renderTeil2();
};

document.getElementById('submit-btn').onclick = function() {
  let total = 0, correct = 0;
  teil1.forEach(q => {
    total++;
    if (typeof q.selected === "string" && q.selected.trim().toLowerCase() === q.richtigeAntwort.trim().toLowerCase()) correct++;
  });
  teil2.forEach(q => {
    if (q.fallstudie && Array.isArray(q.tasks)) {
      q.tasks.forEach(t => {
        total++;
        if (typeof t.selected === "string" && t.selected.trim().toLowerCase() === t.richtigeAntwort.trim().toLowerCase()) correct++;
      });
    } else {
      total++;
      if (typeof q.selected === "string" && q.selected.trim().toLowerCase() === q.richtigeAntwort.trim().toLowerCase()) correct++;
    }
  });
  document.getElementById('result').innerHTML = `<h3>Ergebnis: ${correct} von ${total} richtig (${Math.round((correct/total)*100)}%)</h3>`;
};

// Timer
function startTimer(seconds, node, cb) {
  let rem = seconds;
  function update() {
    let min = Math.floor(rem / 60);
    let sec = rem % 60;
    node.textContent = `⏰ ${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    if (rem > 0) { rem--; setTimeout(update, 1000);}
    else if (cb) cb();
  }
  update();
}

function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
