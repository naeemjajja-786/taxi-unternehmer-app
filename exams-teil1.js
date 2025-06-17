// exams-teil1.js

let allQuestions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// ہر Sachgebiet کے مطابق تقسیم
const questionDistribution = {
    "Recht": 12,
    "Kaufmännische und finanzielle Führung des Betriebes": 24,
    "Technischer Betrieb und Betriebsdurchführung": 9,
    "Straßenverkehrssicherheit, Unfallverhütung, Umwelt": 9,
    "Grenzüberschreitende Personenbeförderung": 6
};

document.addEventListener('DOMContentLoaded', function() {
    fetch('Exams-Teil1.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data;
            document.getElementById('start-mcq-btn').addEventListener('click', startMCQQuiz);
        });
});

function startMCQQuiz() {
    // کوئز باکس دکھاؤ، باقی ہٹا دو
    document.getElementById('quiz-container').classList.remove('hidden');
    document.querySelector('.menu-btns').style.display = 'none';
    selectedQuestions = selectQuestionsBySachgebiet();
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

function selectQuestionsBySachgebiet() {
    let questions = [];
    for (let sachgebiet in questionDistribution) {
        let filtered = allQuestions.filter(q => (q.sachgebiet || q.Sachgebiet) === sachgebiet);
        filtered = shuffle(filtered);
        let count = questionDistribution[sachgebiet];
        questions = questions.concat(filtered.slice(0, count));
    }
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
    // اگر سب سوال ختم تو نتیجہ دکھاؤ
    if (currentQuestionIndex >= selectedQuestions.length) {
        showResult();
        return;
    }
    document.getElementById('result-summary').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';

    let q = selectedQuestions[currentQuestionIndex];
    document.getElementById('question-number').innerHTML = `<b>Frage ${currentQuestionIndex + 1} von ${selectedQuestions.length}</b>`;
    document.getElementById('question-text').textContent = q.question;

    // جواب بٹن بناؤ
    let answersHTML = '';
    q.answers.forEach((ans, idx) => {
        answersHTML += `<button class="mcq-answer-btn" data-idx="${idx}">${ans}</button>`;
    });
    document.getElementById('choices').innerHTML = answersHTML;
    document.getElementById('mcq-feedback').innerHTML = '';

    Array.from(document.getElementsByClassName('mcq-answer-btn')).forEach(btn => {
        btn.addEventListener('click', function () {
            checkAnswer(parseInt(this.dataset.idx));
        });
    });
}

function checkAnswer(selectedIdx) {
    let q = selectedQuestions[currentQuestionIndex];
    let correctIdx = q.correct;
    let explanation = q.explanation || '';
    let feedbackDiv = document.getElementById('mcq-feedback');
    if (selectedIdx === correctIdx) {
        feedbackDiv.innerHTML = `<span class="correct">Richtig!</span> ${explanation}`;
        score++;
    } else {
        feedbackDiv.innerHTML = `<span class="incorrect">Falsch!</span> Richtige Antwort: ${q.answers[correctIdx]}<br>${explanation}`;
    }

    // Disable all answer buttons
    Array.from(document.getElementsByClassName('mcq-answer-btn')).forEach(btn => btn.disabled = true);

    feedbackDiv.innerHTML += `<br><button id="next-mcq-btn">${currentQuestionIndex + 1 < selectedQuestions.length ? 'Nächste Frage' : 'Ergebnis anzeigen'}</button>`;
    document.getElementById('next-mcq-btn').addEventListener('click', function () {
        currentQuestionIndex++;
        showQuestion();
    });
}

function showResult() {
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('result-summary').style.display = 'block';
    document.getElementById('score').innerHTML = `<b>Quiz beendet!</b><br>Richtige Antworten: <b>${score} von ${selectedQuestions.length}</b>`;
    document.getElementById('restart').onclick = function () {
        // مکمل ری سیٹ
        document.getElementById('quiz-container').classList.add('hidden');
        document.querySelector('.menu-btns').style.display = 'flex';
        score = 0;
        currentQuestionIndex = 0;
        selectedQuestions = [];
    }
}