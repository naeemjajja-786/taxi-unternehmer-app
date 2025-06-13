document.addEventListener("DOMContentLoaded", function () {
  let allCases = [];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function loadFallstudien() {
    fetch("Fallstudien.json")
      .then(resp => resp.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          document.getElementById("fallstudien-container").innerHTML =
            "<div style='color:red'>Keine Fallstudien gefunden.</div>";
        } else {
          allCases = data.filter(f => Array.isArray(f.tasks) && f.tasks.length >= 6);
          startNewCase();
        }
      })
      .catch(e => {
        document.getElementById("fallstudien-container").innerHTML =
          "<div style='color:red'>Fehler beim Laden der Fallstudien.<br>" + e.message + "</div>";
      });
  }

  function startNewCase() {
    if (allCases.length === 0) {
      document.getElementById("fallstudien-container").innerHTML =
        "<div style='color:red'>Keine passenden Fallstudien gefunden.</div>";
      return;
    }
    // Random case
    const chosen = allCases[Math.floor(Math.random() * allCases.length)];
    // Shuffle & pick 1–9 tasks
    let minTasks = 1, maxTasks = 9;
    let numTasks = Math.max(minTasks, Math.min(maxTasks, chosen.tasks.length));
    let tasks = shuffle(chosen.tasks.slice()).slice(0, numTasks);

    renderCase(chosen, tasks);
  }

  function renderCase(c, tasks) {
    const cont = document.getElementById("fallstudien-container");
    cont.innerHTML = "";

    // Case statement only (no topic)
    let statement = document.createElement("div");
    statement.className = "fs-case-statement";
    statement.textContent = c.case;
    cont.appendChild(statement);

    // All tasks vertically
    tasks.forEach((task, i) => {
      let block = document.createElement("div");
      block.className = "fs-task-block";

      // Task no. & question
      let q = document.createElement("div");
      q.className = "fs-question";
      q.innerHTML = `<b>Aufgabe ${i + 1}:</b> ${task.frage || "—"}`;
      block.appendChild(q);

      // Input field
      let input = document.createElement("input");
      input.type = (task.input_type === "number") ? "number" : "text";
      input.placeholder = "Ihre Antwort …";
      input.className = "fs-input";
      block.appendChild(input);

      // Lösung anzeigen
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

    // New case button below all
    let newCaseBtn = document.createElement("button");
    newCaseBtn.textContent = "Neue Fallstudie";
    newCaseBtn.className = "back-btn";
    newCaseBtn.onclick = startNewCase;
    cont.appendChild(newCaseBtn);
  }

  loadFallstudien();
});
