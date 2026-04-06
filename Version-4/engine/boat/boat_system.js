import { applyBuoyancy } from "./buoyancy.js";
import { applyHydrodynamics } from "./hydrodynamics.js";
import { applySailPhysics } from "./sail_physics.js";
import { applyMotor } from "./motor_physics.js";

export class BoatSystem {
    constructor(input, sampler, wind) {
        this.input = input;
        this.sampler = sampler;
        this.wind = wind;
    }

    update(entities, dt) {
        for (const e of entities) {
            if (!e.boat) continue;

            if (this.input.isDown("w")) e.boat.motorPower = 1;
            else e.boat.motorPower = 0;

            if (this.input.isDown("a")) e.boat.rudderAngle = -0.5;
            else if (this.input.isDown("d")) e.boat.rudderAngle = 0.5;
            else e.boat.rudderAngle = 0;

            applyBuoyancy(e, this.sampler);
            applyHydrodynamics(e);
            applySailPhysics(e, this.wind);
            applyMotor(e);

            e.transform.x += e.rigidbody.vx * dt;
            e.transform.y += e.rigidbody.vy * dt;
            e.transform.z += e.rigidbody.vz * dt;
        }
    }
}
