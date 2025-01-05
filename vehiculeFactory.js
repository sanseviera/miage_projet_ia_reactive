class VehiculeFactory {
    constructor() { }

    static createPlayer() {
        let vehicle = new Vehicle(random(width), random(height), ImageAnimatedAngel, 20, 5, 1, -1);
        vehicle.action = () => {


        }
        return vehicle;
    }

    static createFly(x, y) {
        let vehicle = new Vehicle(random(width), random(height), ImageFly, 20, 5, 1, -1);
        vehicle.action = () => {

            //if (vehicle.pos.dist(createVector(mouseX, mouseY)) < 50) {
            //  vehicle.seek(mouse.pos);
            //} else {
            vehicle.wander();
            //}
        }
        return [vehicle];
    }


    static createBat(x, y) {
        let size = 35;
        let maxSpeed = 3;
        let masse = 1;
        let vehicle = new Vehicle(random(width), random(height), ImageAnimatedBatCommon, size, maxSpeed, masse, -1);
        vehicle.action = () => {
            let force;

            for (let i = 0; i < levelManager.getCurrentLevel().enemies.length; i++) {
                // Si l'ennemi est proche d'un enemie et que ce n'est pas lui même
                if (levelManager.getCurrentLevel().enemies[i].pos.dist(vehicle.pos) < 40 && levelManager.getCurrentLevel().enemies[i] != vehicle) {
                    force = vehicle.separate(levelManager.getCurrentLevel().enemies[i]);
                    break;
                } else if (i == levelManager.getCurrentLevel().enemies.length - 1) {
                    force = vehicle.seek(createVector(player.pos.x, player.pos.y));

                }

                /*
                 force = vehicle.seek(createVector(player.pos.x, player.pos.y));
                vehicle.applyForce(force);
                */
            }
            vehicle.applyForce(force);
        }
        return [vehicle];
    }


    static createRedBat(x, y) {
        let size = 35;
        let maxSpeed = 3;
        let masse = 0.9;
        let vehicle = new Vehicle(random(width), random(height), ImageAnimatedBatRed, size, maxSpeed, masse, -1);
        vehicle.action = () => {
            let force;

            for (let i = 0; i < levelManager.getCurrentLevel().enemies.length; i++) {

                // si l'enemie est proche du joueur
                if (player.pos.dist(vehicle.pos) < 30) {
                    force = vehicle.flee(player.pos);
                    break;
                }
                // si est trop loin du joueur 
                else if (player.pos.dist(vehicle.pos) > 400) {
                    force = vehicle.seek(player.pos);
                    break;
                }
                // si les procher mais pas trop il aire 
                else {
                    force = vehicle.wander();
                    break; s
                }
            }
            // tire un misile toute les 100 frames
            if (frameCount % 100 == 0) {
                projectiles_enemies.push(VehiculeFactory.createBasicProjectile(new p5.Vector(vehicle.pos.x, vehicle.pos.y), player.pos));
            }
            vehicle.applyForce(force);


        }
        return [vehicle];
    }


    static createBasicProjectile(emeteur, recepteur) {


        // Rayon du cercle autour de l'émetteur où le projectile va apparaître
        let radius = 70;

        // Calcul du vecteur directeur entre l'émetteur et le récepteur
        let direction = p5.Vector.sub(recepteur, emeteur).normalize();

        // Calcul de l'angle basé sur le vecteur directeur
        let angle = direction.heading();

        // Calcul de la position de spawn sur un cercle autour de l'émetteur
        let x_spawn = emeteur.x + Math.cos(angle) * radius;
        let y_spawn = emeteur.y + Math.sin(angle) * radius;

        // Création du projectile
        let vehicle = new Vehicle(x_spawn, y_spawn, ImageBasicProjectile, 20, 5, 1, 1000);

        // Action du projectile : se diriger vers le récepteur
        vehicle.action = () => {
            // Position cible basée sur le récepteur
            let targetX = recepteur.x;
            let targetY = recepteur.y;

            // Création d'un vecteur cible
            let direction = p5.Vector.sub(recepteur, emeteur).normalize();
            let targetVector = p5.Vector.add(emeteur, direction.mult(10000)); // Multipliez par une grande valeur
            // Calcul de la force pour atteindre la cible
            let force = vehicle.seek(targetVector);

            // Application de la force au projectile
            vehicle.applyForce(force);
        };

        return vehicle;
    }

    static createXBat(list) {
        let result = [];
        for (let i = 0; i < list.length; i++) {
            let size = 10;
            let maxSpeed = 3;
            let masse = 0.9;
            let vehicle = new Vehicle(random(width), random(height), ImageAnimatedBatCommon, size, maxSpeed, masse, -1);
            let targetPos = new Vehicle(list[i].x, list[i].y, ImageAnimatedBatCommon, size, 5, 1, -1).pos;
            vehicle.action = () => {
                let force = vehicle.seek(targetPos); // Utilisez la variable locale
                vehicle.applyForce(force);
            };
            result.push(vehicle);
        }
        return result;
    }



    static createBeeGroup(x, y) {
        let vehicle_1 = new Vehicle(random(width), random(height), ImageBeeQueen, 20, 5, 1, -1);
        let vehicle_2 = new Vehicle(random(width + 1), random(height + 1), ImageBee, 20, 5, 1, -1);
        let vehicle_3 = new Vehicle(random(width + 2), random(height + 2), ImageBee, 20, 5, 1, -1);
        let vehicle_4 = new Vehicle(random(width + 3), random(height + 3), ImageBee, 20, 5, 1, -1);

        vehicle_1.setAction(() => {
            vehicle_1.wander();
        });
        vehicle_2.setAction(() => {
            let force;
            if (vehicle_1.pos.dist(vehicle_2.pos) < 25) {
                force = vehicle_2.separate(vehicle_1);
            } else if (vehicle_3.pos.dist(vehicle_2.pos) < 25) {
                force = vehicle_2.separate(vehicle_3.pos);
            }
            else if (vehicle_4.pos.dist(vehicle_2.pos) < 25) {
                force = vehicle_2.separate(vehicle_4.pos);
            }
            else {
                force = vehicle_2.seek(vehicle_1.pos);
            }
            vehicle_2.applyForce(force);
        });
        vehicle_3.setAction(() => {
            let force;
            if (vehicle_1.pos.dist(vehicle_3.pos) < 25) {
                force = vehicle_3.separate(vehicle_1);
            } else if (vehicle_2.pos.dist(vehicle_3.pos) < 25) {
                force = vehicle_3.separate(vehicle_2.pos);
            }
            else if (vehicle_4.pos.dist(vehicle_3.pos) < 25) {
                force = vehicle_3.separate(vehicle_4.pos);
            }
            else {
                force = vehicle_3.seek(vehicle_1.pos);
            }
            vehicle_3.applyForce(force);
        });
        vehicle_4.setAction(() => {
            let force;
            if (vehicle_1.pos.dist(vehicle_4.pos) < 25) {
                force = vehicle_4.separate(vehicle_1);
            } else if (vehicle_2.pos.dist(vehicle_4.pos) < 25) {
                force = vehicle_4.separate(vehicle_2.pos);
            }
            else if (vehicle_3.pos.dist(vehicle_4.pos) < 25) {
                force = vehicle_4.separate(vehicle_3.pos);
            }
            else {
                force = vehicle_4.seek(vehicle_1.pos);
            }
            vehicle_4.applyForce(force);
        });
        return [vehicle_1, vehicle_2, vehicle_3, vehicle_4];
    }

}