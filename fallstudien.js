// WICHTIG: Dieser Code ist komplett kompatibel mit Ihrer Fallstudien.json Struktur!

document.addEventListener("DOMContentLoaded", function () {
  // Fallstudien.json laden
  fetch("Fallstudien.json")
    .then(resp => {
      if (!resp.ok) throw new Error("Fallstudien.json nicht gefunden!");
      return resp.json();
    })
    .then(data => {
      // Filtern: Nur Fälle mit 6 oder mehr Aufgaben
      let allCases = data.filter(
        f => Array.isArray(f.tasks) && f.tasks.length >= 6 && typeof f.case === "string"
      );
      window.__fallCasesForReload = allCases; // für neue Fallstudie
      if (allCases.length === 0) {
        document.getElementById("fallstudien-container").innerHTML =
          "<div style='color:red'>Keine passenden Fallstudien gefunden.</div>";
        return;
      }
      startNewCase(allCases);
    })
    .catch(err => {
      document.getElementById("fallstudien-container").innerHTML =
        "<div style='color:red'>Fehler beim Laden der Fallstudien:<br>" + err.message + "</div>";
    });

  function startNewCase(allCases) {
    // Zufälligen Fall nehmen
    const caseObj = allCases[Math.floor(Math.random() * allCases.length)];
    // 6–9 Aufgaben zufällig auswählen
    let numTasks = Math.max(6, Math.min(9, caseObj.tasks.length));
    let tasks = [...caseObj.tasks];
    for (let i = tasks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
    }
    tasks = tasks.slice(0, numTasks);
    renderCase(caseObj.case, tasks);
  }

  function renderCase(caseText, tasks) {
    const cont = document.getElementById("fallstudien-container");
    cont.innerHTML = "";

    // Fallbeschreibung
    let statement = document.createElement("div");
    statement.className = "fs-case-statement";
    statement.textContent = caseText;
    cont.appendChild(statement);

    // Jede Aufgabe rendern
    tasks.forEach((task, idx) => {
      let block = document.createElement("div");
      block.className = "fs-task-block";

      // Eindeutige input id
      let inputId = `fs-input-${task.id || idx}`;

      // Frage
      let q = document.createElement("label");
      q.htmlFor = inputId;
      q.className = "fs-question";
      q.innerHTML = `<b>Aufgabe ${idx + 1}:</b> ${task.frage || "—"}`;
      block.appendChild(q);

      // Antwortfeld
      let input = document.createElement("input");
      input.type = (task.input_type === "number") ? "number" : "text";
      input.placeholder = "Ihre Antwort …";
      input.className = "fs-input";
      input.id = inputId;
      block.appendChild(input);

      // Lösung anzeigen-Button
      let btn = document.createElement("button");
      btn.textContent = "Lösung anzeigen";
      btn.className = "fs-show-btn";
      btn.onclick = function () {
        let fb = document.createElement("div");
        fb.className = "fs-feedback";
        if (task.solution_text && task.solution_text.trim()) {
          fb.innerHTML = `<strong>Richtige Lösung:</strong> ${task.solution_text}<br>`;
        }
        if (task.rechnungsweg) {
          fb.innerHTML += `<strong>Rechnungsweg:</strong> ${task.rechnungsweg}`;
        }
        block.appendChild(fb);
        btn.disabled = true;
        input.disabled = true;
      };
      block.appendChild(btn);

      cont.appendChild(block);
    });

    // Neue Fallstudie-Button
    let newCaseBtn = document.createElement("button");
    newCaseBtn.textContent = "Neue Fallstudie";
    newCaseBtn.className = "back-btn";
    newCaseBtn.onclick = function () { startNewCase(window.__fallCasesForReload); };
    cont.appendChild(newCaseBtn);
  }
});