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
const DELAY = 500
const PLAYERS = {
  player: {
    name: 'Player',
    gender: 'male',
    fields: []
  },
  computer: {
    name: 'Computer',
    gender: 'female',
    fields: []
  }
}
const DOM_ELEMENTS = {}
const rowMap = {}
let currentPlayer = PLAYERS.player
let words = ''
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.interimResults = true
recognition.maxAlternatives = 1
recognition.lang = 'en-US'

function resetGame() {
  setTimeout(function() {
    DOM_ELEMENTS.fields.forEach(el => el.innerHTML = '')
    PLAYERS.player.fields = []
    PLAYERS.computer.fields = []
  }, DELAY)
}

function changeCurrentPlayer() {
  currentPlayer === PLAYERS.player ? currentPlayer = PLAYERS.computer : currentPlayer = PLAYERS.player
}

function getTwoRandomProperties(obj) {
  let keys = Object.keys(obj)
  const oneProp = keys[keys.length * Math.random() << 0]
  const twoProp = keys[keys.length * Math.random() << 0]

  if (oneProp !== twoProp) {
    return [oneProp, twoProp]
  }
  else return getTwoRandomProperties(obj)
}

function setComputerStep() {
  const properties = getTwoRandomProperties(rowMap)
  if (PLAYERS.player.fields.length > 12) return false
  else if (!findIntersectionOfRows([rowMap[properties[0]], rowMap[properties[1]]])) setComputerStep()
  else {
    speak(`${properties[0] === 'time' ? 'time to' : properties[0]} ${properties[1] === 'time' ? 'time to' : properties[1]}`)
    if (checkWinner()) {
      resetGame()
    }
    else changeCurrentPlayer()
  }
}

function speak(text) {
  const speakThis = new SpeechSynthesisUtterance(text)
  speakThis.lang = 'en-US'
  speakThis.rate = .7
  speakThis.pitch = .7
  speechSynthesis.speak(speakThis)
}

function isIncludeInPlayersFields(num) {
  return PLAYERS.player.fields.includes(num) || PLAYERS.computer.fields.includes(num)
}

function isPlayersFieldsContain(num) {
  if (PLAYERS.player.fields.includes(num)) return true
  if (PLAYERS.computer.fields.includes(num)) return true
  return false
}

function checkWinner() {
  const isWinner = Object.values(WINNING_COMBINATIONS).reduce((acc, combination) => {
    if (combination.every(el => currentPlayer.fields.includes(el))) acc = true
    return acc
  }, false)
  if (PLAYERS.player.fields.length === 13) return 'Game ended in a draw'
  if (isWinner) return currentPlayer.name
}

function getPlayerIcon() {
  return `<img src="img/${currentPlayer.gender}.png" alt="" class="battleground__img">`
}

function findIntersectionOfRows(rows) {
  if (rows.length === 2 && rows[0].join('') !== rows[1].join('')) {
    const numOfField = rows[0].reduce((acc, el) => {
      if (rows[1].includes(el)) acc = el
      return acc
    }, null)
    if (numOfField && !isIncludeInPlayersFields(numOfField)) {
      setSymbolInField(numOfField)
      currentPlayer.fields.push(numOfField)
      return true
    }
    return false
  }
  return false
}

function setSymbolInField(num) {
  DOM_ELEMENTS.fields.forEach(el => {
    if (parseInt(el.dataset.num) === num) el.innerHTML = getPlayerIcon()
  })
}

function setStepOnFieldClick(e) {
  const field = e.target.closest('.battleground__field') || null
  if (field) {
    const numOfField = parseInt(field.dataset.num)
    if (!isPlayersFieldsContain(numOfField)) {
      currentPlayer.fields.push(numOfField)
      field.innerHTML = getPlayerIcon()
      if (checkWinner()) resetGame()
      else {
        changeCurrentPlayer()
        DOM_ELEMENTS.battleground.removeEventListener('click', setStepOnFieldClick)
        setTimeout(function() {
          DOM_ELEMENTS.battleground.addEventListener('click', setStepOnFieldClick)
          setComputerStep()
        }, DELAY)
      }
    }
  }
}

function init() {
  DOM_ELEMENTS.battleground = document.querySelector('.battleground')
  DOM_ELEMENTS.fields = document.querySelectorAll('.battleground__field')
  DOM_ELEMENTS.rowNames = document.querySelectorAll('.battleground__text')
  DOM_ELEMENTS.speakButton = document.querySelector('.speak')
  DOM_ELEMENTS.resultText = document.querySelector('.result-text')
  DOM_ELEMENTS.speakImg = document.querySelector('.speak__img')

  DOM_ELEMENTS.rowNames.forEach((el, i) => {
    rowMap[el.innerHTML.toLowerCase().split(' ')[0]]= WINNING_COMBINATIONS[i]
  })

  DOM_ELEMENTS.speakButton.addEventListener('click', function() {
    if (!DOM_ELEMENTS.speakImg.closest('.speak__img_blink')) {
      recognition.start()
      DOM_ELEMENTS.speakImg.classList.add('speak__img_blink')
    }
    else {
      recognition.stop()
      DOM_ELEMENTS.speakImg.classList.remove('speak__img_blink')
    }
  })

  recognition.addEventListener("result", function(e) {
    words = [...e.results].map(result => result[0].transcript).join(' ').toLowerCase()
    DOM_ELEMENTS.resultText.textContent = words
  })

  recognition.addEventListener("speechend", function() {
    const allWords = words.split(' ').reduce((acc, el) => {
      if (rowMap[el]) acc.push(rowMap[el])
      return acc
    }, [])
    if (findIntersectionOfRows(allWords)) {
      if (checkWinner()) resetGame()
      else {
        changeCurrentPlayer()
        setComputerStep()
      }
    }
    DOM_ELEMENTS.speakImg.classList.remove('speak__img_blink')
  })

  DOM_ELEMENTS.battleground.addEventListener('click', setStepOnFieldClick)

  DOM_ELEMENTS.battleground.addEventListener('click', function(e) {
    const field = e.target.closest('.battleground__text') || null
    if (field && !field.dataset.player) {
      speak(field.innerText)
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  init()
})
