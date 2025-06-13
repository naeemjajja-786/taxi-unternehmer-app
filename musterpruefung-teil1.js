// musterpruefung-teil1.js

let teil1Questions = []
let currentQuestionIndex1 = 0
let score1 = 0
let teil1Finished = false

async function startExamTeil1() {
  try {
    const res = await fetch('Exams-Teil1.json')
    const data = await res.json()
    teil1Questions = data.teil_1
    currentQuestionIndex1 = 0
    score1 = 0
    teil1Finished = false

    document.getElementById('quiz-container').classList.remove('hidden')
    document.getElementById('start-buttons').classList.add('hidden')
    document.getElementById('final-result').classList.add('hidden')

    showTeil1Question()
  } catch (error) {
    console.error('Fehler beim Laden der Prüfungsdaten für Teil 1:', error)
  }
}

function showTeil1Question() {
  const q = teil1Questions[currentQuestionIndex1]
  if (!q) return

  document.getElementById('question-number').innerText = `Frage ${currentQuestionIndex1 + 1}