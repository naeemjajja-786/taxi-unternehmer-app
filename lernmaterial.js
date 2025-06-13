// ----------- LERNMATERIAL.JS -------------
// Dieses Skript lädt Urdu & Deutsch Lernmaterial, erzeugt Kapitel-Buttons
// und zeigt den Inhalt mit Überschriften und Abschnitten.
// JSON-Filenames bleiben unverändert!

// -----------------------------------
// Config: Namen der Deutsch & Urdu Files
const deutschFiles = [
  "1 Personenbeförderungsgesetz.json",
  "2 Gewerberecht.json",
  "3 Arbeitsrecht.json",
  "4 Kaufmännische und finanzielle Führung des Unternehmens.json",
  "5 Kostenrechnung.json",
  "6 Straßenverkehrsrech.json",
  "7 Beforderung Verhalten.json",
  "8 Grenzverkehr.json",
  "9 Versicherungen im Taxi- und Mietwagenbetrieb.json",
  "10 Technische Normen und technischer Betrieb.json",
  "11 Umwelschutz.json",
  "12 Mietwagen.json"
];
const urduFiles = [
  "urdu-lesson-1.json",
  "urdu-lesson-2.json",
  "urdu-lesson-3.json",
  "urdu-lesson-4.json",
  "urdu-lesson-5.json",
  "urdu-lesson-6.json",
  "urdu-lesson-7.json",
  "urdu-lesson-8.json",
  "urdu-lesson-9.json"
];

// -----------------------------------
// Element-Referenzen
const chapterList = document.getElementById("chapter-list");
const chapterContent = document.getElementById("chapter-content");
const btnUrdu = document.getElementById("btn-urdu");
const btnDeutsch = document.getElementById("btn-deutsch");
const backBtn = document.getElementById("backBtn");

// Default: Deutsch anzeigen
let currentLang = "deutsch";

// -----------------------
// Kapitel-Button-Generator
function renderChapters(lang) {
  chapterList.innerHTML = "";
  chapterContent.innerHTML = "";
  backBtn.style.display = "none";
  let files = lang === "urdu" ? urduFiles : deutschFiles;

  files.forEach((file, idx) => {
    let btn = document.createElement("button");
    btn.textContent = lang === "urdu" ? `سبق ${idx + 1}` : `Kapitel ${idx + 1}`;
    btn.onclick = () => loadChapter(file, lang);
    btn.className = "chapter-btn";
    chapterList.appendChild(btn);
  });
}

// --------------------------
// Kapitel laden & anzeigen
function loadChapter(filename, lang) {
  chapterList.innerHTML = "";
  chapterContent.innerHTML = "<div class='loading'>Lade Inhalt ...</div>";
  backBtn.style.display = "inline-block";

  fetch(`./${filename}`)
    .then(resp => resp.json())
    .then(data => {
      chapterContent.innerHTML = "";
      if (lang === "deutsch") {
        // Deutsch-Format: [{titel, text}, ...]
        data.forEach(section => {
          let h2 = document.createElement("h2");
          h2.textContent = section.titel || section.überschrift || "Abschnitt";
          chapterContent.appendChild(h2);

          let p = document.createElement("p");
          p.textContent = section.text || "";
          chapterContent.appendChild(p);
        });
      } else {
        // Urdu-Format: {عنوان: "...", سوالات: [{frage, antwort}] }
        let h2 = document.createElement("h2");
        h2.textContent = data["عنوان"] || "سبق";
        chapterContent.appendChild(h2);

        data["سوالات"].forEach((qa, idx) => {
          let q = document.createElement("div");
          q.className = "qa";
          q.innerHTML = `<strong>سوال ${idx + 1}:</strong> ${qa.frage}`;
          chapterContent.appendChild(q);

          let a = document.createElement("div");
          a.className = "qa-a";
          a.innerHTML = `<em>جواب:</em> ${qa.antwort}`;
          chapterContent.appendChild(a);
        });
      }
    })
    .catch(e => {
      chapterContent.innerHTML = "<div style='color:red'>Fehler beim Laden des Kapitels.</div>";
    });
}

// ---------------------------
// Sprachumschaltung
btnUrdu.onclick = () => {
  currentLang = "urdu";
  btnUrdu.classList.add("active");
  btnDeutsch.classList.remove("active");
  renderChapters("urdu");
};
btnDeutsch.onclick = () => {
  currentLang = "deutsch";
  btnDeutsch.classList.add("active");
  btnUrdu.classList.remove("active");
  renderChapters("deutsch");
};

// Back-Button
function goBack() {
  renderChapters(currentLang);
}
window.goBack = goBack;

// ------------- Initialisierung
renderChapters("deutsch");