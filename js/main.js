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
console.log(winningCombinations)
const DELAY = 500
const players = {
  player: {
    name: 'You',
    gender: 'male',
    fields: []
  },
  computer: {
    name: 'Computer',
    gender: 'female',
    fields: []
  }
}
const domElements = {}
const lineMap = {}
let currentPlayer = players.player
let words = ''
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.interimResults = true
recognition.maxAlternatives = 1
recognition.lang = 'en-US'

function changeCurrentPlayer() {
  currentPlayer === players.player ? currentPlayer = players.computer : currentPlayer = players.player
}

function fadeIn(showElement) {
  showElement.style.display = 'flex'
  const animation = showElement.animate([
    {opacity: 0,},
    {opacity: 1}
  ], {
    duration: DELAY,
    easing: 'ease-in'
  })

  animation.addEventListener('finish', function() {
    showElement.style.opacity = '1'
  })
}

function fadeOut(hideElement) {
  const animation = hideElement.animate([
    {opacity: 1},
    {opacity: 0}
  ], {
    duration: DELAY,
    easing: 'ease-out'
  })

  animation.addEventListener('finish', function() {
    hideElement.style.display = 'none'
  })
}

function getTwoRandomProperties(map) {
  let keys = Object.keys(map)
  const oneProp = keys[keys.length * Math.random() << 0]
  const twoProp = keys[keys.length * Math.random() << 0]

  if (oneProp !== twoProp) {
    return [oneProp, twoProp]
  }
  else return getTwoRandomProperties(map)
}

// function setComputerStep() {
//   const properties = getTwoRandomProperties(lineMap)
//   if (players.player.fields.length > 12) return false
//   else if (!findIntersectionOfLines([lineMap[properties[0]], lineMap[properties[1]]])) setComputerStep()
//   else {
//     speak(`${properties[0] === 'time' ? 'time to' : properties[0]} ${properties[1] === 'time' ? 'time to' : properties[1]}`)
//     const winner = checkWinner()
//     if (winner) resetGame(winner)
//     else changeCurrentPlayer()
//   }
// }

function setComputerStep() {
  winningCombinations.forEach((combination, index) => {

    const numberOf = combination.reduce((acc, fieldNumber) => {
      if (players.player.fields.includes(fieldNumber)) acc++
      return acc
    }, 0)

    if (numberOf > 1) console.log(combination)

    // setSymbolInField(numOfField)
    // currentPlayer.fields.push(numOfField)
  })
  const properties = getTwoRandomProperties(lineMap)
  if (players.player.fields.length > 12) return false
  else if (!findIntersectionOfLines([lineMap[properties[0]], lineMap[properties[1]]])) setComputerStep()
  else {
    speak(`${properties[0] === 'time' ? 'time to' : properties[0]} ${properties[1] === 'time' ? 'time to' : properties[1]}`)
    const winner = checkWinner()
    if (winner) resetGame(winner)
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
  return players.player.fields.includes(num) || players.computer.fields.includes(num)
}

function isPlayersFieldsContain(num) {
  if (players.player.fields.includes(num)) return true
  return players.computer.fields.includes(num)
}

function checkWinner() {
  const isWinner = Object.values(winningCombinations).reduce((acc, combination) => {
    if (combination.every(el => currentPlayer.fields.includes(el))) acc = true
    return acc
  }, false)

  if (players.player.fields.length === 13) return 'Game ended in a draw'
  if (isWinner) return `${currentPlayer.name} win!`
}

function getPlayerIcon() {
  return `<img src="img/${currentPlayer.gender}.png" alt="" class="battleground__img">`
}

function findIntersectionOfLines(rows) {
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
  domElements.fields.forEach(el => {
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
      const winner = checkWinner()
      if (winner) resetGame(winner)
      else {
        changeCurrentPlayer()
        domElements.battleground.removeEventListener('click', setStepOnFieldClick)
        setTimeout(function() {
          domElements.battleground.addEventListener('click', setStepOnFieldClick)
          setComputerStep()
        }, DELAY)
      }
    }
  }
}

function setStepOnSpeech() {
  const allWords = words.split(' ').reduce((acc, el) => {
    if (lineMap[el]) acc.push(lineMap[el])
    return acc
  }, [])
  if (findIntersectionOfLines(allWords)) {
    const winner = checkWinner()
    if (winner) resetGame(winner)
    else {
      changeCurrentPlayer()
      setTimeout(setComputerStep, DELAY)
    }
  }
  domElements.speakImg.classList.remove('speak__img_blink')
}

function resetGame(winner) {
  fadeIn(domElements.endPage)
  domElements.endPageResult.textContent = winner

  setTimeout(function() {
    domElements.fields.forEach(el => el.innerHTML = '')
    players.player.fields = []
    players.computer.fields = []
    currentPlayer = players.player
  }, DELAY * 2)
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
    lineMap[el.innerHTML.toLowerCase().split(' ')[0]] = LINES[i]
  })

  domElements.endPageButton.addEventListener('click', function(e) {
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

  domElements.speakButton.addEventListener('click', function() {
    if (!domElements.speakImg.closest('.speak__img_blink')) {
      recognition.start()
      domElements.speakImg.classList.add('speak__img_blink')
    }
    else {
      recognition.stop()
      domElements.speakImg.classList.remove('speak__img_blink')
    }
  })

  recognition.addEventListener("result", function(e) {
    words = [...e.results].map(result => result[0].transcript).join(' ').toLowerCase()
    domElements.resultText.textContent = words
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
