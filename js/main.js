const LINES = [
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
const winningCombinations = LINES.reduce((acc, line) => {
  acc.push(line.slice(0, -1), line.slice(1))
  return acc
}, [])
winningCombinations.push([6,12,18,24], [2,8,14,20], [16,12,8,4], [22,18,14,10])
const DELAY = 500
const players = {
  player: {
    gender: 'male',
    fields: []
  },
  computer: {
    gender: 'female',
    fields: []
  }
}
const domElements = {}
const lineMap = {}
let currentPlayer = players.player
let resultWords = ''
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.interimResults = true
recognition.maxAlternatives = 1
recognition.lang = 'en-US'

function changeCurrentPlayer() {
  currentPlayer === players.player ? currentPlayer = players.computer : currentPlayer = players.player
}

function fadeIn(shownElement) {
  shownElement.style.display = 'flex'
  const animation = shownElement.animate([
    {opacity: 0,},
    {opacity: 1}
  ], {
    duration: DELAY,
    easing: 'ease-in'
  })

  animation.addEventListener('finish', function() {
    shownElement.style.opacity = '1'
  })
}

function fadeOut(hiddenElement) {
  const animation = hiddenElement.animate([
    {opacity: 1},
    {opacity: 0}
  ], {
    duration: DELAY,
    easing: 'ease-out'
  })

  animation.addEventListener('finish', function() {
    hiddenElement.style.display = 'none'
  })
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function defineComputerStep() {
  let mostWeightComputer = [[0, []]]
  let mostWeightPlayer = [[0, []]]

  winningCombinations.forEach((combination) => {
    const weightComputer = combination.reduce((acc, fieldNumber) => {
      if (players.computer.fields.includes(fieldNumber)) acc++
      return acc
    }, 0)

    const weightPlayer = combination.reduce((acc, fieldNumber) => {
      if (players.player.fields.includes(fieldNumber)) acc++
      return acc
    }, 0)

    if (!(weightComputer && weightPlayer)) {
      if (mostWeightPlayer.some(weight => weight[0] < weightPlayer)) mostWeightPlayer.push([weightPlayer, combination])
      if (mostWeightComputer.some(weight => weight[0] < weightComputer)) mostWeightComputer.push([weightComputer, combination])
    }
  })

  const maxWeightPlayer = Math.max(...mostWeightPlayer.map(weight => weight[0]))
  mostWeightPlayer = mostWeightPlayer.filter(width => width[0] === maxWeightPlayer)
  mostWeightPlayer = mostWeightPlayer[Math.floor(Math.random() * mostWeightPlayer.length)]

  const maxWeightComputer = Math.max(...mostWeightComputer.map(weight => weight[0]))
  mostWeightComputer = mostWeightComputer.filter(width => width[0] === maxWeightComputer)
  mostWeightComputer = mostWeightComputer[Math.floor(Math.random() * mostWeightComputer.length)]

  if (mostWeightPlayer[0] > mostWeightComputer[0]) {
    const stepOptions = mostWeightPlayer[1].filter(fieldNumber => !players.player.fields.includes(fieldNumber))
    setComputerStep(stepOptions[getRandomInt(stepOptions.length)])
  }
  else {
    const stepOptions = mostWeightComputer[1].filter(fieldNumber => !players.computer.fields.includes(fieldNumber))
    setComputerStep(stepOptions[getRandomInt(stepOptions.length)])
  }
}

function setComputerStep(fillingField) {
  if (!fillingField) {
    const stepOptions = []

    domElements.fields.forEach(field => {
      const fieldNum = parseInt(field.dataset.number)
      if (!players.player.fields.includes(fieldNum)
        && !players.computer.fields.includes(fieldNum)) stepOptions.push(fieldNum)
    })

    fillingField = stepOptions[getRandomInt(stepOptions.length)]
  }

  speakComputerStep(fillingField)

  domElements.fields.forEach(field => {
    if (parseInt(field.dataset.number) === fillingField) {
      currentPlayer.fields.push(fillingField)
      field.innerHTML = getPlayerIcon()
      const winner = checkWinner()
      if (winner) resetGame(winner)
      else changeCurrentPlayer()
    }
  })
}

function speakComputerStep(field) {
  let words = []
  for (let word in lineMap) {
    if (lineMap[word].includes(field)) words.push(word)
  }
  speak(`${words[0] === 'time' ? 'time to' : words[0]} ${words[1]}`)
}

function speak(text) {
  const speakThis = new SpeechSynthesisUtterance(text)
  speakThis.lang = 'en-US'
  speakThis.rate = .7
  speakThis.pitch = .7
  speechSynthesis.speak(speakThis)
}

function isIncludeInPlayersFields(fieldNumber) {
  return players.player.fields.includes(fieldNumber) || players.computer.fields.includes(fieldNumber)
}

function isPlayersFieldsContain(fieldNumber) {
  if (players.player.fields.includes(fieldNumber)) return true
  return players.computer.fields.includes(fieldNumber)
}

function checkWinner() {
  const combination = Object.values(winningCombinations).filter(combination => combination.every(fieldNumber => currentPlayer.fields.includes(fieldNumber)))[0]
  const isWinner = Boolean(combination)

  if (players.player.fields.length === 13) return {message: 'Game ended in a draw', combination: null}
  if (isWinner) return currentPlayer === players.player ? {message: 'You win!', combination} : {message: 'You lose!', combination}
  return null
}

function getPlayerIcon() {
  return `<img src="img/${currentPlayer.gender}.png" alt="" class="battleground__img">`
}

function findIntersectionOfLines(lines) {
  if (lines.length === 2 && lines[0].join('') !== lines[1].join('')) {
    const numOfField = lines[0].filter(fieldNumber => lines[1].includes(fieldNumber))[0]
    if (numOfField && !isIncludeInPlayersFields(numOfField)) {
      setSymbolInField(numOfField)
      currentPlayer.fields.push(numOfField)
      return true
    }
    return false
  }
  return false
}

function setSymbolInField(fieldNumber) {
  domElements.fields.forEach(field => {
    if (parseInt(field.dataset.number) === fieldNumber) field.innerHTML = getPlayerIcon()
  })
}

function setStepOnFieldClick(e) {
  const field = e.target.closest('.battleground__field') || null

  if (!field) return null

  const numOfField = parseInt(field.dataset.number)

  if (isPlayersFieldsContain(numOfField)) return null

  currentPlayer.fields.push(numOfField)
  field.innerHTML = getPlayerIcon()
  const winner = checkWinner()
  if (winner) resetGame(winner)
  else {
    changeCurrentPlayer()
    domElements.battleground.removeEventListener('click', setStepOnFieldClick)
    setTimeout(function() {
      domElements.battleground.addEventListener('click', setStepOnFieldClick)
      defineComputerStep()
    }, DELAY)
  }
}

function setStepOnSpeech() {
  const allWords = resultWords.split(' ').filter(word => lineMap[word]).map(word => lineMap[word])
  if (findIntersectionOfLines(allWords)) {
    const winner = checkWinner()
    if (winner) resetGame(winner)
    else {
      changeCurrentPlayer()
      setTimeout(defineComputerStep, DELAY)
    }
  }
  domElements.speakImg.classList.remove('speak__img_blink')
}

function resetGame(winner) {

  if (winner.combination) {
    domElements.fields.forEach(field => {
      if (winner.combination.includes(parseInt(field.dataset.number))) {
        field.classList.add('battleground__field_flash')
      }
    })
  }

  setTimeout(function() {
    fadeIn(domElements.endPage)
    domElements.endPageResult.textContent = winner.message
    speak(winner.message)
  }, DELAY * 3)

  setTimeout(function() {
    domElements.fields.forEach(field => {
      field.classList.remove('battleground__field_flash')
      field.innerHTML = ''
    })
    players.player.fields = []
    players.computer.fields = []
    currentPlayer = players.player
  }, DELAY * 4)
}

function runRecognition() {
  if (!domElements.speakImg.closest('.speak__img_blink')) {
    recognition.start()
    domElements.speakImg.classList.add('speak__img_blink')
  }
  else {
    recognition.stop()
    domElements.speakImg.classList.remove('speak__img_blink')
  }
}

function init() {
  domElements.battleground = document.querySelector('.battleground')
  domElements.fields = document.querySelectorAll('.battleground__field')
  domElements.rowNames = document.querySelectorAll('.battleground__text')
  domElements.speakButton = document.querySelector('.speak')
  domElements.resultText = document.querySelector('.result-text')
  domElements.speakImg = document.querySelector('.speak__img')
  domElements.startPage = document.querySelector('.start-page')
  domElements.characters = document.querySelector('.start-page__characters')
  domElements.endPage = document.querySelector('.end-page')
  domElements.endPageButton = document.querySelector('.end-page__button')
  domElements.endPageResult = document.querySelector('.end-page__result')

  domElements.rowNames.forEach((el, i) => {
    lineMap[el.textContent.toLowerCase().split(' ')[0]] = LINES[i]
  })

  domElements.endPageButton.addEventListener('click', function() {
    fadeOut(domElements.endPage)
  })

  domElements.characters.addEventListener('click', function(e) {
    const field = e.target.closest('.start-page__field') || null
    if (field) {
      players.player.gender = field.dataset.player
      players.computer.gender = field.dataset.computer
      fadeOut(domElements.startPage)
    }
  })

  domElements.speakButton.addEventListener('click', runRecognition)

  document.addEventListener('keydown', function(e) {
    if (e.code === 'Enter' || e.code === 'Space') runRecognition()
  })

  recognition.addEventListener("result", function(e) {
    resultWords = [...e.results].map(result => result[0].transcript).join(' ').toLowerCase()
    domElements.resultText.textContent = resultWords
  })

  recognition.addEventListener("speechend", setStepOnSpeech)

  domElements.battleground.addEventListener('click', setStepOnFieldClick)

  domElements.battleground.addEventListener('click', function(e) {
    const field = e.target.closest('.battleground__text') || null
    if (field && !field.dataset.player) {
      speak(field.innerText)
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  init()
})
