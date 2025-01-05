// More Steering Behaviors! (Pursue Slider Prediction)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/Q4MU7pkDYmQ
// https://thecodingtrain.com/learning/nature-of-code/5.3-flee-pursue-evade.html

// Flee: https://editor.p5js.org/codingtrain/sketches/v-VoQtETO
// Pursue: https://editor.p5js.org/codingtrain/sketches/Lx3PJMq4m
// Evade: https://editor.p5js.org/codingtrain/sketches/X3ph02Byx
// Pursue Bouncing Ball: https://editor.p5js.org/codingtrain/sketches/itlyDq3ZB
// Pursue Wander: https://editor.p5js.org/codingtrain/sketches/EEnmY04lt
// Pursue Slider Prediction: https://editor.p5js.org/codingtrain/sketches/l7MgPpTUB



// -----------------------------------
// ------------- tile ----------------
// -----------------------------------q


const TILE_WIDTH = 64;
let tile_images = [];
// -----------------levelManager-----------------
let levelManager;

// taille du monde
let worldWidth;
let worldHeight;
// point de d'apparition du joueur
let playerSpawn;

// -----------------variables-----------------
// camera
let cameraPos; // Position initiale de la caméra

//----------------numberOfTheEcran------------------
let numberOfTheEcran = 0; // pour savoir quel écran est affiché


// other
let path;
let slider;
let pause = false;
let actionNumber = 0;

let keybordLastPressedQ = 0; // pour éviter que la touche q soit pressée plusieurs fois d'un coup (déclencher plusieurs fois la pause)

let debug = false;

let player; // le joueur
let projectiles_player = []; // liste des projectiles tirés par le joueur 
let projectiles_enemies = []; // liste des projectiles tirés par les véhicules enemis
let materialUX = []; // liste des éléments de l'interface utilisateur
let enemies_for_game_over = []; // liste des véhicules enemis pour l'écran de fin de jeu
let monster_win = []; // liste des monstres pour l'écran de victoire
// UI
let textLifes;
let textScore;


// Images
let backgroundWin;
let ImageFly;
let ImageAlien;
let ImageAnimatedAngelFront;
let ImageAnimatedAngelBack;
let ImageAnimatedAngelLeft;
let ImageAnimatedAngelRight;
// Font
let font;
//
let textToDrawWin = "You win"
let textToDrawWinPoints = [];

function preload() {

    // Chargement des images des svg
    ImageFly = loadImage("./data/svg/fly.svg");
    ImageAlien = loadImage("./data/svg/alien.svg");
    ImageBee = loadImage("./data/svg/bee.svg");
    ImageBeeQueen = loadImage("./data/svg/bee_queen.svg");
    ImagePlayer = loadImage("./data/svg/player.svg");
    ImageBasicProjectile = loadImage("./data/svg/basic_projectile.svg");
    backgroundWin = loadImage("./data/background.jpg");
    // Chargement des images des tuiles
    for (let i = 0; i <= 6; i++) {
        if (i < 10) {
            tile_images.push(loadImage("./data/tiles/tile_00" + i + ".png"));
        } else if (i < 100) {
            tile_images.push(loadImage("./data/tiles/tile_0" + i + ".png"));
        } else {
            tile_images.push(loadImage("./data/tiles/tile_" + i + ".png"));
        }
    }
    // Chargement des images des sprites
    ImageAnimatedBatCommon = loadImage("./data/entity/bat/bat_common.gif");
    ImageAnimatedBatRed = loadImage("./data/entity/bat/bat_red.gif");
    ImageAnimatedAngelBack = loadImage("./data/entity/angel/angel_back.gif");
    ImageAnimatedAngelFront = loadImage("./data/entity/angel/angel_front.gif");
    ImageAnimatedAngelLeft = loadImage("./data/entity/angel/angel_left.gif");
    ImageAnimatedAngelRight = loadImage("./data/entity/angel/angel_right.gif");
    // Chargement de la police
    font = loadFont('./data/fonts/Poppins/Poppins-Black.ttf');
}


function setup() {

    // -----------------textToDrawWinPoints-----------------

    let textX = 100; // Position X du texte
    let textY = 400; // Position Y du texte
    textToDrawWinPoints = font.textToPoints(textToDrawWin, textX, textY, 300, {
        sampleFactor: 0.04, // Facteur d'échantillonnage
        simplifyThreshold: 0 // Pas de simplification
    });
    //-----------------canvas-----------------
    createCanvas(windowWidth, windowHeight, WEBGL);

    cameraPos = createVector(0, 0);


    // Assurez-vous que le canvas est au-dessus de l'iframe
    let canvasElement = document.querySelector('canvas');
    canvasElement.style.zIndex = "1";
    canvasElement.style.pointerEvents = 'none';

    //canvasElement.style.pointerEvents = "none"; // Désactiver les événements de pointeur sur le canvas


    levelManager = new LevelManager();

    // taille du monde
    worldWidth = TILE_WIDTH * levelManager.getCurrentLevel().grid_tile[0].length;

    worldHeight = TILE_WIDTH * levelManager.getCurrentLevel().grid_tile.length;

    // -----------------Player----------------- 
    playerSpawn = levelManager.getCurrentLevel().position_player;
    player = new Player(playerSpawn.x, playerSpawn.y, ImageAnimatedAngelBack, ImageAnimatedAngelFront, ImageAnimatedAngelLeft, ImageAnimatedAngelRight);




    // -----------------materialUX-----------------

    // lifes
    textLifes = createP(`Lifes: ${player.lives}`);
    textLifes.position(10, 10);
    textLifes.style('color', 'white');
    textLifes.style('font-size', '20px');
    textLifes.style('z-index', '2');

    // score
    textScore = createP(`Score: ${player.score}`);
    textScore.position(10, 30);
    textScore.style('color', 'white');
    textScore.style('font-size', '20px');
    textScore.style('z-index', '2');





    // debug bouton
    buttonDebug = createButton("Debug");
    buttonDebug.style('z-index', '2');
    buttonDebug.style('background-color', debug ? '#ffff00' : '#555550');
    buttonDebug.position(10, 80);
    buttonDebug.mousePressed(() => {
        //changer l'url de l'iframe
        debug = !debug;
        buttonDebug.style('background-color', debug ? '#ffff00' : '#555550');
    });

    // pause bouton 
    buttonPause = createButton("Pause");
    buttonPause.style('z-index', '2');
    buttonPause.style('background-color', pause ? '#ffff00' : '#555550');
    buttonPause.position(70, 80);
    buttonPause.mousePressed(() => {
        pause = !pause;
        buttonPause.style('background-color', pause ? '#ffff00' : '#555550');
        rectangle.style('display', 'block');
    });

    // pause menu
    rectangle = createDiv();
    rectangle.position(0, 0);
    rectangle.style('background-color', 'rgba(0, 0, 0, 0.88)');
    rectangle.style('width', '100%');
    rectangle.style('height', '100%');
    rectangle.style('display', 'none');
    bouton_rectangle = createButton("Continue");
    bouton_rectangle.position(width / 2, height / 2);
    bouton_rectangle.mousePressed(() => {
        pause = !pause;
        buttonPause.style('background-color', pause ? '#ffff00' : '#555550');
        rectangle.style('display', 'none');

    });
    bouton_rectangle.parent(rectangle); // Définissez la div comme parent du bouton
    //rectangle.style('display', 'none');
    rectangle.style('z-index', '2');

    //menu game over
    bouton_game_over = createButton("Recommencer");
    bouton_game_over.style('z-index', '2');
    bouton_game_over.position(width / 2, height / 2);
    bouton_game_over.mousePressed(() => {
        numberOfTheEcran = 0;
        player.lives = 3;
    }
    );
    bouton_game_over.style('display', 'none');






    //-----------------path-----------------
    // créer un chemin

    // -----------------camera-----------------
    cam = createCamera();
    // touches




}

// Fonction pour dessiner la grille
function draw_grid() {
    for (let i = 0; i < levelManager.getCurrentLevel().grid_tile.length; i++) {
        for (let j = 0; j < levelManager.getCurrentLevel().grid_tile[i].length; j++) {
            let tileIndex = int(levelManager.getCurrentLevel().grid_tile[i][j]);
            if (tileIndex >= 0 && tileIndex < tile_images.length) {
                draw_tile(tile_images[tileIndex], j, i);
            } else {
                console.error(`Invalid tile index at grid_tile[${i}][${j}]: ${tileIndex}`);
            }
        }
    }
}

//


function draw_tile(img, x, y) {
    if (img) {
        image(img, x * TILE_WIDTH, y * TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
    } else {
        console.error(`Image is undefined at position (${x}, ${y})`);
    }
}


// 
function updateCamera() {
    // Par exemple, on fait suivre la caméra à la position du joueur
    cameraPos.x = player.pos.x - width / 2; // Centrer la caméra sur le joueur
    cameraPos.y = player.pos.y - height / 2;
}




async function mousePressed() {
    //if (vehicle.contains(mouseX, mouseY)) {
    //    console.log("Vehicle clicked!");
    // Ajoutez ici l'action à exécuter lorsque le véhicule est cliqué
    //}
}

/*
Fonction pour mettre a jour les projectiles 
- supprimer les projectiles expirés
- tester les collisions
*/
function actionProjectiles() {
    // ----------------------------------------
    // Dans les deux boucles suivantes, nous supprimons les projectiles expirés
    // ----------------------------------------
    for (i = 0; i < projectiles_player.length; i++) {

        if (projectiles_player[i].isExpired()) {
            projectiles_player.splice(projectiles_player[i], 1);
        }
    }
    for (i = 0; i < projectiles_enemies.length; i++) {

        if (projectiles_enemies[i].isExpired()) {
            projectiles_enemies.splice(projectiles_enemies[i], 1);
        }
    }
    // ----------------------------------------
    // Test de collision entre les projectiles et les véhicules
    // ----------------------------------------
    for (let i = 0; i < projectiles_player.length; i++) {
        for (let j = 0; j < levelManager.getCurrentLevel().enemies.length; j++) {
            if (projectiles_player[i].detectCollision(levelManager.getCurrentLevel().enemies[j])) {
                player.score += 1;
                levelManager.getCurrentLevel().enemies.splice(j, 1);
                projectiles_player.splice(i, 1);
            }
        }
    }
    for (let i = 0; i < projectiles_enemies.length; i++) {
        if (player.pos.dist(projectiles_enemies[i].pos) < 30) {
            player.lives -= 1;
            if (player.lives <= 0) {
                numberOfTheEcran = 1;
            }
            projectiles_enemies.splice(i, 1);
        }
    }
    // ----------------------------------------
    // Test de collision entre enemies et le joueur
    // ----------------------------------------
    for (let i = 0; i < levelManager.getCurrentLevel().enemies.length; i++) {
        if (levelManager.getCurrentLevel().enemies[i].detectCollisionWithPoint(player.pos, 10)) {
            player.lives -= 1;
            if (player.lives <= 0) {
                numberOfTheEcran = 1;
            }
            levelManager.getCurrentLevel().enemies[i].pos = createVector(random(width), random(height));
        }
    }
}

function upgrateMaterialUX() {
    textLifes.html(`Lifes: ${player.lives}`);
    textScore.html(`Score: ${player.score}`);
    if (numberOfTheEcran == 1) {
        bouton_game_over.style('display', 'block');
    } else {
        bouton_game_over.style('display', 'none');
    }
}


async function draw() {
    clear(); // pour effacer le canvas
    upgrateMaterialUX(); // Mettre à jour les éléments de l'interface utilisateur

    if (numberOfTheEcran == 0) {
        levelManager.update();
        updateCamera(); // Mettre à jour la position de la caméra
        actionProjectiles(); // Mettre à jour les projectiles
        background(10);
        draw_grid();
        // desiner les bords du monde
        push();
        stroke(255);
        noFill();
        rect(0, 0, worldWidth, worldHeight);
        pop();
        // Déplace la caméra pour voir l'objet 3D
        cam.setPosition(player.pos.x, player.pos.y, 700);






        /*
        Afficher les éléments de l'interface utilisateur et les mettre à jour
        mais seulement si le mode debug est activé
        */

        player.edges();
        player.show();
        for (let e of levelManager.getCurrentLevel().enemies) {
            if (!pause) e.update();
            e.action();
            e.edges();
            e.show();
        }
        for (let p of projectiles_player) {
            if (!pause) p.update();
            p.action();
            p.edges();
            p.show();
        }
        for (let p of projectiles_enemies) {
            if (!pause) p.update();
            p.action();
            p.edges();
            p.show();
        }


        test();
    }
    else if (numberOfTheEcran == 1) {
        cameraPos.x = width / 2;
        cameraPos.y = height / 2;
        cam.setPosition(cameraPos.x, cameraPos.y, 700);

        // écran de fin de jeu
        background(10);
        textSize(32);
        fill(255);
        text("Game Over", width / 2, height / 2);
        levelManager.reset();
        if (debug) {
            path.display();
        }

    }
    else if (numberOfTheEcran == 2) {

        cameraPos.x = width / 2;
        cameraPos.y = height / 2;
        cam.setPosition(cameraPos.x, cameraPos.y, 700);


        // écran de pause
        background(10);
        // charger une image en fond
        image(
            backgroundWin,
            0,
            0,
            width,
            height);
        // Obtenir les coordonnées de la boîte englobante

        // parcourir les points et les afficher
        for (let i = 0; i < textToDrawWinPoints.length; i++) {
            let p = textToDrawWinPoints[i];
            // Couleur jaune
            stroke(255, 255, 0);
            strokeWeight(4);
            point(p.x, p.y);
        }

        for (let e of monster_win) {
            if (!pause) e.update();
            e.action();
            //e.edges();
            e.show();
        }

        textSize(32);
        fill(255);
        text("Pause", width / 2, height / 2);
        levelManager.reset();

    }

}







