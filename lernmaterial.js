document.addEventListener("DOMContentLoaded", function () {
  // اپنے json filenames یہاں درست رکھیں!
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
      btn.className = "chapter-btn";
      btn.onclick = () => loadChapter(file, lang);
      chapterList.appendChild(btn);
    });
  }

  function renderDeutschLesson(sections) {
    chapterContent.innerHTML = "";
    sections.forEach(section => {
      let h2 = document.createElement("h2");
      h2.textContent = section.title || section.titel || section.überschrift || "Abschnitt";
      chapterContent.appendChild(h2);

      let p = document.createElement("p");
      p.textContent = section.text || section.description || "";
      chapterContent.appendChild(p);

      // Nested subchapters
      if (Array.isArray(section.subchapters)) {
        section.subchapters.forEach(sub => {
          let h3 = document.createElement("h3");
          h3.textContent = sub.title || sub.id || "";
          chapterContent.appendChild(h3);
          if (sub.description) {
            let desc = document.createElement("div");
            desc.textContent = sub.description;
            chapterContent.appendChild(desc);
          }
          if (Array.isArray(sub.subsections)) {
            sub.subsections.forEach(subsec => {
              let h4 = document.createElement("h4");
              h4.textContent = subsec.title || "";
              chapterContent.appendChild(h4);
              if (subsec.description) {
                let desc = document.createElement("div");
                desc.textContent = subsec.description;
                chapterContent.appendChild(desc);
              }
              if (Array.isArray(subsec.points)) {
                let ul = document.createElement("ul");
                subsec.points.forEach(pt => {
                  let li = document.createElement("li");
                  li.textContent = pt;
                  ul.appendChild(li);
                });
                chapterContent.appendChild(ul);
              }
            });
          }
        });
      }
    });
  }

  function loadChapter(filename, lang) {
    chapterList.innerHTML = "";
    chapterContent.innerHTML = "<div class='loading'>Lade Inhalt ...</div>";
    backBtn.style.display = "inline-block";

    fetch(encodeURIComponent(filename))
      .then(resp => resp.json())
      .then(data => {
        chapterContent.innerHTML = "";
        if (lang === "deutsch") {
          let sections = [];
          if (Array.isArray(data)) {
            sections = data;
          } else {
            // Look for array in keys
            for (let key in data) {
              if (Array.isArray(data[key])) {
                sections = data[key];
                break;
              }
            }
            // If still not found, fallback to objects with title/text
            if (!sections.length) {
              sections = Object.values(data).filter(
                v => typeof v === "object" && (v.title || v.titel || v.überschrift) && (v.text || v.description)
              );
            }
          }
          if (!sections.length) {
            chapterContent.innerHTML = "<div style='color:red'>Dieses Kapitel konnte nicht geladen werden (unbekanntes Format).</div>";
            return;
          }
          // اگر nested ہے تو renderDeutschLesson، ورنہ simple render
          if (sections[0] && (sections[0].subchapters || sections[0].subsections)) {
            renderDeutschLesson(sections);
          } else {
            sections.forEach(section => {
              let h2 = document.createElement("h2");
              h2.textContent = section.title || section.titel || section.überschrift || "Abschnitt";
              chapterContent.appendChild(h2);

              let p = document.createElement("p");
              p.textContent = section.text || section.description || "";
              chapterContent.appendChild(p);
            });
          }
        } else {
          // Urdu lessons
          let h2 = document.createElement("h2");
          h2.textContent = data["عنوان"] || "سبق";
          chapterContent.appendChild(h2);

          if (Array.isArray(data["سوالات"])) {
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
          } else {
            chapterContent.innerHTML += "<div style='color:red'>سوالات کی فہرست نہیں ملی۔</div>";
          }
        }
      })
      .catch(e => {
        chapterContent.innerHTML = "<div style='color:red'>Fehler beim Laden des Kapitels.<br>" + e.message + "</div>";
      });
  }

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

  // Back button (must be global!)
  window.goBack = function() {
    renderChapters(currentLang);
    backBtn.style.display = "none";
  };

  // Initial load
  renderChapters("deutsch");
});