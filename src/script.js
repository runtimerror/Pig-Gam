'use strict';

// Initialize player object
class Player {
  constructor(id) {
    this.id = id;
    this.score = 0;
    this.currentScore = 0;
    this.DOMscore = document.getElementById(`score--${id - 1}`);
    this.DOMcurrent = document.getElementById(`current--${id - 1}`);
    this.DOMplayer = document.querySelector(`.player--${id - 1}`);
  }
}

// Initialize vars for DOM elements
const DOMdice = document.querySelector('.dice');
const btnRoll = document.querySelector('.btn--roll');
const btnNew = document.querySelector('.btn--new');
const btnHold = document.querySelector('.btn--hold');

// Create player objects
const player1 = new Player(1);
const player2 = new Player(2);
const players = [player1, player2];

// Probably shouldn't be global
let currentPlayer = player1;

// Switches from current player to other player and updates DOM classes
function switchPlayer() {
  currentPlayer.DOMplayer.classList.remove('player--active');

  if (currentPlayer == player1) {
    currentPlayer = player2;
    btnRoll.disabled = true;
    btnHold.disabled = true;
  } else {
    currentPlayer = player1;
    btnRoll.disabled = false;
    btnHold.disabled = false;
  }
  currentPlayer.DOMplayer.classList.add('player--active');
}

// Updates the specified DOM element to the specified value
function updateScreen(variable, content) {
  variable.textContent = `${content}`;
}

// Resets the score and all DOM elements to 0, and the player to 1
const resetScore = function () {
  currentPlayer.DOMplayer.classList.remove('player--winner');
  players.forEach(player => {
    player.score = 0;
    player.currentScore = 0;
    updateScreen(player.DOMscore, player.score);
    updateScreen(player.DOMcurrent, player.currentScore);
  });
  DOMdice.classList.add('hidden');
  currentPlayer = player2; // force player2, because we will switch back to p1
  switchPlayer();
};

// This function handles all dice rolls
const rollDice = function () {
  const diceRoll = Math.floor(Math.random() * 6) + 1; //roll logic goes here.
  DOMdice.src = `/img/dice-${diceRoll}.png`;
  DOMdice.classList.remove('hidden');
  if (diceRoll === 1) {
    currentPlayer.currentScore = 0;
    updateScreen(currentPlayer.DOMcurrent, currentPlayer.currentScore);
    switchPlayer();
  } else {
    currentPlayer.currentScore += diceRoll;
    updateScreen(currentPlayer.DOMcurrent, currentPlayer.currentScore);
  }
};

// This function handles saving the score, switching current player, and resetting current score
const saveScore = function () {
  currentPlayer.score += currentPlayer.currentScore;
  currentPlayer.currentScore = 0;
  updateScreen(currentPlayer.DOMscore, currentPlayer.score);
  updateScreen(currentPlayer.DOMcurrent, currentPlayer.currentScore);

  if (currentPlayer.score >= 100) {
    currentPlayer.DOMplayer.classList.add('player--winner');
    currentPlayer.DOMplayer.classList.remove('player--active');
    alert(`Player ${currentPlayer.id} wins!`);
  } else {
    switchPlayer();
  }
};

async function botTurn() {
  let keepGoing = true;
  let stress = 0;
  let nerves = 0;
  do {
    await new Promise(resolve => setTimeout(resolve, 500)); // Pause for .5 seconds

    if (stress > 15 || player2.currentScore + player2.score >= 100) {
      saveScore();
      keepGoing = false;
    } else {
      rollDice();
      if (currentPlayer.currentScore === 0) {
        keepGoing = false;
      }
    }
    stress = Math.floor(Math.random() * 20) + 1 + nerves; //roll a d20
    nerves += nerves + 1; //with each turn, make it more likely that the bot stops
  } while (keepGoing);
}

// our main game loop. This handles who's turn it is at any given point
async function gameLoop() {
  while (player1.currentScore < 100 && player2.currentScore < 100) {
    if (currentPlayer == player2) {
      console.log('bot is taking a turn');
      await botTurn();
    } else {
      console.log('waiting for player to take a turn');
      await waitForPlayerTurn();
    }
  }
}

function waitForPlayerTurn() {
  return new Promise(resolve => {
    btnRoll.addEventListener('click', handlePlayerAction);
    btnHold.addEventListener('click', handlePlayerAction);

    function handlePlayerAction() {
      btnRoll.removeEventListener('click', handlePlayerAction);
      btnHold.removeEventListener('click', handlePlayerAction);
      resolve();
    }
  });
}

btnRoll.addEventListener('click', rollDice);
btnNew.addEventListener('click', resetScore);
btnHold.addEventListener('click', saveScore);

resetScore();
gameLoop();
