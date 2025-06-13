document.addEventListener("DOMContentLoaded", function () {
  // --- فائل لسٹ جیسے اوپر ---
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

  // ---------- یہ فنکشن سب جرمن 12 فائلز کے لیے کافی ہے ----------
  function renderGermanChapter(data, container) {
    if (data.chapter) {
      let h2 = document.createElement("h2");
      h2.textContent = data.chapter;
      container.appendChild(h2);
    }
    if (Array.isArray(data.topics)) {
      data.topics.forEach(topic => {
        let t = document.createElement("section");
        t.className = "g-topic";
        let h3 = document.createElement("h3");
        h3.textContent = topic.title || "";
        t.appendChild(h3);
        if (Array.isArray(topic.content)) {
          let ul = document.createElement("ul");
          topic.content.forEach(line => {
            let li = document.createElement("li");
            li.textContent = line;
            ul.appendChild(li);
          });
          t.appendChild(ul);
        }
        if (topic.explain) {
          let div = document.createElement("div");
          div.className = "note";
          div.innerHTML = "<strong>Erklärung:</strong> " + topic.explain;
          t.appendChild(div);
        }
        if (topic.example) {
          let div = document.createElement("div");
          div.className = "note";
          div.innerHTML = "<strong>Beispiel:</strong> " + topic.example;
          t.appendChild(div);
        }
        if (Array.isArray(topic.tags) && topic.tags.length > 0) {
          let tagDiv = document.createElement("div");
          tagDiv.className = "tags";
          tagDiv.innerHTML = topic.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ");
          t.appendChild(tagDiv);
        }
        container.appendChild(t);
      });
    }
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
          renderGermanChapter(data, chapterContent);
        } else {
          // Urdu lessons (جیسا اوپر کامیاب تھا)
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