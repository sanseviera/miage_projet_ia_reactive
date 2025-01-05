class Player {


    constructor(x, y, imageBack, imageFront, imageLeft, imageRight) {
        this.pos = createVector(x, y); // Position
        // ---------------- image ----------------
        this.imageBack = imageBack;
        this.imageFront = imageFront;
        this.imageLeft = imageLeft;
        this.imageRight = imageRight;
        this.currentImage = this.imageFront; // Image courante qui est affichée
        // ---------------- vie ----------------
        this.maxLives = 3;
        this.lives = this.maxLives;
        // ---------------- vitesse de déplacement ----------------
        this.speed = 5;
        // ---------------- taille ----------------
        this.largeur = 70;
        this.hauteur = 50;
        // )---------------- score ----------------
        this.score = 0;
    }

    move_forward() {
        let isOkay = true;
        let new_pos = createVector(this.pos.x, this.pos.y - this.speed);
        let bool_representant_si_le_joueur_est_dans_l_axe_x;
        let bool_representant_si_le_joueur_est_dans_l_axe_y;
        for (let i = 0; i < levelManager.getCurrentLevel().grid_access.length; i++) {
            for (let j = 0; j < levelManager.getCurrentLevel().grid_access[0].length; j++) {
                bool_representant_si_le_joueur_est_dans_l_axe_y = (new_pos.y >= i * TILE_WIDTH && new_pos.y <= i * TILE_WIDTH + TILE_WIDTH);
                bool_representant_si_le_joueur_est_dans_l_axe_x = (new_pos.x >= j * TILE_WIDTH && new_pos.x <= j * TILE_WIDTH + TILE_WIDTH);
                if (bool_representant_si_le_joueur_est_dans_l_axe_x && bool_representant_si_le_joueur_est_dans_l_axe_y && levelManager.getCurrentLevel().grid_access[i][j] == 0) {
                    isOkay = false;
                }
            }
        }
        if (isOkay) {
            this.pos = new_pos;
            this.currentImage = this.imageBack;
        }
    }

    move_backward() {
        let isOkay = true;
        let new_pos = createVector(this.pos.x, this.pos.y + this.speed);
        let bool_representant_si_le_joueur_est_dans_l_axe_x;
        let bool_representant_si_le_joueur_est_dans_l_axe_y;
        for (let i = 0; i < levelManager.getCurrentLevel().grid_access.length; i++) {
            for (let j = 0; j < levelManager.getCurrentLevel().grid_access[0].length; j++) {
                bool_representant_si_le_joueur_est_dans_l_axe_y = (new_pos.y >= i * TILE_WIDTH && new_pos.y <= i * TILE_WIDTH + TILE_WIDTH);
                bool_representant_si_le_joueur_est_dans_l_axe_x = (new_pos.x >= j * TILE_WIDTH && new_pos.x <= j * TILE_WIDTH + TILE_WIDTH);
                if (bool_representant_si_le_joueur_est_dans_l_axe_x && bool_representant_si_le_joueur_est_dans_l_axe_y && levelManager.getCurrentLevel().grid_access[i][j] == 0) {
                    isOkay = false;
                }
            }
        }
        if (isOkay) {
            this.pos = new_pos;
            this.currentImage = this.imageFront;
        }
    }

    move_left() {
        let isOkay = true;
        let new_pos = createVector(this.pos.x - this.speed, this.pos.y);
        let bool_representant_si_le_joueur_est_dans_l_axe_x;
        let bool_representant_si_le_joueur_est_dans_l_axe_y;
        for (let i = 0; i < levelManager.getCurrentLevel().grid_access.length; i++) {
            for (let j = 0; j < levelManager.getCurrentLevel().grid_access[0].length; j++) {
                bool_representant_si_le_joueur_est_dans_l_axe_y = (new_pos.y >= i * TILE_WIDTH && new_pos.y <= i * TILE_WIDTH + TILE_WIDTH);
                bool_representant_si_le_joueur_est_dans_l_axe_x = (new_pos.x >= j * TILE_WIDTH && new_pos.x <= j * TILE_WIDTH + TILE_WIDTH);
                if (bool_representant_si_le_joueur_est_dans_l_axe_x && bool_representant_si_le_joueur_est_dans_l_axe_y && levelManager.getCurrentLevel().grid_access[i][j] == 0) {
                    isOkay = false;
                }
            }
        }
        if (isOkay) {
            this.pos = new_pos;
            this.currentImage = this.imageLeft;
        }
    }

    move_right() {
        let isOkay = true;
        let new_pos = createVector(this.pos.x + this.speed, this.pos.y);
        let bool_representant_si_le_joueur_est_dans_l_axe_x;
        let bool_representant_si_le_joueur_est_dans_l_axe_y;
        for (let i = 0; i < levelManager.getCurrentLevel().grid_access.length; i++) {
            for (let j = 0; j < levelManager.getCurrentLevel().grid_access[0].length; j++) {

                bool_representant_si_le_joueur_est_dans_l_axe_y = (new_pos.y >= i * TILE_WIDTH && new_pos.y <= i * TILE_WIDTH + TILE_WIDTH);
                bool_representant_si_le_joueur_est_dans_l_axe_x = (new_pos.x >= j * TILE_WIDTH && new_pos.x <= j * TILE_WIDTH + TILE_WIDTH);
                if (bool_representant_si_le_joueur_est_dans_l_axe_x && bool_representant_si_le_joueur_est_dans_l_axe_y && levelManager.getCurrentLevel().grid_access[i][j] == 0) {
                    isOkay = false;
                }
            }
        }
        if (isOkay) {
            this.pos = new_pos;
            this.currentImage = this.imageRight;
        }
    }


    edges() {

        if (this.pos.x > width - this.r) {
            this.pos.x = width - this.r;
        } else if (this.pos.x < this.r) {
            this.pos.x = this.r;
        }
        if (this.pos.y > height - this.r) {
            this.pos.y = height - this.r;
        } else if (this.pos.y < this.r) {
            this.pos.y = this.r;
        }
    }

    show() {
        // Centrer l'image
        imageMode(CENTER);
        if (debug) {
            rectMode(CENTER);
            // DESSINER UNE RECTANGLE
            fill(255, 0, 200);
            rect(this.pos.x, this.pos.y, this.hauteur, this.largeur);
            // centrer le rectangle
        }
        // DESSINER UNE IMAGE
        image(this.currentImage, this.pos.x, this.pos.y, this.hauteur, this.largeur);
    }
}
