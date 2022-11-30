// Ecouteur de clic sur bouton pour niveau -> on change le hash
// Ecouteur de changement de hash -> setLevel()

const levels = document.getElementsByTagName("button");
var tileCount;
var tileSize;
var refresh;
var walls;



window.addEventListener('hashchange', () => {
    if(location.hash !== "") {
        setLevel(location.hash.replace("#", ""));
    }
}, false);

function setLevel(num) {
    const url = "json/" + num + ".json";
    fetch(url)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
            throw ("Error " + response.status);
            }
        })
        .then (function(data) {
            document.querySelector(".welcome").classList.add("invisible");
            // création du canvas
            var newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("id", "board");
            newCanvas.setAttribute("width", "375");
            newCanvas.setAttribute("height", "375");
            document.querySelector(".canvas").appendChild(newCanvas);

            // initialisation des variables avec le niveau choisi
            tileCount = data.tileCount;
            tileSize = data.tileSize;
            refresh = data.refresh;
            walls = data.walls;

            // lancement du jeu
            startGame();
        })
        .catch(function (err) {
            console.log(err);
        });
}

function changeHash(level) {
    var url_ob = new URL(document.URL);
    url_ob.hash = '#' + level;

    // new url
    var new_url = url_ob.href;

    // change the current url
    document.location.href = new_url;
}

const buttonPressed = e => {
    switch(e.target.id) {
        case "level-1":
        case "level-2":
        case "level-3":
            changeHash(e.target.id);
            break;
        default:
            break;
    }
  }
  
for (let button of levels) {
    button.addEventListener("click", buttonPressed);
}

/* -------------------------------------------------------- */
//CONSTANTS
/* -------------------------------------------------------- */
const QUEUE = "Q";
const EMPTY = "E";
const FOOD = "F";
const HEAD = "H";
const WALL = "W";


function startGame() {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d"); //nécessaire pour dessiner dessus
    document.body.addEventListener("keydown", keyDown);
    const milieu = Math.floor(tileCount / 2);

    // Gestion des parties du corps du snake : on attend que l'image soit chargée
    var loaded = 0;
    sprite = new Image();
    sprite.src = '/sprite.png';
    
    /* -------------------------------------------------------- */
    //VARIABLES
    /* -------------------------------------------------------- */
    let eColor = "#22C55E";
    let hColor = "#004721";
    let fColor = "red";
    let xVelocity = 0;
    let yVelocity = 0;
    let foodCount = 0;
    let xFood = 0;
    let yFood = 0;
    let world = [];
    let snake = [
        [milieu - 2, milieu + 2],
        [milieu - 1, milieu + 2],
        [milieu, milieu + 2],
        [milieu, milieu + 1],
        [milieu, milieu]
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
     * @param {Number} score
     */
    function restart_game(score) {
        alert('Score final : ' + score);

        // remove hash from url so no json is loaded
        var uri = window.location.toString();
        var clean_uri = uri.substring(0,
                        uri.indexOf("#"));
        window.history.replaceState({},
        document.title, clean_uri);
        
        // reload page
        document.location.reload(true);
    }

    function bitingTail() {
        for(let i = 0; i < snake.length; i++) {
            for(let j = 0; j < snake.length; j++) {
                if(i != j) {
                    if(snake[i][0] === snake[j][0] && snake[i][1] === snake[j][1]) return true;
                }
            }
        }
        return false;
    }

    function hittingWall() {
        for(let i = 0; i < walls.length; i++) {
            if(snake[snake.length - 1][0] == walls[i][0] && snake[snake.length - 1][1] == walls[i][1]) return true;
        }
        return false;
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
        moveSnake();
        if(bitingTail() || hittingWall()) restart_game(snake.length - 3);
        refreshWorld();
        drawWorld();
        drawScore();
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
            } else restart_game(snake.length - 3);
        } else if (xVelocity !== 0) {
            if (
                snake[snake.length - 1][0] + xVelocity >= 0 &&
                snake[snake.length - 1][0] + xVelocity < tileCount
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
            } else restart_game(snake.length - 3);
        }
    }

    /**
     * Spawns food randomly
     * @param {none}
     */
    function spawnFood() {
        xFood = Math.floor(Math.random() * tileCount);
        yFood = Math.floor(Math.random() * tileCount);
        for (let i = 0; i < snake.length; i++) {
            if (snake[i][0] === yFood && snake[i][1] === xFood) {
                spawnFood();
            } 
        }
        for(let i = 0; i < walls.length; i ++){
            if(walls[i][0] === yFood && walls[i][1] === xFood) {
                spawnFood();
            }
        }
        world[yFood][xFood] = FOOD;
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
            if(k === snake.length - 1) {
                world[snake[k][0]][snake[k][1]] = HEAD;
            }
            else {
                world[snake[k][0]][snake[k][1]] = QUEUE;
            }
        }
        world[yFood][xFood] = FOOD;
        if(walls.length > 0) { // alors il y a des murs définis dans le json
            for(i = 0 ; i < walls.length ; i++) {
                let x = walls[i][0];
                let y = walls[i][1];
                world[y][x] = WALL;
            }
        }
    }

    /**
     * Draw the canvas wich show the world
     * @param {none}
     */
    function drawWorld() {
        context.clearRect(0, 0, 375, 375);
        for (let i = 0; i < world.length; i++) {
            for (let j = 0; j < world.length; j++) {
                switch (world[i][j]) {
                    // pour les parties qui utilisent le sprite : on dessine l'arrière plan puis le sprite par dessus
                    case "Q":
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        drawFromSprite("Q", i, j);
                        break;
                    case "H":
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        drawFromSprite("H", i, j);
                        break;
                    case "F":
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        drawFromSprite("F", i, j);
                        break;
                    case "E":
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        break;
                    case "W":
                        context.fillStyle = "#747d8c";
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                    default:
                        break;
                }
                
            }
        }
    }

    function drawFromSprite(part, i, j) {
        var tx;
        var ty;
        var prevSnakePart;
        var currentSnakePart;
        var nextSnakePart;        
        switch (part) {
            case "F":
                tx = 0;
                ty = 3;
                break;
            case "H":
                prevSnakePart = snake.length - 2;
                currentSnakePart = snake.length - 1;
                nextSnakePart = -1;
                if (snake[currentSnakePart][1] < snake[prevSnakePart][1]) {
                    // vers le haut
                    tx = 3;
                    ty = 0;
                } else if (snake[currentSnakePart][0] > snake[prevSnakePart][0]) {
                    // vers la droite
                    tx = 4;
                    ty = 0;
                } else if (snake[currentSnakePart][0] < snake[prevSnakePart][0]) {
                    // vers la gauche
                    tx = 3;
                    ty = 1;
                } else if (snake[currentSnakePart][1] > snake[prevSnakePart][1]) {
                    // vers le bas
                    tx = 4;
                    ty = 1;
                }
                break;
            case "Q":
                for(k = 0; k < snake.length; k++) {
                    if(i === snake[k][0] && j === snake[k][1]) {
                        prevSnakePart = k - 1;
                        currentSnakePart = k;
                        nextSnakePart = k + 1;
                    }
                }
                if (currentSnakePart === 0) {
                    // c'est le bout de la queue
                    if (snake[nextSnakePart][0] === snake[currentSnakePart][0] && snake[nextSnakePart][1] < snake[currentSnakePart][1]) {
                        // vers le haut
                        tx = 3;
                        ty = 2;
                    } else if (snake[nextSnakePart][0] > snake[currentSnakePart][0] && snake[nextSnakePart][1] === snake[currentSnakePart][1]) {
                        // vers la droite
                        tx = 4;
                        ty = 2;
                    } else if (snake[nextSnakePart][0] < snake[currentSnakePart][0] && snake[nextSnakePart][1] === snake[currentSnakePart][1]) {
                        // vers la gauche
                        tx = 3;
                        ty = 3;
                    } else if (snake[nextSnakePart][0] === snake[currentSnakePart][0] && snake[nextSnakePart][1] > snake[currentSnakePart][1]) {
                        // vers le bas
                        tx = 4;
                        ty = 3;
                    }
                } else {
                    if (snake[nextSnakePart][0] < snake[currentSnakePart][0] && snake[prevSnakePart][0] > snake[currentSnakePart][0] || snake[prevSnakePart][0] < snake[currentSnakePart][0] && snake[nextSnakePart][0] > snake[currentSnakePart][0]) {
                        // Horizontal Left-Right
                        tx = 1; 
                        ty = 0;
                    } else if (snake[nextSnakePart][0] < snake[currentSnakePart][0] && snake[prevSnakePart][1] > snake[currentSnakePart][1] || snake[prevSnakePart][0] < snake[currentSnakePart][0] && snake[nextSnakePart][1] > snake[currentSnakePart][1]) {
                        // Angle Left-Down
                        tx = 2; 
                        ty = 0;
                    } else if (snake[nextSnakePart][1] < snake[currentSnakePart][1] && snake[prevSnakePart][1] > snake[currentSnakePart][1] || snake[prevSnakePart][1] < snake[currentSnakePart][1] && snake[nextSnakePart][1] > snake[currentSnakePart][1]) {
                        // Vertical Up-Down
                        tx = 2; 
                        ty = 1;
                    } else if (snake[nextSnakePart][1] < snake[currentSnakePart][1] && snake[prevSnakePart][0] < snake[currentSnakePart][0] || snake[prevSnakePart][1] < snake[currentSnakePart][1] && snake[nextSnakePart][0] < snake[currentSnakePart][0]) {
                        // Angle Top-Left
                        tx = 2; 
                        ty = 2;
                    } else if (snake[nextSnakePart][0] > snake[currentSnakePart][0] && snake[prevSnakePart][1] < snake[currentSnakePart][1] || snake[prevSnakePart][0] > snake[currentSnakePart][0] && snake[nextSnakePart][1] < snake[currentSnakePart][1]) {
                        // Angle Right-Up
                        tx = 0; 
                        ty = 1;
                    } else if (snake[nextSnakePart][1] > snake[currentSnakePart][1] && snake[prevSnakePart][0] > snake[currentSnakePart][0] || snake[prevSnakePart][1] > snake[currentSnakePart][1] && snake[nextSnakePart][0] > snake[currentSnakePart][0]) {
                        // Angle Down-Right
                        tx = 0; 
                        ty = 0;
                    }
                }
                break;
            default:
                break;
        }
        // logique tête :
            // si le morceau d'avant est en dessous : sprite vers le haut
            // si le morceau d'avant est à gauche : sprite à droite
            // si le morceau d'avant est à droite : sprite à gauche
            // si le morceau d'avant est au dessus : sprite vers le bas
        context.drawImage(sprite, tx*64, ty*64, 64, 64, i * tileSize, j * tileSize, tileSize, tileSize);
    }

    /**
     * Draw score on canvas
     * @param {none}
     */
    function drawScore() {
        context.fillStyle = "#ffffff";
        context.font = "50px Arial";
        context.fillText(snake.length - 3, 375/2 - 1/3*50, 375/2 + 1/3*50);
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
                console.log(snake);
                yVelocity = 0;
                xVelocity = 0;
                break;
            default:
                break;
        }
    }

    drawGame();
}
