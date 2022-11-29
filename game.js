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
                    case "W":
                        context.fillStyle = "#747d8c";
                    default:
                        break;
                }
                context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
            }
        }
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
