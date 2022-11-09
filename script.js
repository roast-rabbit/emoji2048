import Grid from "./Grid.js";
import Tile from "./Tile.js";
import Swipe from "./Swipe.js";

const gameBoard = document.getElementById("game-board");
let grid;
let score;
const loseMessage = document.querySelector("#lose-message");
const loseMessageText = document.querySelector("#lose-message p");
const overlay = document.querySelector("#overlay");
const restart = document.querySelector("#restart");
const scoreFigure = document.querySelector("#score span");

restart.addEventListener("click", () => {
  newGame();
});

function updateScore() {
  score = 0;
  grid.cells.forEach((cell) => {
    if (cell?.tile?.value) score += cell.tile.value;
  });
  scoreFigure.textContent = score;
}

function newGame() {
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
  grid.cells.forEach((cell) => cell.mergeTiles());

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessage.style.display = "block";
      overlay.style.display = "block";
      loseMessageText.textContent = `GAME OVER😜 Your Score Is ${score}`;
    });
    return true;
  }
  updateScore();
  setupInput();
}

async function handleSwipeDown() {
  if (!canMoveDown()) {
    setupInput();
    return;
  }
  await moveDown();
  grid.cells.forEach((cell) => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `GAME OVER😜 Your Score Is ${score}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }
  updateScore();
  setupInput();
}

async function handleSwipeRight() {
  if (!canMoveRight) {
    setupInput();
    return;
  }
  await moveRight();
  grid.cells.forEach((cell) => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `GAME OVER😜 Your Score Is ${score}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }
  updateScore();
  setupInput();
}

async function handleSwipeLeft() {
  if (!canMoveLeft) {
    setupInput();
    return;
  }
  await moveLeft();
  grid.cells.forEach((cell) => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `GAME OVER😜 Your Score Is ${score}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }
  updateScore();

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
  grid.cells.forEach((cell) => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      loseMessageText.textContent = `GAME OVER😜 Your Score Is ${score}`;
      loseMessage.style.display = "block";
      overlay.style.display = "block";
    });
    return true;
  }
  updateScore();

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
});
