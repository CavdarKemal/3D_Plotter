export class CameraController {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;

        this.speed = 4;
        this.sensitivity = 0.002;

        this.keys = new Set();
        this.mouseDown = false;

        this.initEvents();
    }

    initEvents() {
        window.addEventListener("keydown", e => this.keys.add(e.key));
        window.addEventListener("keyup", e => this.keys.delete(e.key));

        this.canvas.addEventListener("mousedown", () => {
            this.mouseDown = true;
            this.canvas.requestPointerLock();
        });

        window.addEventListener("mouseup", () => {
            this.mouseDown = false;
            document.exitPointerLock();
        });

        window.addEventListener("mousemove", e => {
            if (!this.mouseDown) return;

            this.camera.rotation[1] -= e.movementX * this.sensitivity;
            this.camera.rotation[0] -= e.movementY * this.sensitivity;

            this.camera.rotation[0] = Math.max(-1.5, Math.min(1.5, this.camera.rotation[0]));
        });
    }

    update(dt) {
        const cam = this.camera;

        const forward = [
            Math.sin(cam.rotation[1]),
            0,
            Math.cos(cam.rotation[1])
        ];

        const right = [
            Math.cos(cam.rotation[1]),
            0,
            -Math.sin(cam.rotation[1])
        ];

        if (this.keys.has("w")) {
            cam.position[0] += forward[0] * dt * this.speed;
            cam.position[2] += forward[2] * dt * this.speed;
        }
        if (this.keys.has("s")) {
            cam.position[0] -= forward[0] * dt * this.speed;
            cam.position[2] -= forward[2] * dt * this.speed;
        }
        if (this.keys.has("a")) {
            cam.position[0] -= right[0] * dt * this.speed;
            cam.position[2] -= right[2] * dt * this.speed;
        }
        if (this.keys.has("d")) {
            cam.position[0] += right[0] * dt * this.speed;
            cam.position[2] += right[2] * dt * this.speed;
        }
    }
}
