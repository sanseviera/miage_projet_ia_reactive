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
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.r = 12;

        this.maxSpeed = 4;
        this.maxForce = 0.25;
        this.r = 16;
        this.velocity = createVector(this.maxspeed, 0);

        this.xoff = 0;

    }

    evade(vehicle) {
        let pursuit = this.pursue(vehicle);
        pursuit.mult(-1);
        return pursuit;
    }

    pursue(vehicle) {
        let target = vehicle.pos.copy();
        let prediction = vehicle.vel.copy();
        prediction.mult(slider.value());
        target.add(prediction);
        stroke(255);
        line(vehicle.pos.x, vehicle.pos.y, target.x, target.y);
        fill(127);
        circle(target.x, target.y, 16);
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
        let steer = p5.Vector.fromAngle(angle);
        steer.setMag(this.maxForce);
        this.applyForce(steer);
        this.xoff += 0.01;
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
        stroke(255);
        strokeWeight(2);
        fill(255);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
        pop();
    }

    edges() {
        if (this.pos.x > width + this.r) {
            this.pos.x = -this.r;
        } else if (this.pos.x < -this.r) {
            this.pos.x = width + this.r;
        }
        if (this.pos.y > height + this.r) {
            this.pos.y = -this.r;
        } else if (this.pos.y < -this.r) {
            this.pos.y = height + this.r;
        }
    }
}

class Target extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.vel = p5.Vector.random2D();
        this.maxSpeed = 4;
        this.vel.mult(4);
    }

    show() {
        stroke(255);
        strokeWeight(2);
        fill("#F063A4");
        push();
        translate(this.pos.x, this.pos.y);
        circle(0, 0, this.r * 2);
        pop();
    }

    edges() {
        if (this.pos.x > width - this.r) {
            this.vel.x *= -1;
            this.pos.x = width - this.r;
        } else if (this.pos.x < this.r) {
            this.vel.x *= -1;
            this.pos.x = this.r;
        }
        if (this.pos.y > height - this.r) {
            this.vel.y *= -1;
            this.pos.y = height - this.r;
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