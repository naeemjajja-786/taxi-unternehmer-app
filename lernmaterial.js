// Helper to get elements by ID
function $(id) {
  return document.getElementById(id);
}

// === Deutsch Kapitel (German chapters list) ===
const lernKapitel = [
  { file: "1 Personenbeförderungsgesetz.json", name: "Personenbeförderungsgesetz" },
  { file: "2 Gewerberecht.json", name: "Gewerberecht" },
  { file: "3 Arbeitsrecht.json", name: "Arbeitsrecht" },
  { file: "4 Kaufmännische und finanzielle Führung des Unternehmens.json", name: "Kaufmännische Führung" },
  { file: "5 Kostenrechnung.json", name: "Kostenrechnung" },
  { file: "6 Straßenverkehrsrech.json", name: "Straßenverkehrsrech" },
  { file: "7 Beforderung Verhalten.json", name: "Beförderungsverhalten" },
  { file: "8 Grenzverkehr.json", name: "Grenzverkehr" },
  { file: "9 Versicherungen im Taxi- und Mietwagenbetrieb.json", name: "Versicherungen" },
  { file: "10 Technische Normen und technischer Betrieb.json", name: "Technische Normen" },
  { file: "11 Umwelschutz.json", name: "Umweltschutz" },
  { file: "12 Mietwagen.json", name: "Mietwagen" }
];

// === Urdu Lessons (Urdu lessons list) ===
const urduLessons = [
  { file: "urdu-lesson-1.json", name: "مسافر برداری کے بنیادی اصول اور اقسام" },
  { file: "urdu-lesson-2.json", name: "ٹیکسی/رینٹل کار اجازت نامہ اور قانونی شرائط" },
  { file: "urdu-lesson-3.json", name: "BOKraft آپریشنل قواعد اور گاڑی/ڈرائیور کی شرائط" },
  { file: "urdu-lesson-4.json", name: "ٹریفک قوانین اور حفاظتی اقدامات" },
  { file: "urdu-lesson-5.json", name: "بین الاقوامی آپریشن اور ماحولیاتی تحفظ" },
  { file: "urdu-lesson-6.json", name: "انشورنس اور قانونی ذمہ داری" },
  { file: "urdu-lesson-7.json", name: "مالیاتی تصورات اور ادائیگی کے معاملات" },
  { file: "urdu-lesson-8.json", name: "محصولات اور مالی حساب کتاب" },
  { file: "urdu-lesson-9.json", name: "قانونی امور اور کاروباری ذمہ داریاں" }
];

// Render the main Lernmaterial menu (language selection)
function renderLernmaterialMenu() {
  const area = $("dynamic-content");
  area.innerHTML = `
    <div id="lernmenu">
      <h2>Lernmaterial</h2>
      <button class="sub-btn" onclick="renderUrduLessons()">📘 Urdu</button>
      <button class="sub-btn" onclick="renderDeutschChapters()">📗 Deutsch</button>
      <button class="back-btn" onclick="window.location.href='index.html'">← Zurück zum Hauptmenü</button>
    </div>
    <div id="lern-content"></div>
  `;
}

// Show all German chapters
function renderDeutschChapters() {
  const container = $("lern-content");
  let html = "<h3>Alle Deutsch Kapitel:</h3>";
  lernKapitel.forEach(k => {
    html += `<button class="sub-btn" onclick="loadLern('${k.file}')">${k.name}</button><br>`;
  });
  html += `<br><button class="back-btn" onclick="renderLernmaterialMenu()">← Zurück</button>`;
  container.innerHTML = html;
}

// Show all Urdu lessons
function renderUrduLessons() {
  const container = $("lern-content");
  let html = "<h3>اردو اسباق:</h3>";
  urduLessons.forEach(u => {
    html += `<button class="sub-btn" onclick="loadLern('${u.file}')">${u.name}</button><br>`;
  });
  html += `<br><button class="back-btn" onclick="renderLernmaterialMenu()">← واپس</button>`;
  container.innerHTML = html;
}

// Load and display a lesson (chapter or Urdu lesson) from its JSON file
function loadLern(file) {
  $("lern-content").innerHTML = "📥 لوڈ ہو رہا ہے ...";  // Loading indicator in Urdu
  fetch(file)
    .then(response => response.json())
    .then(data => {
      let html = `<h3>${data.chapter || ""}</h3>`;
      if (data.topics && Array.isArray(data.topics)) {
        html += "<ul>";
        data.topics.forEach(topic => {
          html += `<li>
              <strong>${topic.title}</strong>
              <ul>`;
          if (Array.isArray(topic.content)) {
            html += topic.content.map(x => `<li>${x}</li>`).join("");
          } else {
            html += `<li>${topic.content}</li>`;
          }
          html += `</ul>`;
          if (topic.explain) {
            html += `<div class="explanation">${topic.explain}</div>`;
          }
          if (topic.example) {
            html += `<div class="hinweis"><em>مثال:</em> ${topic.example}</div>`;
          }
          html += `</li>`;
        });
        html += "</ul>";
      } else {
        html += "<p>⚠️ کوئی مواد دستیاب نہیں۔</p>";
      }
      // Determine appropriate back button (Urdu or Deutsch context)
      const backLabel = file.toLowerCase().includes("urdu") ? "← واپس" : "← Zurück";
      const backAction = file.toLowerCase().includes("urdu") ? "renderUrduLessons()" : "renderDeutschChapters()";
      html += `<br><button class="back-btn" onclick="${backAction}">${backLabel}</button>`;
      $("lern-content").innerHTML = html;
    })
    .catch(() => {
      $("lern-content").innerHTML = "❌ مواد لوڈ نہیں ہو سکا۔";  // Error in Urdu
    });
}

// Initialize the Lernmaterial menu when page loads
window.onload = function() {
  renderLernmaterialMenu();
};
