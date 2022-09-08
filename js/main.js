const WINNING_COMBINATIONS = [
  [1,6,11,16,21],
  [2,7,12,17,22],
  [3,8,13,18,23],
  [4,9,14,19,24],
  [5,10,15,20,25],
  [1,2,3,4,5],
  [6,7,8,9,10],
  [11,12,13,14,15],
  [16,17,18,19,20],
  [21,22,23,24,25],
  [1,7,13,19,25],
  [5,9,13,17,21]
]
const rowMap = {}
const playerOneFields = []

function speak(text) {
  const speakThis = new SpeechSynthesisUtterance(text)
  speakThis.lang = 'en-US'
  speakThis.rate = .7
  speakThis.pitch = .7
  speechSynthesis.speak(speakThis)
}

function init() {
  const battleground = document.querySelector('.battleground')
  const fields = document.querySelectorAll('.battleground__field')
  const rowNames = document.querySelectorAll('.battleground__text')
  const speakButton = document.querySelector('.speak')

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  recognition.interimResults = true
  recognition.maxAlternatives = 1
  recognition.lang = 'en-US'

  rowNames.forEach((el, i) => {
    rowMap[el.innerHTML.toLowerCase().split(' ')[0]]= WINNING_COMBINATIONS[i]
  })
  console.log(rowMap)

  speakButton.addEventListener('click', function() {
    recognition.start()
  })

  recognition.addEventListener("end", function() {
    // recognition.start();
  })

  let words = ''

  recognition.addEventListener("result", function(e) {
    words = [...e.results].map(result => result[0].transcript).join('')
  })

  recognition.addEventListener("speechend", function() {
    const allWords = words.split(' ').reduce((acc, el) => {
      if (rowMap[el]) acc.push(rowMap[el])
      return acc
    }, [])
    returnIntersectionOfRows(allWords)
  })

  function returnIntersectionOfRows(rows) {
    if (rows.length === 2) {
      const numOfField = rows[0].reduce((acc, el) => {
        if (rows[1].includes(el)) acc = el
        return acc
      }, null)
      setSymbolInField(numOfField)
    }
  }

  function setSymbolInField(num) {
    console.log(num)
    fields.forEach(el => {
      if (el.dataset.num == num) el.classList.toggle('battleground__item_select')
    })
  }

  battleground.addEventListener('click', function(e) {
    const field = e.target.closest('.battleground__field') || null
    if (field && !field.dataset.player) {
      playerOneFields.push(parseInt(field.dataset.num))
      field.dataset.player = 'player'

      let temp = Object.values(WINNING_COMBINATIONS).reduce((acc, combination) => {
        if (combination.every(el => playerOneFields.includes(el))) acc = true
        return acc
      }, false)

      console.log(temp)
    }
  })

  battleground.addEventListener('click', function(e) {
    const field = e.target.closest('.battleground__text') || null
    if (field && !field.dataset.player) {
      console.log(field.innerText)
      speak(field.innerText)
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  init()
})