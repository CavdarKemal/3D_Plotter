import { Renderer } from "./core/renderer.js";
import { Scene } from "./world/scene.js";
import { EditorUI } from "./editor/editor_ui.js";
import { GizmoPass } from "./core/passes/gizmo_pass.js";

import { TransformGizmo } from "./editor/transform_gizmo.js";
import { RotateGizmo } from "./editor/rotate_gizmo.js";
import { ScaleGizmo } from "./editor/scale_gizmo.js";

async function main() {
    const canvas = document.getElementById("gfx");

    const scene = new Scene();

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

    const renderer = new Renderer(canvas, renderGraph);
    await renderer.init();

    // Gizmos
    const translate = new TransformGizmo(scene, renderer, renderer.camera, canvas);
    const rotate = new RotateGizmo(scene, renderer, renderer.camera, canvas);
    const scale = new ScaleGizmo(scene, renderer, renderer.camera, canvas);

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

    // Test entity
    const e = scene.createEntity();
    e.addComponent("transform", new (await import("./world/components/transform.js")).Transform());
    e.addComponent("mesh", new (await import("./world/components/mesh_component.js")).MeshComponent("cube", "basic"));
    scene.updateTransforms();

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
