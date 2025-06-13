document.addEventListener("DOMContentLoaded", function () {
  fetch("Fallstudien.json")
    .then(resp => resp.json())
    .then(data => {
      // Filter only valid cases (3+ tasks, proper case text)
      let allCases = data.filter(
        f => Array.isArray(f.tasks) && f.tasks.length >= 4 && typeof f.case === "string"
      );
      window.__fallCasesForReload = allCases; // For reload btn
      if (allCases.length === 0) {
        document.getElementById("fallstudien-container").innerHTML =
          "<div style='color:red'>Keine passenden Fallstudien gefunden.</div>";
        return;
      }
      startNewCase(allCases);
    });

  function startNewCase(allCases) {
    const caseObj = allCases[Math.floor(Math.random() * allCases.length)];
    let numTasks = Math.max(3, Math.min(9, caseObj.tasks.length));
    let tasks = [...caseObj.tasks];
    // Shuffle tasks (Fisher-Yates)
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

    // Case statement
    let statement = document.createElement("div");
    statement.className = "fs-case-statement";
    statement.textContent = caseText;
    cont.appendChild(statement);

    // All tasks vertically
    tasks.forEach((task, idx) => {
      let block = document.createElement("div");
      block.className = "fs-task-block";

      let inputId = `fs-input-${task.id || idx}`;

      let q = document.createElement("label");
      q.htmlFor = inputId;
      q.className = "fs-question";
      q.innerHTML = `<b>Aufgabe ${idx + 1}:</b> ${task.frage || "—"}`;
      block.appendChild(q);

      let input = document.createElement("input");
      input.type = (task.input_type === "number") ? "number" : "text";
      input.placeholder = "Ihre Antwort …";
      input.className = "fs-input";
      input.id = inputId;
      block.appendChild(input);

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

    let newCaseBtn = document.createElement("button");
    newCaseBtn.textContent = "Neue Fallstudie";
    newCaseBtn.className = "back-btn";
    newCaseBtn.onclick = function () { startNewCase(window.__fallCasesForReload); };
    cont.appendChild(newCaseBtn);
  }
});
