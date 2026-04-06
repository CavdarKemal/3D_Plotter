import { Renderer } from "./core/renderer.js";
import { Scene } from "./world/scene.js";

import { Transform } from "./world/components/transform.js";
import { MeshComponent } from "./world/components/mesh_component.js";

import { EditorUI } from "./editor/editor_ui.js";

import { MeshPass } from "./core/passes/mesh_pass.js";
import { GizmoPass } from "./core/passes/gizmo_pass.js";

import { TransformGizmo } from "./editor/transform_gizmo.js";
import { RotateGizmo } from "./editor/rotate_gizmo.js";
import { ScaleGizmo } from "./editor/scale_gizmo.js";

async function main() {
  const canvas = document.getElementById("gfx");

  // Canvas Größe setzen
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Scene
  const scene = new Scene();

  // RenderGraph
  const renderGraph = {
    passes: [],
    addPass(name, pass) {
      this.passes.push({ name, pass });
    },
    execute(renderer, scene) {
      for (const p of this.passes) {
        p.pass.execute(renderer, scene);
      }
    }
  };

  // Renderer
  const renderer = new Renderer(canvas, renderGraph);
  await renderer.init();

  // Gizmos
  const translate = new TransformGizmo(scene, renderer, renderer.camera, canvas);
  const rotate = new RotateGizmo(scene, renderer, renderer.camera, canvas);
  const scale = new ScaleGizmo(scene, renderer, renderer.camera, canvas);

  // RenderPasses
  renderGraph.addPass("MeshPass", new MeshPass());
  renderGraph.addPass("GizmoPass", new GizmoPass({
    translate,
    rotate,
    scale
  }));

  // Editor UI
  const editor = new EditorUI(scene, renderer, {
    outliner: document.getElementById("outliner"),
    inspector: document.getElementById("inspector"),
    canvas
  }, { translate, rotate, scale });

  // Test Entity
  const e = scene.createEntity();
  e.addComponent("transform", new Transform());
  e.addComponent("mesh", new MeshComponent("cube", "basic"));
  scene.updateTransforms();

  // Render Loop
  let last = performance.now();
  function loop() {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;

    renderer.update(dt);
    renderGraph.execute(renderer, scene);

    requestAnimationFrame(loop);
  }

  loop();
}

main();
