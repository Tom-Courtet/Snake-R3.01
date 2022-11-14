const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d'); //nécessaire pour dessiner dessus
const refresh = 5;
const tileCount=20;
const tileSize=20;
let headX=0;
let headY=0;
let xVelocity=0;
let yVelocity=0;


document.body.addEventListener('keydown', keyDown);

function drawGame(){

    clearScreen();
    drawSnake();
    moveSnake();
    setTimeout(drawGame, 1000/refresh);

}

function clearScreen(){

    context.fillStyle = 'lightblue';
    context.fillRect(0, 0, 500, 500);

}

function drawSnake() {

    context.fillStyle="orange";
    context.fillRect(headX, headY, tileSize, tileSize);

}

function moveSnake() {
    headX = headX + xVelocity * 20;
    headY = headY + yVelocity * 20;
}

function keyDown(event) {
    switch (event.key) {
        case 'ArrowDown':
        case 's':
        case 'S':
            // si je suis en direction du haut alors arrêt
            if (yVelocity !== -1) {
                yVelocity = 1;
                xVelocity = 0;
            }
            break;
        case 'ArrowUp':
        case 'z':
        case 'Z':
            if (yVelocity !== 1) {
                yVelocity = -1;
                xVelocity = 0;
            }
            break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
            if (xVelocity !== 1) {
                yVelocity = 0;
                xVelocity = -1;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (xVelocity !== -1) {
                yVelocity = 0;
                xVelocity = 1;
            }
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