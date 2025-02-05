//Control the board State
const Gameboard = (function () {
  let board = ["", "", "", "", "", "", "", "", ""]; // 3x3 board

  const getBoard = () => board;

  const placeMarker = (index, marker) => {
    if (board[index] == "") {
      board[index] = marker;
      return true; // Move was successful
    }
    return false; // Spot already taken
  };

  const resetBoard = () => {
    board = ["", "", "", "", "", "", "", "", ""];
    DisplayController.renderBoard();
  };

  return { getBoard, placeMarker, resetBoard };
})();




const Player = (name, marker) => {
  return { name, marker };
};













//Manages players, turns, and game logic(win/draw)
const GameController = (function () {
  let players = [];
  let currentPlayerIndex = 0; // 0 for Player 1, 1 for Player 2
  let gameOver = false;
  let scores = {X:0, O:0};


  // Initialize the game with two players
  const startGame = (playerOneName, playerTwoName) => {
    players = [Player(playerOneName, "X"), Player(playerTwoName, "O")];
    currentPlayerIndex = 0;
    gameOver = false;
    scores = {X: 0, O: 0};//score resetting
    Gameboard.resetBoard();
    DisplayController.renderBoard();
    DisplayController.updateTurnIndicator();
    DisplayController.updateScoreboard();
  };

  // Handle a player's move
  const playTurn = (index) => {
    if (gameOver) return;

    if (Gameboard.placeMarker(index, players[currentPlayerIndex].marker)) {
      DisplayController.renderBoard();
      const winningCombination = checkWin(players[currentPlayerIndex].marker);

      if (winningCombination) {
        gameOver = true;
        scores[players[currentPlayerIndex].marker]++;
        DisplayController.updateScoreboard();
        DisplayController.updateTurnIndicator(`${players[currentPlayerIndex].name} wins! 🎉`);
        setTimeout(() =>DisplayController.highlightWinningCells(winningCombination));
        return ;
      }

      if (checkDraw()) {
        gameOver = true;
        DisplayController.updateTurnIndicator("It's a draw!");
        return;
      }

      // Switch player
      currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
      DisplayController.updateTurnIndicator();
    }
  };


  // Check for a winning condition
  const checkWin = (marker) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (let combination of winningCombinations) {
      if (combination.every((index) => Gameboard.getBoard()[index] === marker)) {
        return combination; // Return the winning combination
      }
    }
    return null; // No win
  };

  // Check for a draw (if board is full and no winner)
  const checkDraw = () => {
    return Gameboard.getBoard().every((cell) => cell !== "");
  };

  const restartGame = () =>{
    currentPlayerIndex = 0;
    gameOver = false;
    Gameboard.resetBoard();
    DisplayController.updateTurnIndicator();
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];
  const getPlayers = () => players;
  const getScores = () => scores;
  return { startGame, playTurn, getCurrentPlayer , getPlayers, getScores, restartGame};
})();










//Handles updating the ui
const DisplayController = (function () {
  const boardElement = document.getElementById("gameboard");
  const restartButton = document.getElementById("restart");
  const turnIndicator = document.getElementById("turn-indicator");

  // Render the gameboard in the UI
  const renderBoard = () => {
    boardElement.innerHTML = ""; // Clear previous board
    Gameboard.getBoard().forEach((cell, index) => {
      const cellElement = document.createElement("div");
      cellElement.classList.add("cell");
      cellElement.textContent = cell;

      if (cell === "") {
        cellElement.addEventListener("click", () => {
          GameController.playTurn(index);
          renderBoard(); // Refresh UI after move
        });
      }

      boardElement.appendChild(cellElement); // ✅ Always append the cell
    });
  };

  // Highlight winning cells
  const highlightWinningCells = (winningCombination) => {
    winningCombination.forEach((index) => {
      document.querySelectorAll(".cell")[index].classList.add("win");
    });
  };

  // Update the turn display
  const updateTurnIndicator = (message = null) => {
    if (message) {
      turnIndicator.textContent = message; // Show win or draw message
    } else {
      const currentPlayer = GameController.getCurrentPlayer();
      turnIndicator.textContent = `${currentPlayer.name}'s Turn (${currentPlayer.marker})`;
    }
  };
  

  const updateScoreboard = () => {
    const players = GameController.getPlayers(); //Get players from GameController
    const scores = GameController.getScores(); //Get scores from GameController

    document.getElementById("player1-name").textContent = players[0].name;
    document.getElementById("player2-name").textContent = players[1].name;
    document.getElementById("player1-score").textContent = scores["X"];
    document.getElementById("player2-score").textContent = scores["O"];
  };
  

  // Restart game when button is clicked
  restartButton.addEventListener("click", () => {
   GameController.restartGame();
    // const players = GameController.getPlayers();
    // GameController.startGame(players[0].name, players[1].name);
  });


  

  return { renderBoard, updateTurnIndicator, highlightWinningCells,updateScoreboard };
})();

// Start game on page load
document.getElementById("start-game").addEventListener("click", () => {
  const playerOneName = document.getElementById("player1").value || "Player 1";
  const playerTwoName = document.getElementById("player2").value || "Player 2";

  GameController.startGame(playerOneName, playerTwoName);
});

