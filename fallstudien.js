// اس حصے کو اپنے Fallstudien JS میں رکھیں

let fallstudienData = [];
let currentIdx = 0;

function loadFallstudien() {
  fetch("Fallstudien.json")
    .then(resp => resp.json())
    .then(data => {
      fallstudienData = data;
      currentIdx = 0;
      renderFallstudie(currentIdx);
    })
    .catch(e => {
      document.getElementById("fallstudien-container").innerHTML =
        "<div style='color:red'>Fehler beim Laden der Fallstudien.<br>" + e.message + "</div>";
    });
}

function renderFallstudie(idx) {
  const c = fallstudienData[idx];
  const cont = document.getElementById("fallstudien-container");
  cont.innerHTML = "";

  let title = document.createElement("h2");
  title.textContent = c.title;
  cont.appendChild(title);

  if (c.question && c.question.trim()) {
    let q = document.createElement("div");
    q.className = "fs-question";
    q.textContent = c.question;
    cont.appendChild(q);
  }

  // Input field (text)
  let input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ihre Antwort …";
  input.className = "fs-input";
  cont.appendChild(input);

  let btn = document.createElement("button");
  btn.textContent = "Lösung anzeigen";
  btn.onclick = function() {
    // Feedback show
    let fb = document.createElement("div");
    fb.className = "fs-feedback";
    if (c.feedback.solution_text && c.feedback.solution_text.trim()) {
      fb.innerHTML = `<strong>Richtige Lösung:</strong> ${c.feedback.solution_text}<br>`;
    }
    fb.innerHTML += `<strong>Erklärung:</strong> ${c.feedback.explanation}`;
    cont.appendChild(fb);
    btn.disabled = true;
  };
  cont.appendChild(btn);

  // Navigation (next/prev)
  let nav = document.createElement("div");
  nav.className = "fs-nav";
  if (idx > 0) {
    let prev = document.createElement("button");
    prev.textContent = "Zurück";
    prev.onclick = () => renderFallstudie(idx - 1);
    nav.appendChild(prev);
  }
  if (idx < fallstudienData.length - 1) {
    let next = document.createElement("button");
    next.textContent = "Weiter";
    next.onclick = () => renderFallstudie(idx + 1);
    nav.appendChild(next);
  }
  cont.appendChild(nav);
}

// آپ کی Fallstudien بٹن پر
// loadFallstudien() کو کال کریں اور ایک div دیں id="fallstudien-container"