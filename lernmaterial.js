function loadChapter(filename, lang) {
  chapterList.innerHTML = "";
  chapterContent.innerHTML = "<div class='loading'>Lade Inhalt ...</div>";
  backBtn.style.display = "inline-block";

  fetch(`./${encodeURIComponent(filename)}`)
    .then(resp => resp.json())
    .then(data => {
      chapterContent.innerHTML = "";
      if (lang === "deutsch") {
        // 1. اگر data array ہے
        let sections = [];
        if (Array.isArray(data)) {
          sections = data;
        } else {
          // 2. اگر data object ہے — ہر key چیک کرو (صرف پہلا array show کر دو)
          for (let key in data) {
            if (Array.isArray(data[key])) {
              sections = data[key];
              break;
            }
          }
        }

        // 3. اگر پھر بھی نہ ملے، ہر value میں array دیکھو
        if (!sections.length) {
          for (let v of Object.values(data)) {
            if (Array.isArray(v)) {
              sections = v;
              break;
            }
          }
        }

        // 4. پھر بھی نہ ملے: ہر object value میں nested array دیکھو
        if (!sections.length) {
          for (let v of Object.values(data)) {
            if (typeof v === "object" && v !== null) {
              for (let k in v) {
                if (Array.isArray(v[k])) {
                  sections = v[k];
                  break;
                }
              }
            }
            if (sections.length) break;
          }
        }

        // 5. fallback: کوئی single object بھی show کر دو
        if (!sections.length && typeof data === "object" && data !== null) {
          // اگر values میں {titel/text} والی object ہوں
          sections = Object.values(data).filter(
            v => typeof v === "object" && (v.title || v.titel || v.überschrift) && (v.text || v.description)
          );
        }

        if (!sections.length) {
          chapterContent.innerHTML = "<div style='color:red'>Dieses Kapitel konnte nicht geladen werden (unbekanntes Format).</div>";
          return;
        }

        // یہاں سے وہی renderDeutschLesson یا basic render logic:
        // اگر nested structure ہے (جیسے آپ کا pasted file) تو nested render
        if (sections[0] && (sections[0].subchapters || sections[0].subsections)) {
          renderDeutschLesson(sections); // ← اگر اوپر کا renderDeutschLesson function define ہے!
        } else {
          // Flat/old format (array of sections)
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
        // Urdu code as before:
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