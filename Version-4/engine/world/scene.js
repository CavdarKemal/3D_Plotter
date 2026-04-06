import { createBoatEntity } from "../boat/boat.js";
import { BoatSystem } from "../boat/boat_system.js";
import { ThirdPersonCamera } from "../camera/thirdpersoncamera.js";

export class Scene {
    constructor(ecs, renderer, input, ocean) {
        this.ecs = ecs;
        this.renderer = renderer;

        this.boat = createBoatEntity();
        ecs.addEntity(this.boat);

        this.camera = new ThirdPersonCamera();

        this.boatSystem = new BoatSystem(input, ocean.sampler, ocean.wind);
        ecs.addSystem(this.boatSystem);
    }

    update(dt) {
        this.ecs.update(dt);
    }

    render() {
        this.renderer.clear();
        this.camera.follow(this.boat, this.renderer);
    }
}
