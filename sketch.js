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




let vehicle;
let path;
let target;
let slider;
let pause = false;
let actionNumber = 0;

let keybordLastPressedQ = 0; // pour éviter que la touche q soit pressée plusieurs fois d'un coup (déclencher plusieurs fois la pause)

let debug = true;

let vehicles = [];
let materialUX = [];

function setup() {


    //-----------------iframe-----------------
    // Créer l'iframe mais la masquer initialement
    iframeElement = createElement("iframe");
    iframeElement.attribute("src", "https://jeu.video/agario/fr/");
    iframeElement.position(0, 0);
    iframeElement.size(windowWidth, windowHeight);
    iframeElement.style("border", "none");
    iframeElement.zIndex = -1;

    //-----------------canvas-----------------
    canva = createCanvas(windowWidth, windowHeight);

    // Assurez-vous que le canvas est au-dessus de l'iframe
    let canvasElement = document.querySelector('canvas');
    canvasElement.style.zIndex = "1";
    canvasElement.style.pointerEvents = 'none';

    //canvasElement.style.pointerEvents = "none"; // Désactiver les événements de pointeur sur le canvas



    vehicle = new Vehicle(50, 50);
    target = new Target(width - 50, height - 50);

    //-----------------bouton-----------------
    iconButtonFly = createButton("🪰");
    iconButtonFly.position(10, 10);
    iconButtonFly.mousePressed(() => {
        vehicles.push(
            {
                vehicle: new Vehicle(random(width), random(height)),
            }
        );
    });

    iconButtonFuze = createButton("🚀");
    iconButtonFuze.position(40, 10);
    iconButtonFuze.mousePressed(() => {
        vehicles.push(
            {
                vehicle: new Vehicle(random(width), random(height)),
            }
        );
    });

    iconButtonOvni = createButton("🛸");
    iconButtonOvni.position(70, 10);
    iconButtonOvni.mousePressed(() => {
        vehicles.push(
            {
                vehicle: new Vehicle(random(width), random(height)),
            }
        );
    });

    //-----------------search bar-----------------
    searchBar = createInput();
    searchBar.position(10, 40);
    searchBar.size(200, 20);

    buttonSend = createButton("Send");
    buttonSend.position(217, 40);
    buttonSend.size(50, 26);
    buttonSend.mousePressed(() => {
        vehicles.push(
            {
                vehicle: new Vehicle(random(width), random(height)),
            }
        );
    });


    materialUX.push(iconButtonFly, iconButtonFuze, iconButtonOvni, searchBar, buttonSend);



    //-----------------path-----------------
    // créer un chemin

    gestionarEvento();
}


function gestionarEvento() {
    console.log("Setting up event listeners...");
    let canvasElement = document.querySelector('canvas');
    canvasElement.addEventListener('click', (event) => {
        materialUX.forEach((element) => {
            let rect = element.elt.getBoundingClientRect();
            if (event.clientX >= rect.left && event.clientX <= rect.right &&
                event.clientY >= rect.top && event.clientY <= rect.bottom) {
                console.log("UI Element clicked:", element);
                event.stopPropagation();
                event.preventDefault();
            } else {
                console.log('Clique hors de la zone importante');
                canvas.style.pointerEvents = 'none';
            }
        });
    });
}


async function newPath() {
    // A path is a series of connected points
    // A more sophisticated path might be a curve
    path = new Path();
    let offset = 30;
    path.addPoint(offset, offset);
    path.addPoint(width - offset, offset);
    path.addPoint(width - offset, height - offset);
    path.addPoint(width / 2, height - offset * 3);
    path.addPoint(offset, height - offset);
}

async function mousePressed() {
    //if (vehicle.contains(mouseX, mouseY)) {
    //    console.log("Vehicle clicked!");
    // Ajoutez ici l'action à exécuter lorsque le véhicule est cliqué
    //}
}


async function draw() {
    clear(); // pour effacer le canvas
    //background(0);
    //path.display();




    let d = p5.Vector.dist(vehicle.pos, target.pos);
    if (d < vehicle.r + target.r) {
        target = new Target(random(width), random(height));
        vehicle.pos.set(width / 2, height / 2);
    }

    if (!pause) {
        vehicle.update();
        vehicle.show();
        target.update();
        for (let v of vehicles) {
            v.vehicle.update();
            v.vehicle.show();
        }
    }



    vehicle.edges();
    target.edges();
    target.show();




    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "q":
                if (millis() - keybordLastPressedQ > 200) {
                    keybordLastPressedQ = millis();
                    pause = !pause;
                    debug ? console.log("pause", pause) : null;
                }

                break;
            case "a":
                actionNumber = 0;
                break;
            case "z":
                actionNumber = 1;
                break;
            case "e":
                actionNumber = 2;
                break;
            case "r":
                actionNumber = 3;
                break;
            case "t":
                actionNumber = 4;
                break;
            case "y":
                actionNumber = 5;
                break;
            case "u":
                actionNumber = 6;
                break;

            case "d":
                debug = !debug;
                console.log("debug mode", debug);
                break;
            case "ArrowUp":
                console.log("up");
                break;




        }
    });

    switch (actionNumber) {
        case 0:
            // chercher
            steering = vehicle.seek(target.pos);
            vehicle.applyForce(steering);
            console.log("seek (chercher)");
            break;
        case 1:
            steering = vehicle.flee(target.pos);
            vehicle.applyForce(steering);
            console.log("flee (fuir)");
            break;
        case 2:
            steering = vehicle.pursue(target);
            vehicle.applyForce(steering);
            console.log("pursue (poursuivre)");
            break;
        case 3:
            steering = vehicle.evade(target);
            vehicle.applyForce(steering);
            console.log("evade (éviter)");
            break;
        case 4:
            steering = vehicle.arrive(createVector(300, 300));
            vehicle.applyForce(steering);
            console.log("arrive (arriver)");
            break;
        case 5:
            vehicle.wander();
            console.log("wander (errer)");
            break;
        case 6:
            vehicle.applyBehaviors([vehicle], path);
            console.log("follow (suivre)");
            break;

    }
}






// Créer l'iframe mais la masquer initialement


// Assurez-vous que le canvas est au-dessus de l'iframe
let canvasElement = document.querySelector('canvas');
canvasElement.style.zIndex = "1";
iframeElement.size(windowWidth - 60, windowHeight);

canvasElement.position(60, 0);
canvasElement.style.pointerEvents = "none"; // Désactiver les événements de pointeur sur le canvas

div_icon_bar = createDiv();
div_icon_bar.position(0, 0);
div_icon_bar.style("background-color", "rgb(255, 255, 255)");
div_icon_bar.style("color", "white");
div_icon_bar.style("height", "100vh");
div_icon_bar.style("width", "60px");
