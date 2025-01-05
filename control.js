function keyPressed() {

    if (key === 'a') {
        pause = !pause;
    }
    if (key === ' ') {
        let recepteur = new p5.Vector(mouseX + cameraPos.x, mouseY + cameraPos.y);
        projectiles_player.push(VehiculeFactory.createBasicProjectile(new p5.Vector(player.pos.x, player.pos.y), recepteur));

    }


    if (keyCode === ENTER) {
        console.log("Enter key pressed");
    }



}

// Bouton 
async function test() {
    if (!pause) {
        if (keyIsDown(UP_ARROW)) {
            player.move_forward();
        }
        if (keyIsDown(90)) { // z
            player.move_forward();

        }
        if (keyIsDown(DOWN_ARROW)) {
            player.move_backward();
        }
        if (keyIsDown(83)) { // s
            player.move_backward();
        }
        if (keyIsDown(LEFT_ARROW)) {
            player.move_left();
        }
        if (keyIsDown(81)) { // q
            player.move_left();
        }
        if (keyIsDown(RIGHT_ARROW)) {
            player.move_right();
        }
        if (keyIsDown(68)) { // d
            player.move_right();
        }
    }

}

// Mouvement de souris
function mouseMoved() {
    let force;

}