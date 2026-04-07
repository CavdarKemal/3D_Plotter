import { vec3, mat4 } from "gl-matrix";

export class ScaleGizmo {
    constructor(scene, renderer, camera, canvas) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.canvas = canvas;

        this.activeEntity = null;
        this.activeAxis = null;
        this.dragging = false;
        this.enabled = false;

        this.axisSize = 1.5;

        this.initEvents();
    }

    initEvents() {
        this.canvas.addEventListener("mousedown", e => {
            if (e.button !== 0) return;
            this.onMouseDown(e);
        });
        this.canvas.addEventListener("mouseup", e => {
            if (e.button !== 0) return;
            this.onMouseUp();
        });
        this.canvas.addEventListener("mousemove", e => this.onMouseMove(e));
    }

    setSelectedEntity(entity) {
        this.activeEntity = entity;
        this.enabled = (entity !== null);
    }

    getRayFromMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * -2 + 1;

        const invVP = mat4.create();
        mat4.invert(invVP, this.camera.viewProj);

        const pNear = vec3.fromValues(x, y, -1);
        const pFar  = vec3.fromValues(x, y,  1);

        const nearWorld = vec3.transformMat4(vec3.create(), pNear, invVP);
        const farWorld  = vec3.transformMat4(vec3.create(), pFar, invVP);

        const dir = vec3.sub(vec3.create(), farWorld, nearWorld);
        vec3.normalize(dir, dir);

        return { origin: nearWorld, dir };
    }

    distanceRayToLine(rayOrigin, rayDir, linePoint, lineDir) {
        // Shortest distance between two infinite lines
        const n = vec3.cross(vec3.create(), rayDir, lineDir);
        const lenN = vec3.length(n);
        if (lenN < 0.0001) return 999; // parallel lines

        const diff = vec3.sub(vec3.create(), linePoint, rayOrigin);
        return Math.abs(vec3.dot(diff, n)) / lenN;
    }

    pickAxis(ray) {
        if (!this.activeEntity) return null;

        const t = this.activeEntity.get("transform");
        if (!t) return null;

        const pos = vec3.fromValues(t.worldMatrix[12], t.worldMatrix[13], t.worldMatrix[14]);

        const axes = {
            x: vec3.fromValues(1, 0, 0),
            y: vec3.fromValues(0, 1, 0),
            z: vec3.fromValues(0, 0, 1)
        };

        let bestAxis = null;
        let bestDist = 0.15;

        for (const [axisName, axisDir] of Object.entries(axes)) {
            const dist = this.distanceRayToLine(ray.origin, ray.dir, pos, axisDir);
            if (dist < bestDist) {
                bestDist = dist;
                bestAxis = axisName;
            }
        }

        return bestAxis;
    }

    onMouseDown(e) {
        if (!this.enabled || !this.activeEntity) return;

        const ray = this.getRayFromMouse(e);
        const axis = this.pickAxis(ray);

        if (axis) {
            this.activeAxis = axis;
            this.dragging = true;
        }
    }

    onMouseUp() {
        this.dragging = false;
        this.activeAxis = null;
    }

    onMouseMove(e) {
        if (!this.dragging || !this.activeEntity) return;

        const t = this.activeEntity.get("transform");
        if (!t) return;

        const delta = e.movementX * 0.01;

        if (this.activeAxis === "x") t.scale[0] = Math.max(0.01, t.scale[0] + delta);
        if (this.activeAxis === "y") t.scale[1] = Math.max(0.01, t.scale[1] + delta);
        if (this.activeAxis === "z") t.scale[2] = Math.max(0.01, t.scale[2] + delta);

        t.updateLocalMatrix();
        this.scene.updateTransforms();
    }

    render(pass, renderer) {
        if (!this.enabled || !this.activeEntity) return;

        const t = this.activeEntity.get("transform");
        if (!t) return;

        const pos = [t.worldMatrix[12], t.worldMatrix[13], t.worldMatrix[14]];

        const drawAxis = (meshName, axis) => {
            const model = mat4.create();
            mat4.translate(model, model, pos);
            mat4.scale(model, model, [this.axisSize, this.axisSize, this.axisSize]);

            if (axis === "y") mat4.rotateZ(model, model, Math.PI / 2);
            if (axis === "z") mat4.rotateY(model, model, -Math.PI / 2);

            renderer.device.queue.writeBuffer(renderer.objectBuffer, 0, model);

            const mesh = renderer.meshSystem.get(meshName);
            const mat = renderer.materialSystem.get("gizmo");

            pass.setPipeline(mat.pipeline);
            pass.setBindGroup(0, mat.cameraBindGroup);
            pass.setBindGroup(1, mat.objectBindGroup);
            pass.setVertexBuffer(0, mesh.vertexBuffer);
            pass.setVertexBuffer(1, mesh.colorBuffer);
            pass.setIndexBuffer(mesh.indexBuffer, "uint16");
            pass.drawIndexed(mesh.indexCount);
        };

        drawAxis("scale_x", "x");
        drawAxis("scale_y", "y");
        drawAxis("scale_z", "z");
    }
}
