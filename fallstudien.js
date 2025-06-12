function $(id) {
  return document.getElementById(id);
}

let allCases = [];

// Fetch the case studies JSON on page load and show the list
window.onload = function() {
  fetch("Fallbeistudien.json")
    .then(res => res.json())
    .then(data => {
      allCases = Array.isArray(data) ? data : [];
      renderFallList();
    })
    .catch(() => {
      $("dynamic-content").innerHTML = "<p>❌ Fallstudien konnten nicht geladen werden.</p>";
    });
};

// Render the list of all case studies
function renderFallList() {
  if (!allCases.length) {
    $("dynamic-content").innerHTML = "<p>⚠️ Keine Fallstudien verfügbar.</p>";
    return;
  }
  let html = "<h3>Alle Fallstudien:</h3>";
  allCases.forEach((cs, idx) => {
    html += `<button class="sub-btn" onclick="openCase(${idx})">${cs.title}</button><br>`;
  });
  html += `<br><button class="back-btn" onclick="window.location.href='index.html'">← Zurück zum Hauptmenü</button>`;
  $("dynamic-content").innerHTML = html;
}

// Open a specific case study by index, showing its details
function openCase(index) {
  const cs = allCases[index];
  if (!cs) {
    // If no data found, go back to list
    return renderFallList();
  }
  let html = `<h3>${cs.title}</h3>`;
  if (cs.question && cs.question.trim() !== "") {
    // Preserve line breaks in the question text
    const qText = cs.question.replace(/\n/g, "<br>");
    html += `<p>${qText}</p>`;
  } else {
    html += `<p><em>Keine Aufgabenstellung verfügbar.</em></p>`;
  }
  // Placeholder for solution content
  html += `<div id="solution-box"></div>`;
  // Button to show the solution (if any), and a back button to return to list
  html += `<br><button id="show-solution-btn" class="sub-btn" onclick="showSolution(${index})">Lösung anzeigen</button><br>`;
  html += `<button class="back-btn" onclick="renderFallList()">← Zurück</button>`;
  $("dynamic-content").innerHTML = html;
}

// Display the solution and explanation for a given case study
function showSolution(index) {
  const cs = allCases[index];
  if (!cs || !cs.feedback) return;
  const sol = cs.feedback;
  let html = "";
  if (sol.solution_text && sol.solution_text.trim() !== "") {
    const solText = sol.solution_text.replace(/\n/g, "<br>");
    html += `<div class="explanation"><strong>Lösung:</strong><br>${solText}</div>`;
  }
  if (sol.explanation && sol.explanation.trim() !== "") {
    html += `<div class="hinweis">${sol.explanation}</div>`;
  }
  const solutionBox = $("solution-box");
  if (solutionBox) {
    solutionBox.innerHTML = html;
  }
  // Hide the "Show Solution" button after revealing the solution
  const btn = $("show-solution-btn");
  if (btn) {
    btn.style.display = "none";
  }
}
