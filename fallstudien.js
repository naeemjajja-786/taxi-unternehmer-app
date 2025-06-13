// --------- fallstudien.js -----------
let allCases = [];
const fsContainer = document.getElementById('fallstudien-container');
const btnNeueFallstudie = document.getElementById('btn-neue-fallstudie');

async function loadFallstudien() {
  const resp = await fetch('Fallstudien.json');
  allCases = await resp.json();
  showRandomCase();
}

function showRandomCase() {
  if (!allCases.length) return;
  const idx = Math.floor(Math.random() * allCases.length);
  renderCase(allCases[idx]);
}

function renderCase(caseData) {
  // 1. Randomisierte Werte generieren
  const vars = {};
  for (const [key, v] of Object.entries(caseData.variables || {})) {
    let min = v.min, max = v.max, step = v.step || 1;
    let nsteps = Math.round((max - min) / step);
    let rnd = min + Math.round(Math.random() * nsteps) * step;
    vars[key] = (Math.round(rnd * 100) / 100); // auf 2 Nachkommastellen runden
  }

  // 2. Hilfsfunktionen
  const interpolate = (str) =>
    typeof str === 'string'
      ? str.replace(/{([^}]+)}/g, (_, k) =>
          vars[k] !== undefined ? vars[k] : '❓'
        )
      : str;

  function evalFormula(expr) {
    if (!expr) return '';
    // Platzhalter ersetzen
    let f = expr.replace(/{([^}]+)}/g, (_, k) => vars[k] ?? 0);
    // Spezielle math functions unterstützen
    f = f.replace(/\bMAX\s*\(([^,]+),([^)]+)\)/gi, 'Math.max($1,$2)')
         .replace(/\bMIN\s*\(([^,]+),([^)]+)\)/gi, 'Math.min($1,$2)')
         .replace(/\bFLOOR\s*\(([^)]+)\)/gi, 'Math.floor($1)')
         .replace(/\bROUND\s*\(([^)]+)\)/gi, 'Math.round($1)');
    try {
      let result = Function(`return (${f});`)();
      return (typeof result === "number" && !isNaN(result)) ? Math.round(result * 100) / 100 : result;
    } catch {
      return '❓';
    }
  }

  // 3. Render HTML
  let html = `<h2 style="margin-bottom:2rem">${interpolate(caseData.case)}</h2>`;

  // Tabelle
  if (caseData.table && caseData.table.length) {
    html += `<table class="fs-table" style="margin-bottom:2.3rem;width:100%;max-width:550px;">`;
    for (const row of caseData.table) {
      html += `<tr><td>${interpolate(row[0])}</td><td style="font-weight:500;text-align:right">${interpolate(row[1])}</td></tr>`;
    }
    html += `</table>`;
  }

  // Tasks
  html += `<div class="fs-tasks">`;
  (caseData.tasks || []).forEach((task, i) => {
    const inputId = `fsinput-${i}-${Math.random().toString(36).slice(2,8)}`;
    html += `<div class="fs-task-block">
      <div class="fs-question">${i+1}. ${interpolate(task.frage)}</div>
      ${
        task.input_type === "text"
          ? `<textarea id="${inputId}" class="fs-input" rows="2" placeholder="Antwort eingeben"></textarea>`
          : `<input type="${task.input_type||'number'}" id="${inputId}" class="fs-input" autocomplete="off" />`
      }
      <button class="fs-show-btn" onclick="zeigeLoesung('${inputId}', '${encodeURIComponent(JSON.stringify(task))}', '${encodeURIComponent(JSON.stringify(vars))}')">Lösung anzeigen</button>
      <div id="fsfeedback-${inputId}" class="fs-feedback" style="display:none"></div>
    </div>`;
  });
  html += `</div>`;

  fsContainer.innerHTML = html;
}

// --------- Lösung anzeigen handler (globale function) ---------
window.zeigeLoesung = function(inputId, encTask, encVars) {
  const task = JSON.parse(decodeURIComponent(encTask));
  const vars = JSON.parse(decodeURIComponent(encVars));
  const inputElem = document.getElementById(inputId);
  const feedback = document.getElementById('fsfeedback-' + inputId);

  let user = (inputElem.value||'').trim();
  let solution = '';

  // interpolate helper
  const interpolate = (str) =>
    typeof str === 'string'
      ? str.replace(/{([^}]+)}/g, (_, k) => vars[k] !== undefined ? vars[k] : '❓')
      : str;

  // Lösung berechnen
  if (task.solution_formula) {
    let expr = task.solution_formula.replace(/{([^}]+)}/g, (_, k) => vars[k] ?? 0);
    expr = expr.replace(/\bMAX\s*\(([^,]+),([^)]+)\)/gi, 'Math.max($1,$2)')
               .replace(/\bMIN\s*\(([^,]+),([^)]+)\)/gi, 'Math.min($1,$2)')
               .replace(/\bFLOOR\s*\(([^)]+)\)/gi, 'Math.floor($1)')
               .replace(/\bROUND\s*\(([^)]+)\)/gi, 'Math.round($1)');
    try {
      solution = Function(`return (${expr});`)();
      solution = (typeof solution === "number" && !isNaN(solution)) ? Math.round(solution * 100) / 100 : solution;
    } catch { solution = '❓'; }
  } else if (task.solution_text) {
    solution = interpolate(task.solution_text);
  } else {
    solution = 'Keine Lösung vorhanden.';
  }

  // Vergleich für number
  let korrekt = false;
  if (task.input_type === "number") {
    let userNum = parseFloat(user.replace(",", "."));
    korrekt = (Math.abs(userNum - solution) < 0.02); // Toleranz
  } else {
    korrekt = (user.toLowerCase().trim() === String(solution).toLowerCase().trim());
  }

  let feedbackMsg = "";
  if (user.length > 0) {
    if (task.input_type === "number") {
      feedbackMsg += korrekt
        ? "✔️ <b>Richtig!</b><br>"
        : "❌ <b>Falsch.</b><br>";
    }
  }
  feedbackMsg += `<b>Lösung:</b> ${solution}<br><span style="color:#555">${interpolate(task.rechnungsweg || '')}</span>`;
  feedback.style.display = "block";
  feedback.innerHTML = feedbackMsg;
};

btnNeueFallstudie.onclick = showRandomCase;

// --------- Start -----------
loadFallstudien();