/*
spawnRemoteBoat(id) {
    const boat = createBoatEntity();
    boat.remote = true;
    this.remoteBoats[id] = boat;
    this.ecs.addEntity(boat);
}

*/
import { MultiplayerClient } from "../multiplayer/client.js";
import { replicateLocalBoat } from "../multiplayer/replication.js";

export class Scene {
    constructor(ecs, renderer, input, ocean) {
        this.ecs = ecs;
        this.renderer = renderer;

        this.client = new MultiplayerClient();
        this.remoteBoats = {};

        this.localBoat = createBoatEntity();
        ecs.addEntity(this.localBoat);

        this.boatSystem = new BoatSystem(input, ocean.sampler, ocean.wind);
        ecs.addSystem(this.boatSystem);
    }

    update(dt) {
        this.ecs.update(dt);

        replicateLocalBoat(this.localBoat, this.client);

        for (const id in this.client.players) {
            const state = this.client.players[id];

            if (!this.remoteBoats[id]) {
                this.spawnRemoteBoat(id);
            }

            const boat = this.remoteBoats[id];
            boat.transform.x = state.x;
            boat.transform.y = state.y;
            boat.transform.z = state.z;
            boat.transform.rotZ = state.rotZ;
        }
    }

    render() {
        this.renderer.clear();
        this.renderer.drawText("Multiplayer aktiv", 20, 200);
    }
}
