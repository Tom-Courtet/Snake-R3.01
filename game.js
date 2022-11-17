const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d"); //nécessaire pour dessiner dessus
const refresh = 5;
const QUEUE = "Q";
const EMPTY = "E";
const FOOD = "F";
const HEAD = "H";
const tileCount = 25;
const tileSize = 20;
const milieu = Math.floor(tileCount / 2);
let xVelocity = 0;
let yVelocity = 0;

let world = [];
function initWorld(tileCount) {
  for (let i = 0; i < tileCount; i++) {
    world[i] = []; // on est obligé de déclarer un nouveau tableau pour chaque case de world à i
    for (let j = 0; j < tileCount; j++) {
      world[i].push(EMPTY);
    }
  }
  world[milieu][milieu] = HEAD;
}
initWorld(tileCount);

let snake = [[milieu, milieu]];

document.body.addEventListener("keydown", keyDown);

function drawGame() {
  refreshWorld();
  drawWorld();
  moveSnake();
  setTimeout(drawGame, 1000 / refresh);
}

function moveSnake() {
  if (yVelocity !== 0) {
    // en haut et en bas
    if (snake[0][1] + yVelocity >= 0 && snake[0][1] + yVelocity < tileCount) {
      snake[0][1] = snake[0][1] + yVelocity;
    }
  } else if (xVelocity !== 0) {
    if (snake[0][0] + xVelocity >= 0 && snake[0][0] + xVelocity < tileCount) {
      snake[0][0] = snake[0][0] + xVelocity;
    }
  }
}

function refreshWorld() {
  for (let i = 0; i < world.length; i++) {
    for (let j = 0; j < world.length; j++) {
      for (let k = 0; k < snake.length; k++) {
        if (i === snake[k][0] && j === snake[k][1]) {
          world[i][j] = HEAD;
        } else world[i][j] = EMPTY;
      }
    }
  }
}

function drawWorld() {
  for (let i = 0; i < world.length; i++) {
    for (let j = 0; j < world.length; j++) {
      switch (world[i][j]) {
        case "Q":
          context.fillStyle = "#00a24c";
          break;
        case "E":
          context.fillStyle = "lightblue";
          break;
        case "F":
          context.fillStyle = "red";
          break;
        case "H":
          context.fillStyle = "#004721";
          break;
        default:
          break;
      }
      context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
}

function keyDown(event) {
  switch (event.key) {
    case "ArrowDown":
    case "s":
    case "S":
      if (yVelocity != -1) {
        xVelocity = 0;
        yVelocity = 1;
        break;
      }
      break;
    case "ArrowUp":
    case "z":
    case "Z":
      if (yVelocity != 1) {
        xVelocity = 0;
        yVelocity = -1;
        break;
      }
      break;
    case "ArrowLeft":
    case "q":
    case "Q":
      if (xVelocity != 1) {
        yVelocity = 0;
        xVelocity = -1;
        break;
      }
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (xVelocity != -1) {
        yVelocity = 0;
        xVelocity = 1;
        break;
      }
      break;
    case "Escape":
      yVelocity = 0;
      xVelocity = 0;
      break;
    default:
      break;
  }
}

drawGame();
