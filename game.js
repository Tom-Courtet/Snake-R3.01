const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d'); //nécessaire pour dessiner dessus
const refresh = 10;
const QUEUE = 'Q';
const EMPTY = 'E';
const FOOD = 'F';
const HEAD = 'H';
const tileCount=20;
const tileSize=20;
let xVelocity=0;
let yVelocity=0;

let world = [
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY], // chaque constante = 20x20
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, HEAD, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, FOOD, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

let snake = [[2,1]];


document.body.addEventListener('keydown', keyDown);

function drawGame(){

    refreshWorld();
    drawWorld();
    setTimeout(drawGame, 1000/refresh);

}

function refreshWorld() {
    for(let i = 0; i < world.length; i++) {
        for (let j = 0; j < world.length; j++) {
            for(let k = 0; k < snake.length; k++) {
                if(i == snake[k][0] && j == snake[k][1]) {
                    world[i][j] = HEAD;
                } else world[i][j] = EMPTY;
            }
        }
    }
}

function drawWorld() {
    for(let i = 0; i < world.length; i++) {
        for (let j = 0; j < world.length; j++) {
            switch (world[i][j]) {
                case 'Q':
                    context.fillStyle="#00a24c";
                    break;
                case 'E':
                    context.fillStyle="lightblue";
                    break;
                case 'F':
                    context.fillStyle="red";
                    break;
                case 'H':
                    context.fillStyle="#004721";
                    break;
                default:
                     break;
            }
            context.fillRect(i*tileSize, j*tileSize , tileSize, tileSize);
        }
    }
}


function keyDown(event) {
    switch (event.key) {
        case 'ArrowDown':
        case 's':
        case 'S':
            snake[0][1] =  snake[0][1] + 1;
            break;
        case 'ArrowUp':
        case 'z':
        case 'Z':
            snake[0][1] =  snake[0][1] - 1;
            break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
            snake[0][0] =  snake[0][0] - 1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            snake[0][0] =  snake[0][0] + 1;
            break;
        case 'Escape':
            yVelocity = 0;
            xVelocity = 0;
            break;
        default:
            console.log(event.key);
            break;
    }
}

drawGame();