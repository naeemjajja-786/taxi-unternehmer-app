const SACHGEBIET_QUOTA = {
    "Recht": 12,
    "Kaufmännische und finanzielle Führung des Betriebes": 24,
    "Technischer Betrieb und Betriebsdurchführung": 9,
    "Straßenverkehrssicherheit, Unfallverhütung, Umwelt": 9,
    "Grenzüberschreitende Personenbeförderung": 6
};

let questions = [];
let examQuestions = [];
let currentQuestion = 0;
let score = 0;

const examContainer = document.getElementById('exam-container');

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function loadQuestions() {
    try {
        const response = await fetch('Exams-Teil1.json');
        if (!response.ok) {
            throw new Error("Fragen-Datei nicht gefunden!");
        }
        questions = await response.json();
    } catch (err) {
        examContainer.innerHTML = "<div style='color:red;'>Fehler beim Laden der Fragen. Stellen Sie sicher, dass <b>Exams-Teil1.json</b> vorhanden ist.</div>";
        throw err;
    }
}

function selectQuestionsBySachgebiet() {
    examQuestions = [];
    let sachgebietGroups = {};
    for (let q of questions) {
        let sg = q.sachgebiet;
        if (!sachgebietGroups[sg]) sachgebietGroups[sg] = [];
        sachgebietGroups[sg].push(q);
    }
    for (let sg in SACHGEBIET_QUOTA) {
        let group = sachgebietGroups[sg] || [];
        examQuestions = examQuestions.concat(shuffle(group).slice(0, SACHGEBIET_QUOTA[sg]));
    }
    examQuestions = shuffle(examQuestions);
}

function showQuestion() {
    examContainer.innerHTML = "";
    if (currentQuestion < examQuestions.length) {
        const q = examQuestions[currentQuestion];
        const questionBlock = document.createElement('div');
        questionBlock.className = "question-block";

        const qNumber = document.createElement('div');
        qNumber.className = "q-number";
        qNumber.textContent = `Frage ${currentQuestion + 1} von ${examQuestions.length} (${q.sachgebiet})`;
        questionBlock.appendChild(qNumber);

        const qText = document.createElement('div');
        qText.className = "q-text";
        qText.textContent = q.frage;
        questionBlock.appendChild(qText);

        q.antworten.forEach((antwort, idx) => {
            const label = document.createElement('label');
            label.className = "answer-option";
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'antwort';
            input.value = idx;
            label.appendChild(input);
            label.appendChild(document.createTextNode(" " + antwort));
            questionBlock.appendChild(label);
            questionBlock.appendChild(document.createElement('br'));
        });

        const checkBtn = document.createElement('button');
        checkBtn.textContent = "Antwort prüfen";
        checkBtn.className = "action-button";
        checkBtn.onclick = checkAnswer;
        questionBlock.appendChild(checkBtn);

        examContainer.appendChild(questionBlock);
    } else {
        finishExam();
    }
}

function checkAnswer() {
    const selected = document.querySelector('input[name="antwort"]:checked');
    if (!selected) {
        alert('Bitte wählen Sie eine Antwort aus!');
        return;
    }
    const userAnswer = parseInt(selected.value);
    const q = examQuestions[currentQuestion];
    const isCorrect = userAnswer === q.richtig;
    if (isCorrect) score++;
    let feedback = document.createElement('div');
    feedback.className = "feedback";
    feedback.innerHTML = isCorrect
        ? "<b>Richtig!</b>"
        : `<b>Falsch!</b> Richtige Antwort: ${q.antworten[q.richtig]}`;
    if (q.erklaerung) {
        feedback.innerHTML += "<br><small>" + q.erklaerung + "</small>";
    }
    examContainer.appendChild(feedback);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = (currentQuestion < examQuestions.length - 1)
        ? "Nächste Frage"
        : "Ergebnis anzeigen";
    nextBtn.className = "action-button";
    nextBtn.onclick = () => {
        currentQuestion++;
        showQuestion();
    };
    examContainer.appendChild(document.createElement('br'));
    examContainer.appendChild(nextBtn);

    document.querySelectorAll('input[name="antwort"]').forEach(el => el.disabled = true);
    document.querySelector('button.action-button').disabled = true;
}

function finishExam() {
    examContainer.innerHTML = `
        <div class="result-block">
            <h2>Ergebnis</h2>
            <p>Sie haben <b>${score}</b> von <b>${examQuestions.length}</b> Fragen richtig beantwortet (${Math.round(score/examQuestions.length*100)}%)</p>
            <button class="action-button" id="restart-btn">Neu starten</button>
        </div>
    `;
    document.getElementById('restart-btn').onclick = startExam;
}

async function startExam() {
    score = 0;
    currentQuestion = 0;
    await loadQuestions();
    selectQuestionsBySachgebiet();
    showQuestion();
}

startExam();