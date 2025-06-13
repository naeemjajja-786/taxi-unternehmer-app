// ----------- LERNMATERIAL.JS -------------
// For real-world "chapter/topics" structure, and robust urdu

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
  chapterContent.innerHTML = "";
  // 1. Title
  let h2 = document.createElement("h2");
  h2.textContent = data.chapter || "Kapitel";
  chapterContent.appendChild(h2);

  // 2. Topics
  if (Array.isArray(data.topics)) {
    data.topics.forEach(topic => {
      let h3 = document.createElement("h3");
      h3.textContent = (topic.id ? topic.id + " " : "") + (topic.title || "");
      chapterContent.appendChild(h3);

      // Main content (bullet points)
      if (Array.isArray(topic.content)) {
        let ul = document.createElement("ul");
        topic.content.forEach(line => {
          let li = document.createElement("li");
          li.textContent = line;
          ul.appendChild(li);
        });
        chapterContent.appendChild(ul);
      }
      // Explain
      if (topic.explain) {
        let div = document.createElement("div");
        div.className = "note";
        div.textContent = topic.explain;
        chapterContent.appendChild(div);
      }
      // Example
      if (topic.example) {
        let div = document.createElement("div");
        div.className = "note";
        div.innerHTML = `<strong>Beispiel:</strong> ${topic.example}`;
        chapterContent.appendChild(div);
      }
      // Media (if any, display as link or image)
      if (topic.media) {
        let mediaDiv = document.createElement("div");
        mediaDiv.style.margin = "0.5em 0";
        if (typeof topic.media === "string" && (topic.media.endsWith(".jpg") || topic.media.endsWith(".png"))) {
          mediaDiv.innerHTML = `<img src="${topic.media}" alt="Media" style="max-width:100%;margin-top:7px;">`;
        } else {
          mediaDiv.textContent = topic.media;
        }
        chapterContent.appendChild(mediaDiv);
      }
      // Tags (if any)
      if (topic.tags) {
        let tagsDiv = document.createElement("div");
        tagsDiv.style.fontSize = "0.95em";
        tagsDiv.style.color = "#888";
        tagsDiv.textContent = `Tags: ${topic.tags}`;
        chapterContent.appendChild(tagsDiv);
      }
    });
  } else {
    chapterContent.innerHTML += "<div style='color:red'>Dieses Kapitel enthält keine Themen.</div>";
  }
}

// ----------- Universal loader
function loadChapter(filename, lang) {
  chapterList.innerHTML = "";
  chapterContent.innerHTML = "<div class='loading'>Lade Inhalt ...</div>";
  backBtn.style.display = "inline-block";

  fetch(`./${encodeURIComponent(filename)}`)
    .then(resp => resp.json())
    .then(data => {
      chapterContent.innerHTML = "";
      if (lang === "deutsch") {
        // Detect "chapter/topics" structure or fallback
        if (data && (data.chapter || data.topics)) {
          renderDeutschLesson(data);
        } else {
          // fallback: show all keys/values as plain text
          let pre = document.createElement("pre");
          pre.textContent = JSON.stringify(data, null, 2);
          chapterContent.appendChild(pre);
        }
      } else {
        // Urdu lessons (as before)
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

function goBack() {
  renderChapters(currentLang);
  backBtn.style.display = "none";
}
window.goBack = goBack;

renderChapters("deutsch");
