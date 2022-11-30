//------------------------------------------------------------------------------
//
//          AVANT DE LANCER LE JEU
//
//------------------------------------------------------------------------------
// Variables dont on récupère les valeurs dans le .json
var tileCount;
var tileSize;
var refresh;
var walls;

// Boutons de séléction du niveau
const levels = document.getElementsByTagName("button");

// Méthode déclenchée lors de l'appui sur un bouton
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

// Ajout des écouteurs sur les boutons
for (let button of levels) {
    button.addEventListener("click", buttonPressed);
}

// Change le hash dans le lien avec le niveau correspondant
function changeHash(level) {
    var url_ob = new URL(document.URL);
    url_ob.hash = '#' + level;

    // new url
    var new_url = url_ob.href;

    // change the current url
    document.location.href = new_url;
}

// Ecouteur sur le changement de hash dans le lien
window.addEventListener('hashchange', () => {
    if(location.hash !== "") {
        setLevel(location.hash.replace("#", ""));
    }
}, false);

// Récupération des données du niveau choisi (après changement du hash) et initialisation des variables
function setLevel(num) {
    const url = "json/" + num + ".json";
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw "Error " + response.status;
            }
        })
        .then(function (data) {
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


//------------------------------------------------------------------------------
//
//          PENDANT LE JEU
//
//------------------------------------------------------------------------------

// Constantes utilisées pour remplir le tableau world
const QUEUE = "Q";
const EMPTY = "E";
const FOOD = "F";
const HEAD = "H";
const WALL = "W";

// Fonction générale qui gère le jeu
function startGame() {
    // Variables du canvas
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");

    // Position de la case au centre
    const milieu = Math.floor(tileCount / 2);

    // Ecouteur des touches entrées au clavier
    document.body.addEventListener("keydown", keyDown);

    // Image utilisée pour dessiner des élements
    sprite = new Image();
    sprite.src = '/sprite.png';

    // Couleurs
    let eColor = "#22C55E";

    // Indique la direction du serpent

    const milieu = Math.floor(tileCount / 2);

    /* -------------------------------------------------------- */
    //VARIABLES
    /* -------------------------------------------------------- */
    let xVelocity = 0;
    let yVelocity = 0;

    // Nombre de nourriture présente dans le tableau world
    let foodCount = 0;

    // Position de la nourriture
    let xFood = 0;
    let yFood = 0;

    // Tableau world, initialisé plus tard
    let world = [];

    // Représente le serpent (position 0 : bout de la queue // dernière position : tête)
    let snake = [
        [milieu - 2, milieu + 2],
        [milieu - 1, milieu + 2],
        [milieu, milieu + 2],
        [milieu, milieu + 1],
        [milieu, milieu]
    ];

    // Initialisation du tableau world avec le nombre de cases du niveau
    initWorld(tileCount);

    /**
     * Initialisation du tableau world
     * @param {Number} tileCount
     */
    function initWorld(tileCount) {
        for (let i = 0; i < tileCount; i++) {
            world[i] = [];
            for (let j = 0; j < tileCount; j++) {
                // On met toutes les cases du tableau à "VIDE" pour l'initialiser
                world[i].push(EMPTY);
            }
        }
    }

    /**
     * Gère toutes les fonctions du jeu. Se répète périodiquement
     * @param {none}
     */
     function drawGame() {
        if (foodCount === 0) {
            spawnFood();
            foodCount = 1;
        }
        moveSnake();
        if (bitingTail() || hittingWall()) restart_game(snake.length - 3);
        refreshWorld();
        drawWorld();
        drawScore();
        setTimeout(drawGame, 1000 / refresh);
    }

    /**
     * Fait apparaître de la nourriture aléatoirement
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
     * S'occupe du déplacement du serpent
     * @param {none}
     */
     function moveSnake() {
        if (yVelocity !== 0) {
            // Direction : vers le haut et vers le bas
            // Vérification si le déplacement est possible et si l'on ne sort pas du monde
            if (snake[snake.length - 1][1] + yVelocity >= 0 && snake[snake.length - 1][1] + yVelocity < tileCount) {
                snake.push([snake[snake.length - 1][0], snake[snake.length - 1][1] + yVelocity]);
                if (snake[snake.length - 1][0] != yFood || snake[snake.length - 1][1] != xFood) {
                    snake.shift();
                } else {
                    world[xFood][yFood] = EMPTY;
                    foodCount = 0;
                }
            } else restart_game(snake.length - 3);
        } else if (xVelocity !== 0) {
            // Direction : vers la gauche et vers la droite
            // Vérification si le déplacement est possible et si l'on ne sort pas du monde
            if (snake[snake.length - 1][0] + xVelocity >= 0 && snake[snake.length - 1][0] + xVelocity < tileCount) {
                snake.push([snake[snake.length - 1][0] + xVelocity, snake[snake.length - 1][1]]);
                if (snake[snake.length - 1][0] != yFood || snake[snake.length - 1][1] != xFood) {
                    // Pas de nourriture mangée : on raccourcit le serpent
                    snake.shift();
                } else {
                    // Nourriture mangée : on la supprime de world et on décrémente foodCount
                    world[xFood][yFood] = EMPTY;
                    foodCount = 0;
                }
            } else restart_game(snake.length - 3);
        }
    }

    /**
     * Vérifie si le serpent est en contact avec sa queue
     * @returns {Boolean} true si le serpent est en contact avec une partie de sa queue, false sinon
     */
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

    /**
     * Vérifie si le serpent a percuté un mur
     * @returns {Boolean} true si le serpent est en contact avec un mur, false sinon
     */
    function hittingWall() {
        for(let i = 0; i < walls.length; i++) {
            if(snake[snake.length - 1][0] == walls[i][0] && snake[snake.length - 1][1] == walls[i][1]) return true;
        }
        return false;
    }
    
    /**
     * Mets world à jour en fonction du serpent, de la nourriture et des murs
     * @param {none}
     */
    function refreshWorld() {
        for (let i = 0; i < world.length; i++) {
            for (let j = 0; j < world.length; j++) {
                // Toutes les cases sont mises à "EMPTY"
                world[i][j] = EMPTY;
            }
        }
        for(let k = 0; k < snake.length; k++) {
            // On mets le serpent au bon endroit dans world
            if(k === snake.length - 1) {
                // C'est la tête
                world[snake[k][0]][snake[k][1]] = HEAD;
            } else {
                world[snake[k][0]][snake[k][1]] = QUEUE;
            }
        }
        // On met la nourriture au bon endroit
        world[yFood][xFood] = FOOD;
        if(walls.length > 0) {
            // Il y a des murs définis dans le json et on les place
            for(i = 0 ; i < walls.length ; i++) {
                let x = walls[i][0];
                let y = walls[i][1];
                world[y][x] = WALL;
            }
        }
    }

    /**
     * Dessin sur le canvas
     * @param {none}
     */
    function drawWorld() {
        // On efface tout ce qui a pu rester
        context.clearRect(0, 0, 375, 375);

        for (let i = 0; i < world.length; i++) {
            for (let j = 0; j < world.length; j++) {
                switch (world[i][j]) {
                    // Pour les parties qui utilisent le sprite : on dessine l'arrière plan puis le sprite par dessus
                    case "Q":
                        // Queue
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        drawFromSprite("Q", i, j);
                        break;
                    case "H":
                        // Tête
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        drawFromSprite("H", i, j);
                        break;
                    case "F":
                        // Nourriture
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        drawFromSprite("F", i, j);
                        break;
                    case "E":
                        // Vide
                        context.fillStyle = eColor;
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                        break;
                    case "W":
                        // Mur
                        context.fillStyle = "#747d8c";
                        context.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
                    default:
                        break;
                }
                
            }
        }
    }

    function drawFromSprite(part, i, j) {
        // Variables utilisées pour calculer la position de la partie à utiliser sur le sprite
        var tx;
        var ty;

        var prevSnakePart;
        var currentSnakePart;
        var nextSnakePart;

        switch (part) {
            case "F":
                // Nourriture
                tx = 0;
                ty = 3;
                break;
            case "H":
                // Tête
                prevSnakePart = snake.length - 2;
                currentSnakePart = snake.length - 1;
                nextSnakePart = -1;
                if (snake[currentSnakePart][1] < snake[prevSnakePart][1]) {
                    // Vers le haut
                    tx = 3;
                    ty = 0;
                } else if (snake[currentSnakePart][0] > snake[prevSnakePart][0]) {
                    // Vers la droite
                    tx = 4;
                    ty = 0;
                } else if (snake[currentSnakePart][0] < snake[prevSnakePart][0]) {
                    // Vers la gauche
                    tx = 3;
                    ty = 1;
                } else if (snake[currentSnakePart][1] > snake[prevSnakePart][1]) {
                    // Vers le bas
                    tx = 4;
                    ty = 1;
                }
                break;
            case "Q":
                for(k = 0; k < snake.length; k++) {
                    // On cherche quel morceau de la queue est concerné
                    if(i === snake[k][0] && j === snake[k][1]) {
                        prevSnakePart = k - 1;
                        currentSnakePart = k;
                        nextSnakePart = k + 1;
                    }
                }
                if (currentSnakePart === 0) {
                    // C'est le bout de la queue qui est concerné
                    if (snake[nextSnakePart][0] === snake[currentSnakePart][0] && snake[nextSnakePart][1] < snake[currentSnakePart][1]) {
                        // Vers le haut
                        tx = 3;
                        ty = 2;
                    } else if (snake[nextSnakePart][0] > snake[currentSnakePart][0] && snake[nextSnakePart][1] === snake[currentSnakePart][1]) {
                        // Vers la droite
                        tx = 4;
                        ty = 2;
                    } else if (snake[nextSnakePart][0] < snake[currentSnakePart][0] && snake[nextSnakePart][1] === snake[currentSnakePart][1]) {
                        // Vers la gauche
                        tx = 3;
                        ty = 3;
                    } else if (snake[nextSnakePart][0] === snake[currentSnakePart][0] && snake[nextSnakePart][1] > snake[currentSnakePart][1]) {
                        // Vers le bas
                        tx = 4;
                        ty = 3;
                    }
                } else {
                    // C'est autre chose que le bout de la queue
                    if (snake[nextSnakePart][0] < snake[currentSnakePart][0] && snake[prevSnakePart][0] > snake[currentSnakePart][0]
                        || snake[prevSnakePart][0] < snake[currentSnakePart][0] && snake[nextSnakePart][0] > snake[currentSnakePart][0]) {
                        // De gauche à droite
                        tx = 1; 
                        ty = 0;
                    }else if (snake[nextSnakePart][1] < snake[currentSnakePart][1] && snake[prevSnakePart][1] > snake[currentSnakePart][1]
                        || snake[prevSnakePart][1] < snake[currentSnakePart][1] && snake[nextSnakePart][1] > snake[currentSnakePart][1]) {
                        // Du haut vers le bas
                        tx = 2; 
                        ty = 1;
                    } else if (snake[nextSnakePart][0] < snake[currentSnakePart][0] && snake[prevSnakePart][1] > snake[currentSnakePart][1]
                        || snake[prevSnakePart][0] < snake[currentSnakePart][0] && snake[nextSnakePart][1] > snake[currentSnakePart][1]) {
                        // Angle bas-gauche
                        tx = 2; 
                        ty = 0;
                    } else if (snake[nextSnakePart][1] > snake[currentSnakePart][1] && snake[prevSnakePart][0] > snake[currentSnakePart][0]
                        || snake[prevSnakePart][1] > snake[currentSnakePart][1] && snake[nextSnakePart][0] > snake[currentSnakePart][0]) {
                        // Angle bas-droit
                        tx = 0; 
                        ty = 0;
                    
                    } else if (snake[nextSnakePart][1] < snake[currentSnakePart][1] && snake[prevSnakePart][0] < snake[currentSnakePart][0]
                        || snake[prevSnakePart][1] < snake[currentSnakePart][1] && snake[nextSnakePart][0] < snake[currentSnakePart][0]) {
                        // Angle haut-gauche
                        tx = 2; 
                        ty = 2;
                    } else if (snake[nextSnakePart][0] > snake[currentSnakePart][0] && snake[prevSnakePart][1] < snake[currentSnakePart][1]
                        || snake[prevSnakePart][0] > snake[currentSnakePart][0] && snake[nextSnakePart][1] < snake[currentSnakePart][1]) {
                        // Angle haut-droit
                        tx = 0; 
                        ty = 1;
                    }
                }
                break;
            default:
                break;
        }
        // Sur sprite, on prend 64 pixels sur 64 aux coordonnées tx*64, ty*64
        // On la met aux coordonnées i*tileSize, j*tileSize avec pour taille tileSize sur tileSize
        context.drawImage(sprite, tx*64, ty*64, 64, 64, i * tileSize, j * tileSize, tileSize, tileSize);
    }

    /**
     * Dessiner le score sur le canvas
     * @param {none}
     */
    function drawScore() {
        context.fillStyle = "#ffffff";
        context.font = "50px Arial";
        context.fillText(snake.length - 3, 375/2 - 1/3*50, 375/2 + 1/3*50);
    }

    /**
     * Fonction lancée lorsqu'une partie se termine
     * @param {Number} score
     */
     function restart_game(score) {
        alert('Score final : ' + score);

        // On efface le hash de l'URL pour ne pas séléctionner de niveau de base
        var uri = window.location.toString();
        var clean_uri = uri.substring(0,uri.indexOf("#"));
        window.history.replaceState({},document.title, clean_uri);
        
        // On recharge la page
        document.location.reload(true);
    }

     /**
     * Changer la direction en fonction de la touche sur laquelle on appuie
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
                // Pause pour debug
                yVelocity = 0;
                xVelocity = 0;
                break;
            default:
                break;
        }
    }

    // On appelle cette fonction pour la première fois (qui se répètera périodiquement)
    drawGame();
}
