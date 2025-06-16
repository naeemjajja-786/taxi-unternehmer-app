// exams-teil1.js

const SACHGEBIET_QUOTA = {
    "Recht": 12,
    "Kaufmännische und finanzielle Führung des Betriebes": 24,
    "Technischer Betrieb und Betriebsdurchführung": 9,
    "Straßenverkehrssicherheit, Unfallverhütung, Umwelt": 9,
    "Grenzüberschreitende Personenbeförderung": 6
};
const EXAM_DURATION = 30 * 60; // 30 minutes in seconds

let questions = [];
let examQuestions = [];
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let timer = EXAM_DURATION;
let timerInterval = null;

const examContainer = document.getElementById('exam-container');
const timerDiv = document.getElementById('exam-timer');
const startBtn = document.getElementById('start-btn');

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

async function loadQuestions() {
    const response = await fetch('Exams-Teil1.json');
    questions = await response.json();
}

function selectQuestionsBySachgebiet() {
    examQuestions = [];
    let sachgebietGroups = {};
    // گروپ بنائیں
    for (let q of questions) {
        let sg = q.sachgebiet;
        if (!sachgebietGroups[sg]) sachgebietGroups[sg] = [];
        sachgebietGroups[sg].push(q);
    }
    // ہر group میں سے مطلوبہ random سوالات چنیں
    for (let sg in SACHGEBIET_QUOTA) {
        let group = sachgebietGroups[sg] || [];
        if (group.length < SACHGEBIET_QUOTA[sg]) {
            console.warn(`Warnung: Sachgebiet "${sg}" enthält nur ${group.length} Fragen!`);
        }
        examQuestions = examQuestions.concat(shuffle(group).slice(0, SACHGEBIET_QUOTA[sg]));
    }
    // mix all for random order in exam
    examQuestions = shuffle(examQuestions);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function showTimer() {
    timerDiv.textContent = `Zeit: ${formatTime(timer)}`;
}

function startTimer() {
    showTimer();
    timerInterval = setInterval(() => {
        timer--;
        showTimer();
        if (timer <= 0) {
            clearInterval(timerInterval);
            finishExam(true);
        }
    }, 1000);
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
        finishExam(false);
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
    // فیڈبیک اور وضاحت
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

function finishExam(timeout = false) {
    clearInterval(timerInterval);
    examContainer.innerHTML = `
        <div class="result-block">
            <h2>Ergebnis</h2>
            <p>Sie haben <b>${score}</b> von <b>${examQuestions.length}</b> Fragen richtig beantwortet (${Math.round(score/examQuestions.length*100)}%)</p>
            <p>${timeout ? "Zeit abgelaufen!" : ""}</p>
            <button class="action-button" id="restart-btn">Neu starten</button>
        </div>
    `;
    document.getElementById('restart-btn').onclick = startExam;
}

async function startExam() {
    score = 0;
    currentQuestion = 0;
    userAnswers = [];
    timer = EXAM_DURATION;
    examContainer.innerHTML = '<button id="start-btn" class="action-button">Test starten</button>';
    document.getElementById('start-btn').onclick = async () => {
        await loadQuestions();
        selectQuestionsBySachgebiet();
        startTimer();
        showQuestion();
    };
}

startExam();