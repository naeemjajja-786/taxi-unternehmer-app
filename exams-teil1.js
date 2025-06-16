// exams-teil1.js

let allQuestions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

const questionDistribution = {
    "Recht": 12,
    "Kaufmännische und finanzielle Führung des Betriebes": 24,
    "Technischer Betrieb und Betriebsdurchführung": 9,
    "Straßenverkehrssicherheit, Unfallverhütung, Umwelt": 9,
    "Grenzüberschreitende Personenbeförderung": 6
};

// سوالات JSON لوڈ کرو
fetch('Exams-Teil1.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data;
        // MCQ بٹن پر کلک سے کوئز شروع ہو
        document.getElementById('start-mcq-btn').addEventListener('click', startMCQQuiz);
    });

function startMCQQuiz() {
    selectedQuestions = selectQuestionsBySachgebiet();
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('mcq-quiz-container').style.display = 'block';
    document.getElementById('mcq-start-screen').style.display = 'none';
    showQuestion();
}

function selectQuestionsBySachgebiet() {
    let questions = [];
    // ہر Sachgebiet سے مطلوبہ تعداد میں رینڈم سوالات لو
    for (let sachgebiet in questionDistribution) {
        // فلٹر کرو
        let filtered = allQuestions.filter(q => (q.sachgebiet || q.Sachgebiet) === sachgebiet);
        // رینڈمائز کرو
        filtered = shuffle(filtered);
        // مطلوبہ تعداد لو (کم ہوں تو جتنے ہیں لے لو)
        let count = questionDistribution[sachgebiet];
        questions = questions.concat(filtered.slice(0, count));
    }
    // سارے سوالات کو پھر سے رینڈمائز کرو تاکہ مکس ہوں
    return shuffle(questions);
}

function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showQuestion() {
    let q = selectedQuestions[currentQuestionIndex];
    let questionContainer = document.getElementById('mcq-question');
    questionContainer.innerHTML = `
        <div><b>Frage ${currentQuestionIndex + 1} von ${selectedQuestions.length}</b></div>
        <div class="question-text">${q.question}</div>
        <div id="mcq-answers">
            ${q.answers.map((ans, idx) =>
                `<button class="mcq-answer-btn" data-idx="${idx}">${ans}</button>`
            ).join('')}
        </div>
        <div id="mcq-feedback"></div>
    `;

    // آنسر بٹن ایونٹس
    Array.from(document.getElementsByClassName('mcq-answer-btn')).forEach(btn => {
        btn.addEventListener('click', function () {
            checkAnswer(parseInt(this.dataset.idx));
        });
    });
}

function checkAnswer(selectedIdx) {
    let q = selectedQuestions[currentQuestionIndex];
    let feedbackDiv = document.getElementById('mcq-feedback');
    let correctIdx = q.correct;
    let explanation = q.explanation || "";

    if (selectedIdx === correctIdx) {
        feedbackDiv.innerHTML = `<span style="color:green;"><b>Richtig!</b></span> ${explanation}`;
        score++;
    } else {
        feedbackDiv.innerHTML = `<span style="color:red;"><b>Falsch!</b></span> Richtige Antwort: ${q.answers[correctIdx]} <br>${explanation}`;
    }

    // اگلا سوال بٹن (یا End)
    feedbackDiv.innerHTML += `<br><button id="next-mcq-btn">${currentQuestionIndex + 1 < selectedQuestions.length ? 'Nächste Frage' : 'Ergebnis anzeigen'}</button>`;
    document.getElementById('mcq-answers').style.pointerEvents = 'none';

    document.getElementById('next-mcq-btn').addEventListener('click', function () {
        currentQuestionIndex++;
        if (currentQuestionIndex < selectedQuestions.length) {
            showQuestion();
        } else {
            showResult();
        }
    });
}

function showResult() {
    let resultDiv = document.getElementById('mcq-question');
    resultDiv.innerHTML = `
        <h3>Quiz beendet!</h3>
        <p>Richtige Antworten: <b>${score} von ${selectedQuestions.length}</b></p>
        <button id="restart-mcq-btn">Nochmal spielen</button>
    `;
    document.getElementById('restart-mcq-btn').addEventListener('click', () => {
        startMCQQuiz();
    });
}