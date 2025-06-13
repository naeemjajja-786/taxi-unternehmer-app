// ----------- LERNMATERIAL.JS -------------
// Deutsch: Nested (title > subchapters > subsections > points/etc)
// Urdu: Supports full سوالات loop

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

const chapterList = document.getElementById("chapter-list");
const chapterContent = document.getElementById("chapter-content");
const btnUrdu = document.getElementById("btn-urdu");
const btnDeutsch = document.getElementById("btn-deutsch");
const backBtn = document.getElementById("backBtn");

let currentLang = "deutsch";

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

function renderDeutschLesson(data) {
  // data: array of chapter objects (wie Ihr Beispiel)
  chapterContent.innerHTML = "";
  data.forEach(chapter => {
    // Main title
    let h1 = document.createElement("h2");
    h1.textContent = chapter.title || chapter.titel || "Kapitel";
    chapterContent.appendChild(h1);

    // Subchapters
    if (Array.isArray(chapter.subchapters)) {
      chapter.subchapters.forEach(sub => {
        let h2 = document.createElement("h3");
        h2.textContent = sub.title || sub.id || "Unterkapitel";
        chapterContent.appendChild(h2);

        if (sub.description) {
          let d = document.createElement("div");
          d.style.margin = "0.6rem 0 0.7rem 0";
          d.textContent = sub.description;
          chapterContent.appendChild(d);
        }

        // Subsections
        if (Array.isArray(sub.subsections)) {
          sub.subsections.forEach(subsec => {
            let h3 = document.createElement("h4");
            h3.textContent = subsec.title || "Abschnitt";
            chapterContent.appendChild(h3);

            if (subsec.description) {
              let sd = document.createElement("div");
              sd.style.margin = "0.5rem 0 0.5rem 0";
              sd.textContent = subsec.description;
              chapterContent.appendChild(sd);
            }

            // Show points (as bullet list)
            if (Array.isArray(subsec.points)) {
              let ul = document.createElement("ul");
              subsec.points.forEach(pt => {
                let li = document.createElement("li");
                li.textContent = pt;
                ul.appendChild(li);
              });
              chapterContent.appendChild(ul);
            }

            // Show note, reporting, allowed, forbidden, etc.
            ["note","silent_alarm","description"].forEach(k => {
              if (subsec[k]) {
                let div = document.createElement("div");
                div.className = "note";
                div.textContent = subsec[k];
                chapterContent.appendChild(div);
              }
            });

            // Show reporting (array)
            if (Array.isArray(subsec.reporting)) {
              let ul = document.createElement("ul");
              subsec.reporting.forEach(rep => {
                let li = document.createElement("li");
                li.textContent = `${rep.entity} (${rep.timeframe})`;
                ul.appendChild(li);
              });
              chapterContent.appendChild(ul);
            }
            // Show allowed, forbidden, with_permission, additional_alarms, etc.
            ["allowed","forbidden","with_permission","features","additional_alarms"].forEach(k => {
              if (Array.isArray(subsec[k])) {
                let ul = document.createElement("ul");
                subsec[k].forEach(item => {
                  let li = document.createElement("li");
                  li.textContent = item;
                  ul.appendChild(li);
                });
                let label = document.createElement("strong");
                label.textContent = (k.charAt(0).toUpperCase() + k.slice(1)) + ":";
                chapterContent.appendChild(label);
                chapterContent.appendChild(ul);
              }
            });

            // Show categories with content/examples/themes
            if (Array.is