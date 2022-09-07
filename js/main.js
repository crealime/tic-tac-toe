const WINNING_COMBINATIONS = [
  [1,2,3,4,5],
  [6,7,8,9,10],
  [11,12,13,14,15],
  [16,17,18,19,20],
  [21,22,23,24,25],
  [1,6,11,16,21],
  [2,7,12,17,22],
  [3,8,13,18,23],
  [4,9,14,19,24],
  [5,10,15,20,25],
  [1,7,13,19,25],
  [5,9,13,17,21]
]
const playerOneFields = []

function init() {
  const battleground = document.querySelector('.battleground')
  const fields = document.querySelectorAll('.battleground__field')

  battleground.addEventListener('click', function(e) {
    const field = e.target.closest('.battleground__field') || null
    if (field && !field.dataset.player) {
      playerOneFields.push(parseInt(field.dataset.num))
      field.dataset.player = 'player'

      let temp = WINNING_COMBINATIONS.reduce((acc, combination) => {
        if (combination.every(el => playerOneFields.includes(el))) acc = true
        return acc
      }, false)

      console.log(temp)
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  init()
})