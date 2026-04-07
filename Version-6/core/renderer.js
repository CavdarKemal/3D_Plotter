import { PipelineManager } from "./pipeline_manager.js";
import { MeshSystem } from "./mesh_system.js";
import { MaterialSystem } from "./material_system.js";
import { ShaderCompiler } from "./shader_compiler.js";

import { Camera } from "./camera.js";
import { CameraController } from "./camera_controller.js";

export class Renderer {
    constructor(canvas, renderGraph) {
        this.canvas = canvas;
        this.renderGraph = renderGraph;

        this.device = null;
        this.context = null;
        this.format = null;

        this.pipelineManager = null;
        this.meshSystem = null;
        this.materialSystem = null;
        this.shaderCompiler = null;

        this.camera = null;
        this.cameraController = null;

        this.cameraBuffer = null;
        this.objectBuffer = null;

        this.depthTexture = null;
        this.depthView = null;
    }

    async init() {
        if (!navigator.gpu) {
            throw new Error("WebGPU not supported");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("WebGPU adapter not available. Make sure hardware acceleration is enabled in browser settings.");
        }
        this.device = await adapter.requestDevice();
        this.device.lost.then(info => {
            console.error("[WebGPU] Device lost:", info.message, info.reason);
        });

        this.context = this.canvas.getContext("webgpu");
        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });

        // Systems
        this.pipelineManager = new PipelineManager(this.device, this.format);
        this.meshSystem = new MeshSystem(this.device);
        this.materialSystem = new MaterialSystem(this.device);
        this.shaderCompiler = new ShaderCompiler(this.device);

        // Camera
        this.camera = new Camera();
        this.cameraController = new CameraController(this.camera, this.canvas);
        this.camera.updateProjection(this.canvas.width / this.canvas.height);

        // Uniform Buffers
        this.cameraBuffer = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.objectBuffer = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Depth texture
        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthView = this.depthTexture.createView();

        // Shader
        const shader = await this.shaderCompiler.load("shaders/basic.wgsl");

        // Triangle pipeline (with depth)
        const pipeline = this.pipelineManager.createPipeline("basic", shader);
        this.materialSystem.createMaterial("basic", pipeline, this);

        // Line pipeline (no depth — renders on top)
        const linePipeline = this.pipelineManager.createLinePipeline("gizmo", shader);
        this.materialSystem.createMaterial("gizmo", linePipeline, this);

        // Meshes
        this._createCubeMesh();
        this._createSphereMesh();
        this._createPlaneMesh();
        this._createGridMesh();
        this._createGizmoLineMeshes();
        this._createRingMeshes();
    }

    _createCubeMesh() {
        const vertices = new Float32Array([
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,
        ]);
        const colors = new Float32Array([
            1,0,0, 1,0,0, 1,0,0, 1,0,0,
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
        ]);
        const indices = new Uint16Array([
            0,1,2, 0,2,3,
            4,6,5, 4,7,6,
            4,5,1, 4,1,0,
            3,2,6, 3,6,7,
            1,5,6, 1,6,2,
            4,0,3, 4,3,7
        ]);
        this.meshSystem.createMesh("cube", vertices, colors, indices);
    }

    _createSphereMesh() {
        const rings = 16;
        const sectors = 16;
        const verts = [];
        const cols = [];
        const idxs = [];

        for (let r = 0; r <= rings; r++) {
            const phi = Math.PI * r / rings;
            for (let s = 0; s <= sectors; s++) {
                const theta = 2 * Math.PI * s / sectors;
                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.cos(phi);
                const z = Math.sin(phi) * Math.sin(theta);
                verts.push(x * 0.5, y * 0.5, z * 0.5);
                cols.push(0.2 + Math.abs(x) * 0.8, 0.5 + y * 0.3, 0.8 + z * 0.2);
            }
        }

        for (let r = 0; r < rings; r++) {
            for (let s = 0; s < sectors; s++) {
                const a = r * (sectors + 1) + s;
                const b = a + (sectors + 1);
                idxs.push(a, b, a + 1);
                idxs.push(b, b + 1, a + 1);
            }
        }

        this.meshSystem.createMesh("sphere",
            new Float32Array(verts),
            new Float32Array(cols),
            new Uint16Array(idxs)
        );
    }

    _createPlaneMesh() {
        const s = 0.5;
        const vertices = new Float32Array([
            -s, 0, -s,
             s, 0, -s,
             s, 0,  s,
            -s, 0,  s,
        ]);
        const colors = new Float32Array([
            0.4, 0.6, 0.4,
            0.4, 0.6, 0.4,
            0.4, 0.6, 0.4,
            0.4, 0.6, 0.4,
        ]);
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        this.meshSystem.createMesh("plane", vertices, colors, indices);
    }

    _createGridMesh() {
        const size = 10;
        const divisions = 20;
        const step = size / divisions;
        const half = size / 2;
        const verts = [];
        const cols = [];
        const idxs = [];
        let idx = 0;

        for (let i = 0; i <= divisions; i++) {
            const pos = -half + i * step;
            const bright = (i === divisions / 2) ? 0.5 : 0.22;

            // Line along Z axis
            verts.push(pos, 0, -half,  pos, 0, half);
            cols.push(bright, bright, bright,  bright, bright, bright);
            idxs.push(idx, idx + 1);
            idx += 2;

            // Line along X axis
            verts.push(-half, 0, pos,  half, 0, pos);
            cols.push(bright, bright, bright,  bright, bright, bright);
            idxs.push(idx, idx + 1);
            idx += 2;
        }

        this.meshSystem.createMesh("grid",
            new Float32Array(verts),
            new Float32Array(cols),
            new Uint16Array(idxs)
        );
    }

    _createGizmoLineMeshes() {
        const v = new Float32Array([0,0,0, 1,0,0]);
        const i = new Uint16Array([0, 1]);
        this.meshSystem.createMesh("gizmo_x", v, new Float32Array([1,0,0, 1,0,0]), i);
        this.meshSystem.createMesh("gizmo_y", v, new Float32Array([0,1,0, 0,1,0]), new Uint16Array([0,1]));
        this.meshSystem.createMesh("gizmo_z", v, new Float32Array([0,0,1, 0,0,1]), new Uint16Array([0,1]));
        this.meshSystem.createMesh("scale_x", v, new Float32Array([1,0,0, 1,0,0]), new Uint16Array([0,1]));
        this.meshSystem.createMesh("scale_y", v, new Float32Array([0,1,0, 0,1,0]), new Uint16Array([0,1]));
        this.meshSystem.createMesh("scale_z", v, new Float32Array([0,0,1, 0,0,1]), new Uint16Array([0,1]));
    }

    _createRingMeshes() {
        const segments = 64;
        const verts = [];
        const colsX = [], colsY = [], colsZ = [];
        const idxs = [];

        for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            verts.push(Math.cos(a), Math.sin(a), 0);
            colsX.push(1, 0, 0);
            colsY.push(0, 1, 0);
            colsZ.push(0, 0, 1);
        }

        for (let i = 0; i < segments; i++) {
            idxs.push(i, (i + 1) % segments);
        }

        const v = new Float32Array(verts);
        this.meshSystem.createMesh("ring_x", v, new Float32Array(colsX), new Uint16Array(idxs));
        this.meshSystem.createMesh("ring_y", v, new Float32Array(colsY), new Uint16Array(idxs));
        this.meshSystem.createMesh("ring_z", v, new Float32Array(colsZ), new Uint16Array(idxs));
    }

    beginFrame() {
        const view = this.context.getCurrentTexture().createView();
        this.camera.updateView();
        this.device.queue.writeBuffer(this.cameraBuffer, 0, this.camera.viewProj);
        return view;
    }

    update(dt) {
        this.cameraController.update(dt);
    }
}
