import Grid from "./Grid.js";
import Tile from "./Tile.js";
import Swipe from "./Swipe.js";

const gameBoard = document.getElementById("game-board");
let grid;
let totalScore;
const loseMessage = document.querySelector("#lose-message");
const loseMessageText = document.querySelector("#lose-message p:nth-child(2)");
const overlay = document.querySelector("#overlay");
const restart = document.querySelector("#restart");
const scoreFigure = document.querySelector("#score span");

restart.addEventListener("click", () => {
  newGame();
});

function updateScore() {
  scoreFigure.textContent = totalScore;
}

function newGame() {
  totalScore = 0;
  loseMessage.style.display = "none";
  overlay.style.display = "none";
  let tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.remove();
  });
  let cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.remove();
  });
  grid = new Grid(gameBoard);
  grid.randomEmptyCell().tile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = new Tile(gameBoard);
  updateScore();
  setupInput();
}

function setupInput() {
  gameBoard.addEventListener("touchmove", (e) => {
    e.preventDefault();
  });
  gameBoard.addEventListener("swiped-up", handleSwipeUp, { once: true });
  gameBoard.addEventListener("swiped-down", handleSwipeDown, { once: true });
  gameBoard.addEventListener("swiped-right", handleSwipeRight, { once: true });
  gameBoard.addEventListener("swiped-left", handleSwipeLeft, { once: true });
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleSwipeUp() {
  if (!canMoveUp()) {
    setupInput();
    return;
  }
  await moveUp();

  let newScore = 0;
  grid.cells.forEach((cell) => {
    const value = cell.mergeTiles(newScore);
    if (value) {
      newScore += value;
    }
  });
  totalScore += newScore;
  updateScore();

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessage.style.display = "block";
      overlay.style.display = "block";
      loseMessageText.textContent = `Your Score Is ${totalScore}`;
    });
    return true;
  }
  setupInput();
}

async function handleSwipeDown() {
  if (!canMoveDown()) {
    setupInput();
    return;
  }
  await moveDown();

  let newScore = 0;
  grid.cells.forEach((cell) => {
    const value = cell.mergeTiles(newScore);
    if (value) {
      newScore += value;
    }
  });
  totalScore += newScore;
  updateScore();

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `Your Score Is ${totalScore}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }
  setupInput();
}

async function handleSwipeRight() {
  if (!canMoveRight()) {
    setupInput();
    return;
  }
  await moveRight();

  let newScore = 0;
  grid.cells.forEach((cell) => {
    const value = cell.mergeTiles(newScore);
    if (value) {
      newScore += value;
    }
  });
  totalScore += newScore;
  updateScore();

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `Your Score Is ${totalScore}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }
  setupInput();
}

async function handleSwipeLeft() {
  if (!canMoveLeft()) {
    setupInput();
    return;
  }
  await moveLeft();
  let newScore = 0;
  grid.cells.forEach((cell) => {
    const value = cell.mergeTiles(newScore);
    if (value) {
      newScore += value;
    }
  });
  totalScore += newScore;
  updateScore();

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `Your Score Is ${totalScore}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }

  setupInput();
}

async function handleInput(e) {
  e.preventDefault();
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput();
        return;
      }
      await moveRight();
      break;
    default:
      setupInput();
      return;
  }
  let newScore = 0;
  grid.cells.forEach((cell) => {
    const value = cell.mergeTiles(newScore);
    if (value) {
      newScore += value;
    }
  });
  totalScore += newScore;
  updateScore();

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `Your Score Is ${totalScore}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }

  setupInput();
}

function moveUp() {
  return slideTiles(grid.cellsByColumn);
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function moveLeft() {
  return slideTiles(grid.cellsByRow);
}
function moveRight() {
  return slideTiles(grid.cellsByRow.map((row) => [...row].reverse()));
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap((group) => {
      const promises = [];
      for (let i = 1; i < group.length; i++) {
        const cell = group[i];
        if (cell.tile == null) continue;
        let lastValidCell;
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j];
          if (!moveToCell.canAccept(cell.tile)) break;
          lastValidCell = moveToCell;
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition());
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile;
          } else {
            lastValidCell.tile = cell.tile;
          }
          cell.tile = null;
        }
      }
      return promises;
    })
  );
}

function canMoveUp() {
  return canMove(grid.cellsByColumn);
}
function canMoveDown() {
  return canMove(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function canMoveLeft() {
  return canMove(grid.cellsByRow);
}
function canMoveRight() {
  return canMove(grid.cellsByRow.map((row) => [...row].reverse()));
}

function canMove(cells) {
  return cells.some((group) => {
    return group.some((cell, index) => {
      if (index === 0) return false;
      if (cell.tile == null) return false;
      const moveToCell = group[index - 1];
      return moveToCell.canAccept(cell.tile);
    });
  });
}
window.addEventListener("DOMContentLoaded", () => {
  newGame();
  totalScore = 0;
  updateScore(0);
});
