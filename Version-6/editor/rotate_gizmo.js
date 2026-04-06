import { vec3, mat4 } from "gl-matrix";

export class RotateGizmo {
    constructor(scene, renderer, camera, canvas) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.canvas = canvas;

        this.activeEntity = null;
        this.activeAxis = null;
        this.dragging = false;

        this.ringRadius = 1.5;
        this.ringThickness = 0.1;

        this.initMeshes();
        this.initEvents();
    }

    initMeshes() {
        const segments = 64;
        const vertices = [];
        const colorsX = [];
        const colorsY = [];
        const colorsZ = [];
        const indices = [];

        for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            const x = Math.cos(a);
            const y = Math.sin(a);

            vertices.push(x, y, 0);
            colorsX.push(1, 0, 0);
            colorsY.push(0, 1, 0);
            colorsZ.push(0, 0, 1);

            if (i < segments - 1) {
                indices.push(i, i + 1);
            } else {
                indices.push(i, 0);
            }
        }

        const v = new Float32Array(vertices);
        const i = new Uint16Array(indices);

        this.renderer.meshSystem.createMesh("ring_x", v, new Float32Array(colorsX), i);
        this.renderer.meshSystem.createMesh("ring_y", v, new Float32Array(colorsY), i);
        this.renderer.meshSystem.createMesh("ring_z", v, new Float32Array(colorsZ), i);
    }

    initEvents() {
        this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
        this.canvas.addEventListener("mouseup", () => this.onMouseUp());
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    }

    setSelectedEntity(entity) {
        this.activeEntity = entity;
    }

    getRayFromMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * -2 + 1;

        const invVP = mat4.create();
        mat4.invert(invVP, this.camera.viewProj);

        const pNear = vec3.fromValues(x, y, -1);
        const pFar = vec3.fromValues(x, y, 1);

        const nearWorld = vec3.transformMat4(vec3.create(), pNear, invVP);
        const farWorld = vec3.transformMat4(vec3.create(), pFar, invVP);

        const dir = vec3.sub(vec3.create(), farWorld, nearWorld);
        vec3.normalize(dir, dir);

        return { origin: nearWorld, dir };
    }

    pickAxis(ray) {
        if (!this.activeEntity) return null;

        const t = this.activeEntity.get("transform");
        if (!t) return null;

        const pos = t.worldMatrix.slice(12, 15);

        const axes = {
            x: vec3.fromValues(1, 0, 0),
            y: vec3.fromValues(0, 1, 0),
            z: vec3.fromValues(0, 0, 1)
        };

        let bestAxis = null;
        let bestDist = 0.15;

        for (const [axisName, axisDir] of Object.entries(axes)) {
            const dist = this.distanceRayToCircle(ray, pos, axisDir);
            if (dist < bestDist) {
                bestDist = dist;
                bestAxis = axisName;
            }
        }

        return bestAxis;
    }

    distanceRayToCircle(rayOrigin, rayDir, center, normal) {
        const planeDist = this.rayPlaneDistance(rayOrigin, rayDir, center, normal);
        if (planeDist < 0) return 999;

        const hit = vec3.scaleAndAdd(vec3.create(), rayOrigin, rayDir, planeDist);
        const d = vec3.distance(hit, center);

        return Math.abs(d - this.ringRadius);
    }

    rayPlaneDistance(rayOrigin, rayDir, planePoint, planeNormal) {
        const denom = vec3.dot(rayDir, planeNormal);
        if (Math.abs(denom) < 0.0001) return -1;

        const diff = vec3.sub(vec3.create(), planePoint, rayOrigin);
        return vec3.dot(diff, planeNormal) / denom;
    }

    onMouseDown(e) {
        if (!this.activeEntity) return;

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

        if (this.activeAxis === "x") t.rotation[0] += delta;
        if (this.activeAxis === "y") t.rotation[1] += delta;
        if (this.activeAxis === "z") t.rotation[2] += delta;

        t.updateLocalMatrix();
        this.scene.updateTransforms();
    }

    render(pass, renderer) {
        if (!this.activeEntity) return;

        const t = this.activeEntity.get("transform");
        if (!t) return;

        const pos = t.worldMatrix.slice(12, 15);

        const drawRing = (meshName, axis) => {
            const model = mat4.create();
            mat4.translate(model, model, pos);
            mat4.scale(model, model, [this.ringRadius, this.ringRadius, this.ringRadius]);

            if (axis === "x") mat4.rotateY(model, model, Math.PI / 2);
            if (axis === "z") mat4.rotateX(model, model, Math.PI / 2);

            renderer.device.queue.writeBuffer(renderer.objectBuffer, 0, model);

            const mesh = renderer.meshSystem.get(meshName);
            const mat = renderer.materialSystem.get("basic");

            pass.setPipeline(mat.pipeline);
            pass.setBindGroup(0, mat.cameraBindGroup);
            pass.setBindGroup(1, mat.objectBindGroup);

            pass.setVertexBuffer(0, mesh.vertexBuffer);
            pass.setVertexBuffer(1, mesh.colorBuffer);
            pass.setIndexBuffer(mesh.indexBuffer, "uint16");

            pass.drawIndexed(mesh.indexCount);
        };

        drawRing("ring_x", "x");
        drawRing("ring_y", "y");
        drawRing("ring_z", "z");
    }
}