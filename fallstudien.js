document.addEventListener("DOMContentLoaded", function () {
  let allCases = [];
  let shuffledTasks = [];
  let currentCase = null;
  let currentTaskIdx = 0;

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
    currentCase = allCases[Math.floor(Math.random() * allCases.length)];
    shuffledTasks = shuffle(currentCase.tasks.slice()).slice(0, Math.min(9, Math.max(6, currentCase.tasks.length)));
    currentTaskIdx = 0;
    renderCurrentTask();
  }

  function renderCurrentTask() {
    const c = currentCase;
    const task = shuffledTasks[currentTaskIdx];
    const cont = document.getElementById("fallstudien-container");
    cont.innerHTML = "";

    let title = document.createElement("h2");
    title.textContent = c.title;
    cont.appendChild(title);

    let t = document.createElement("div");
    t.className = "fs-question";
    t.innerHTML = `<b>Aufgabe ${currentTaskIdx + 1}:</b> ${task.frage || "—"}`;
    cont.appendChild(t);

    let input = document.createElement("input");
    input.type = (task.input_type === "number") ? "number" : "text";
    input.placeholder = "Ihre Antwort …";
    input.className = "fs-input";
    cont.appendChild(input);

    // حل کا بٹن
    let btn = document.createElement("button");
    btn.textContent = "Rechnungsweg anzeigen";
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
      cont.appendChild(fb);
      btn.disabled = true;
      input.disabled = true;
    };
    cont.appendChild(btn);

    // نیویگیشن بٹن
    let nav = document.createElement("div");
    nav.className = "fs-nav";
    if (currentTaskIdx > 0) {
      let prev = document.createElement("button");
      prev.textContent = "Zurück";
      prev.onclick = () => { currentTaskIdx--; renderCurrentTask(); };
      nav.appendChild(prev);
    }
    if (currentTaskIdx < shuffledTasks.length - 1) {
      let next = document.createElement("button");
      next.textContent = "Weiter";
      next.onclick = () => { currentTaskIdx++; renderCurrentTask(); };
      nav.appendChild(next);
    }
    cont.appendChild(nav);

    // Neue Fallstudie
    let newCaseBtn = document.createElement("button");
    newCaseBtn.textContent = "Neue Fallstudie";
    newCaseBtn.className = "back-btn";
    newCaseBtn.onclick = startNewCase;
    cont.appendChild(newCaseBtn);
  }

  loadFallstudien();
});