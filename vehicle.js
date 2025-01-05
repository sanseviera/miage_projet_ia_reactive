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

class Vehicle {


    /*
    x: x spawn position of the vehicle
    y: y spawn position of the vehicle
    image: image image of the vehicle
    r: radius of the vehicle
    lifetimeTimestamp: timestamp of the vehicle's lifetime (if is -1 is infinite)
    */

    constructor(x, y, image, r, maxSpeed, maxForce, lifetimeTimestamp) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = maxSpeed;//4;
        this.maxForce = maxForce;//0.25;
        this.r = r;
        this.velocity = createVector(this.maxspeed, 0);
        this.xoff = 0;
        this.lifetimeTimestamp = lifetimeTimestamp;
        this.apparitionTimestamp = millis();
        // image 
        this.image = image;

    }

    setAction(customFunction) {

        this.customFunction = customFunction;
    }

    action() {
        this.customFunction();
    }

    evade(vehicle) {
        let pursuit = this.pursue(vehicle);
        pursuit.mult(-1);
        return pursuit;
    }

    pursue(vehicle) {
        let target = vehicle.pos.copy();
        let prediction = vehicle.vel.copy();
        prediction.mult(10);
        target.add(prediction);
        stroke(255);
        line(vehicle.pos.x, vehicle.pos.y, target.x, target.y);
        fill(127);
        circle(target.x, target.y, 16);
        return this.seek(target);
    }

    pursueFixedDirection(vehicle, directionVector) {
        // Copier la position actuelle du véhicule comme point de départ
        let currentPos = vehicle.pos.copy();

        // Créer une copie du vecteur direction pour ne pas modifier l'original
        let fixedDirection = directionVector.copy();

        // Normaliser la direction pour garder une trajectoire constante
        fixedDirection.normalize();

        // Étendre la direction pour représenter la trajectoire future
        fixedDirection.mult(100); // Ajuste la distance du trait si nécessaire

        // Calculer la position cible en ajoutant la direction à la position actuelle
        let target = currentPos.copy();
        target.add(fixedDirection);

        // Dessiner la trajectoire
        stroke(255);
        line(vehicle.pos.x, vehicle.pos.y, target.x, target.y);

        // Dessiner un cercle à la fin de la trajectoire pour indiquer la cible
        fill(127);
        circle(target.x, target.y, 16);

        // Retourner la commande pour se déplacer vers la direction cible
        return this.seek(target);
    }



    arrive(target) {
        return this.seek(target, true);
    }


    flee(target) {
        return this.seek(target).mult(-1);
    }

    seek(target) {
        let force = p5.Vector.sub(target, this.pos);
        force.setMag(this.maxSpeed);
        force.sub(this.vel);
        force.limit(this.maxForce);
        return force;
    }

    wander() {
        let angle = noise(this.xoff) * TWO_PI * 2;
        let force;
        let steer = p5.Vector.fromAngle(angle);
        steer.setMag(this.maxForce);
        force = steer;
        this.xoff += 0.01;
        return force;
    }

    separate(boids) {
        let desiredseparation = this.r * 2;
        let steer = createVector(0, 0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i < boids.length; i++) {
            let other = boids[i];
            let d = p5.Vector.dist(this.pos, other.pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if (d > 0 && d < desiredseparation) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;
    }

    applyBehaviors(vehicles, path) {
        let f = this.follow(path);
        let s = this.separate(vehicles);
        f.mult(3);
        s.mult(1);
        this.applyForce(f);
        this.applyForce(s);
    }

    follow(path) {
        // Predict position 25 (arbitrary choice) frames ahead
        let predict = this.velocity.copy();
        predict.normalize();
        predict.mult(25);
        let predictpos = p5.Vector.add(this.pos, predict);

        // Now we must find the normal to the path from the predicted position
        // We look at the normal for each line segment and pick out the closest one
        let normal = null;
        let target = null;
        let worldRecord = 1000000; // Start with a very high worldRecord distance that can easily be beaten

        // Loop through all points of the path
        for (let i = 0; i < path.points.length; i++) {
            // Look at a line segment
            let a = path.points[i];
            let b = path.points[(i + 1) % path.points.length]; // Note Path has to wraparound

            // Get the normal point to that line
            let normalPoint = getNormalPoint(predictpos, a, b);

            // Check if normal is on line segment
            let dir = p5.Vector.sub(b, a);
            // If it's not within the line segment, consider the normal to just be the end of the line segment (point b)
            //if (da + db > line.mag()+1) {
            if (
                normalPoint.x < min(a.x, b.x) ||
                normalPoint.x > max(a.x, b.x) ||
                normalPoint.y < min(a.y, b.y) ||
                normalPoint.y > max(a.y, b.y)
            ) {
                normalPoint = b.copy();
                // If we're at the end we really want the next line segment for looking ahead
                a = path.points[(i + 1) % path.points.length];
                b = path.points[(i + 2) % path.points.length]; // Path wraps around
                dir = p5.Vector.sub(b, a);
            }

            // How far away are we from the path?
            let d = p5.Vector.dist(predictpos, normalPoint);
            // Did we beat the worldRecord and find the closest line segment?
            if (d < worldRecord) {
                worldRecord = d;
                normal = normalPoint;

                // Look at the direction of the line segment so we can seek a little bit ahead of the normal
                dir.normalize();
                // This is an oversimplification
                // Should be based on distance to path & velocity
                dir.mult(25);
                target = normal.copy();
                target.add(dir);
            }
        }

        // Draw the debugging stuff
        if (debug) {
            // Draw predicted future position
            stroke(0);
            fill(0);
            line(this.pos.x, this.pos.y, predictpos.x, predictpos.y);
            ellipse(predictpos.x, predictpos.y, 4, 4);

            // Draw normal position
            stroke(0);
            fill(0);
            ellipse(normal.x, normal.y, 4, 4);
            // Draw actual target (red if steering towards it)
            line(predictpos.x, predictpos.y, target.x, target.y);
            if (worldRecord > path.radius) fill(255, 0, 0);
            noStroke();
            ellipse(target.x, target.y, 8, 8);
        }

        // Only if the distance is greater than the path's radius do we bother to steer
        if (worldRecord > path.radius) {
            return this.seek(target);
        } else {
            return createVector(0, 0);
        }
    }


    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.set(0, 0);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        if (debug) {
            fill(255, 0, 0, 255);
            triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
            stroke(255);
            strokeWeight(2);

        } else {
            rotate(PI / 2);
            image(this.image, -this.r, -this.r, this.r * 2, this.r * 2);
            createSprite(width / 2, height / 2, 50, 50);
            imageMode(CENTER);

        }
        pop();
    }

    isExpired() {
        if (this.lifetimeTimestamp == -1) {
            return false;
        }
        return millis() - this.apparitionTimestamp > this.lifetimeTimestamp;
    }


    edges() {
        if (this.pos.x > worldWidth - this.r) {
            this.vel.x *= -1;
            this.pos.x = worldWidth - this.r;
        } else if (this.pos.x < this.r) {
            this.vel.x *= -1;
            this.pos.x = this.r;
        }
        if (this.pos.y > worldHeight - this.r) {
            this.vel.y *= -1;
            this.pos.y = worldHeight - this.r;
        } else if (this.pos.y < this.r) {
            this.vel.y *= -1;
            this.pos.y = this.r;
        }
    }

    detectCollision(vehicle) {
        // Calcul de la distance entre les deux véhicules
        let distance = p5.Vector.dist(this.pos, vehicle.pos);

        // Vérification de la collision (distance inférieure à la somme des rayons)
        if (distance < this.r + vehicle.r) {
            return true; // Collision détectée
        }
        return false; // Pas de collision
    }

    detectCollisionWithPoint(point, r) {
        // Calcul de la distance entre le véhicule et le point
        let distance = p5.Vector.dist(this.pos, point);

        // Vérification de la collision (distance inférieure à la somme des rayons)
        if (distance < this.r + r) {
            return true; // Collision détectée
        }
        return false; // Pas de collision
    }

}

class Target extends Vehicle {
    constructor(x, y) {

        super(x, y, null, 10, 0, 0, -1);
        this.vel = p5.Vector.random2D();
        this.maxSpeed = 4;
        this.vel.mult(4);

    }

    show() {
        stroke(255); d
        strokeWeight(2);
        fill("#F063A4");
        push();
        translate(this.pos.x, this.pos.y);
        circle(0, 0, this.r * 2);
        pop();
    }

    edges() {
        if (this.pos.x > worldWidth - this.r) {
            this.vel.x *= -1;
            this.pos.x = worldWidth - this.r;
        } else if (this.pos.x < this.r) {
            this.vel.x *= -1;
            this.pos.x = this.r;
        }
        if (this.pos.y > worldHeight - this.r) {
            this.vel.y *= -1;
            this.pos.y = worldHeight - this.r;
        } else if (this.pos.y < this.r) {
            this.vel.y *= -1;
            this.pos.y = this.r;
        }
    }


}

function getNormalPoint(p, a, b) {
    // Vector from a to p
    let ap = p5.Vector.sub(p, a);
    // Vector from a to b
    let ab = p5.Vector.sub(b, a);
    ab.normalize(); // Normalize the line
    // Project vector "diff" onto line by using the dot product
    ab.mult(ap.dot(ab));
    let normalPoint = p5.Vector.add(a, ab);
    return normalPoint;
}