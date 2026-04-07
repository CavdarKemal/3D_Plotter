export class CameraController {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;

        this.speed = 4;
        this.sensitivity = 0.002;

        this.keys = new Set();
        this.rightMouseDown = false;

        this.initEvents();
    }

    initEvents() {
        window.addEventListener("keydown", e => this.keys.add(e.key));
        window.addEventListener("keyup", e => this.keys.delete(e.key));

        // Right-click only for camera look
        this.canvas.addEventListener("mousedown", e => {
            if (e.button !== 2) return;
            this.rightMouseDown = true;
            this.canvas.requestPointerLock();
        });

        window.addEventListener("mouseup", e => {
            if (e.button !== 2) return;
            this.rightMouseDown = false;
            document.exitPointerLock();
        });

        window.addEventListener("mousemove", e => {
            if (!this.rightMouseDown) return;

            this.camera.rotation[1] -= e.movementX * this.sensitivity;
            this.camera.rotation[0] -= e.movementY * this.sensitivity;
            this.camera.rotation[0] = Math.max(-1.5, Math.min(1.5, this.camera.rotation[0]));
        });

        // Suppress context menu on canvas
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());
    }

    update(dt) {
        // WASD movement only while right-clicking (FPS camera mode)
        if (!this.rightMouseDown) return;

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

        if (this.keys.has("w") || this.keys.has("W")) {
            cam.position[0] += forward[0] * dt * this.speed;
            cam.position[2] += forward[2] * dt * this.speed;
        }
        if (this.keys.has("s") || this.keys.has("S")) {
            cam.position[0] -= forward[0] * dt * this.speed;
            cam.position[2] -= forward[2] * dt * this.speed;
        }
        if (this.keys.has("a") || this.keys.has("A")) {
            cam.position[0] -= right[0] * dt * this.speed;
            cam.position[2] -= right[2] * dt * this.speed;
        }
        if (this.keys.has("d") || this.keys.has("D")) {
            cam.position[0] += right[0] * dt * this.speed;
            cam.position[2] += right[2] * dt * this.speed;
        }

        // Vertical movement
        if (this.keys.has(" ")) {
            cam.position[1] += dt * this.speed;
        }
        if (this.keys.has("q") || this.keys.has("Q")) {
            cam.position[1] -= dt * this.speed;
        }
    }
}
