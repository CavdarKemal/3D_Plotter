import { mat4 } from "gl-matrix";

export class Camera {
    constructor() {
        // Start behind the scene looking in +Z direction toward origin
        this.position = [0, 2, -6];
        this.rotation = [-0.2, 0, 0]; // pitch slightly downward

        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();
        this.viewProj = mat4.create();

        this.aspect = 1;
        this.fov = Math.PI / 3;
        this.near = 0.1;
        this.far = 1000;
    }

    updateProjection(aspect) {
        this.aspect = aspect;
        mat4.perspective(this.projMatrix, this.fov, aspect, this.near, this.far);
    }

    updateView() {
        const pitch = this.rotation[0];
        const yaw = this.rotation[1];

        const forward = [
            Math.cos(pitch) * Math.sin(yaw),
            Math.sin(pitch),
            Math.cos(pitch) * Math.cos(yaw)
        ];

        const target = [
            this.position[0] + forward[0],
            this.position[1] + forward[1],
            this.position[2] + forward[2]
        ];

        mat4.lookAt(this.viewMatrix, this.position, target, [0, 1, 0]);
        mat4.multiply(this.viewProj, this.projMatrix, this.viewMatrix);
    }
}