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
  }

  async init() {
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported");
    }

    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter.requestDevice();

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

    // Buffers
    this.cameraBuffer = this.device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.objectBuffer = this.device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    // Shader + Pipeline
    const shader = await this.shaderCompiler.load("shaders/basic.wgsl");
    const pipeline = this.pipelineManager.createPipeline("basic", shader);
    this.materialSystem.createMaterial("basic", pipeline, this);

    // Cube Mesh
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
