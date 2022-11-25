const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d"); //nécessaire pour dessiner dessus
document.body.addEventListener("keydown", keyDown);
const refresh = 7;

/* -------------------------------------------------------- */
//CONSTANTS
/* -------------------------------------------------------- */
const QUEUE = "Q";
const EMPTY = "E";
const FOOD = "F";
const HEAD = "H";
const tileCount = 16;
const tileSize = 25;
const milieu = Math.floor(tileCount / 2);
/* -------------------------------------------------------- */
//VARIABLES
/* -------------------------------------------------------- */
let eColor = "lightblue";
let hColor = "#004721";
let fColor = "red";
let xVelocity = 0;
let yVelocity = 0;
let foodCount = 0;
let xFood = 0;
let yFood = 0;
let world = [];
let snake = [
    [milieu - 2, milieu],
    [milieu - 1, milieu],
    [milieu, milieu],
];
initWorld(tileCount);

/**
 *Initialize the world tab
 *@param {Number} tileCount
 */
function initWorld(tileCount) {
    for (let i = 0; i < tileCount; i++) {
        world[i] = []; // on est obligé de déclarer un nouveau tableau pour chaque case de world à i
        for (let j = 0; j < tileCount; j++) {
            world[i].push(EMPTY);
        }
    }

    world[milieu][milieu] = HEAD;

    world[milieu - 2][milieu] = QUEUE;

    world[milieu - 1][milieu] = QUEUE;
}

/**
 * Restart the game by refreshing the page
 * @param {none}
 */
function restart_game() {
    document.location.reload(true);
}

/**
 * Manage the game progress
 * @param {none}
 */
function drawGame() {
    if (foodCount === 0) {
        spawnFood();
        foodCount = 1;
    }
    drawWorld();
    moveSnake();
    refreshWorld();
    setTimeout(drawGame, 1000 / refresh);
}

/**
 * manages the snake's movements
 * @param {none}
 */
function moveSnake() {
    if (yVelocity !== 0) {
        // en haut et en bas
        if (
            snake[snake.length - 1][1] + yVelocity >= 0 &&
            snake[snake.length - 1][1] + yVelocity < tileCount
        ) {
            snake.push([
                snake[snake.length - 1][0],
                snake[snake.length - 1][1] + yVelocity,
            ]);
            if (
                snake[snake.length - 1][0] != yFood ||
                snake[snake.length - 1][1] != xFood
            ) {
                snake.shift();
            } else {
                world[xFood][yFood] = EMPTY;
                foodCount = 0;
            }
        } else restart_game();
    } else if (xVelocity !== 0) {
        if (
            snake[0][0] + xVelocity >= 0 &&
            snake[0][0] + xVelocity < tileCount
        ) {
            snake.push([
                snake[snake.length - 1][0] + xVelocity,
                snake[snake.length - 1][1],
            ]);
            if (
                snake[snake.length - 1][0] != yFood ||
                snake[snake.length - 1][1] != xFood
            ) {
                snake.shift();
            } else {
                world[xFood][yFood] = EMPTY;
                foodCount = 0;
            }
        } else restart_game();
    }
}

/**
 *Spawns food randomly
 @param {none}
 */
function spawnFood() {
    xFood = Math.floor(Math.random() * tileCount);
    yFood = Math.floor(Math.random() * tileCount);
    for (let i = 0; i < snake.length; i++) {
        if (snake[i][0] === yFood && snake[i][1] === xFood) {
            spawnFood();
        } else world[yFood][xFood] = FOOD;
    }
}

/**
 * Refresh the world tab to set new values
 * @param {none}
 */
function refreshWorld() {
    for(let i = 0; i < world.length; i++) {
        for (let j = 0; j < world.length; j++) {
            world[i][j] = EMPTY;
        }
    }
    for(let k = 0; k < snake.length; k++) {
        if(k == snake.length - 1) world[snake[k][0]][snake[k][1]] = HEAD;
        else world[snake[k][0]][snake[k][1]] = QUEUE;
    }
    world[yFood][xFood] = FOOD;
}

/**
 * Draw the canvas wich show the world
 * @param {none}
 */
function drawWorld() {
    for (let i = 0; i < world.length; i++) {
        for (let j = 0; j < world.length; j++) {
            switch (world[i][j]) {
                case "Q":
                    context.fillStyle = "#00a24c";
                    break;
                case "E":
                    context.fillStyle = eColor;
                    break;
                case "F":
                    context.fillStyle = fColor;
                    break;
                case "H":
                    context.fillStyle = hColor;
                    break;
                default:
                    break;
            }
            context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
    }
}

/**
 * Set keyboard inputs
 * @param {event} event
 */
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
            console.log(world);
            yVelocity = 0;
            xVelocity = 0;
            break;
        default:
            break;
    }
}

drawGame();
