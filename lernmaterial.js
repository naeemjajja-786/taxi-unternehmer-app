document.addEventListener("DOMContentLoaded", function () {
  // ... (فائل لسٹ، باقی سب جیسا پہلے)

  // ---------- یہ helper function سب nested کو recursive render کرتا ہے -----------
  function renderSection(section, container, level = 2) {
    // Headings
    let heading = document.createElement("h" + Math.min(level, 5));
    heading.textContent = section.title || section.titel || section.überschrift || section.id || "";
    if (heading.textContent.trim() !== "") container.appendChild(heading);

    // Main text/description
    if (section.text || section.description) {
      let p = document.createElement("p");
      p.textContent = section.text || section.description;
      container.appendChild(p);
    }
    // Points (ul)
    if (Array.isArray(section.points)) {
      let ul = document.createElement("ul");
      section.points.forEach(pt => {
        let li = document.createElement("li");
        li.textContent = pt;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
    // Notes
    if (section.note) {
      let div = document.createElement("div");
      div.className = "note";
      div.textContent = section.note;
      container.appendChild(div);
    }
    // Features, allowed, forbidden, with_permission, additional_alarms, reporting, example, categories
    ["features", "allowed", "forbidden", "with_permission", "additional_alarms", "example"].forEach(key => {
      if (Array.isArray(section[key])) {
        let ul = document.createElement("ul");
        section[key].forEach(item => {
          let li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        let lbl = document.createElement("strong");
        lbl.textContent = (key.charAt(0).toUpperCase() + key.slice(1)) + ":";
        container.appendChild(lbl);
        container.appendChild(ul);
      }
    });
    // Reporting: array of entity/timeframe
    if (Array.isArray(section.reporting)) {
      let ul = document.createElement("ul");
      section.reporting.forEach(rep => {
        let li = document.createElement("li");
        li.textContent = `${rep.entity} (${rep.timeframe})`;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
    // Categories: (theme/content + examples/points)
    if (Array.isArray(section.categories)) {
      section.categories.forEach(cat => {
        if (cat.theme || cat.content) {
          let lbl = document.createElement("strong");
          lbl.textContent = (cat.theme || cat.content) + ":";
          container.appendChild(lbl);
        }
        if (Array.isArray(cat.points)) {
          let ul = document.createElement("ul");
          cat.points.forEach(pt => {
            let li = document.createElement("li");
            li.textContent = pt;
            ul.appendChild(li);
          });
          container.appendChild(ul);
        }
        if (Array.isArray(cat.examples)) {
          let ul = document.createElement("ul");
          cat.examples.forEach(ex => {
            let li = document.createElement("li");
            li.textContent = ex;
            ul.appendChild(li);
          });
          container.appendChild(ul);
        }
      });
    }
    // Subsections/subchapters recursive
    ["subsections", "subchapters"].forEach(key => {
      if (Array.isArray(section[key])) {
        section[key].forEach(subsec => renderSection(subsec, container, level + 1));
      }
    });
  }

  // -------------------- باقی سب جیسا پہلے --------------------
  const deutschFiles = [
    "1 Personenbeförderungsgesetz.json", "2 Gewerberecht.json", "3 Arbeitsrecht.json",
    "4 Kaufmännische und finanzielle Führung des Unternehmens.json", "5 Kostenrechnung.json",
    "6 Straßenverkehrsrech.json", "7 Beforderung Verhalten.json", "8 Grenzverkehr.json",
    "9 Versicherungen im Taxi- und Mietwagenbetrieb.json", "10 Technische Normen und technischer Betrieb.json",
    "11 Umwelschutz.json", "12 Mietwagen.json"
  ];
  const urduFiles = [
    "urdu-lesson-1.json","urdu-lesson-2.json","urdu-lesson-3.json",
    "urdu-lesson-4.json","urdu-lesson-5.json","urdu-lesson-6.json",
    "urdu-lesson-7.json","urdu-lesson-8.json","urdu-lesson-9.json"
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
            for (let key in data) {
              if (Array.isArray(data[key])) {
                sections = data[key];
                break;
              }
            }
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
          sections.forEach(section => renderSection(section, chapterContent, 2));
        } else {
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

  window.goBack = function() {
    renderChapters(currentLang);
    backBtn.style.display = "none";
  };

  renderChapters("deutsch");
});