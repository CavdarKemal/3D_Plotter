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
    canvas.width = window.innerWidth - 320;
    canvas.height = window.innerHeight;

    // Scene
    const scene = new Scene();

    // RenderGraph
    const renderGraph = {
        passes: [],
        addPass(name, pass) { this.passes.push({ name, pass }); },
        execute(renderer, scene) {
            for (const p of this.passes) p.pass.execute(renderer, scene);
        }
    };

    // Renderer
    const renderer = new Renderer(canvas, renderGraph);
    await renderer.init();

    // Gizmos
    const translate = new TransformGizmo(scene, renderer, renderer.camera, canvas);
    const rotate = new RotateGizmo(scene, renderer, renderer.camera, canvas);
    const scale = new ScaleGizmo(scene, renderer, renderer.camera, canvas);

    // Render passes
    renderGraph.addPass("MeshPass", new MeshPass());
    const gizmoPass = new GizmoPass({ translate, rotate, scale });
    renderGraph.addPass("GizmoPass", gizmoPass);

    // Editor UI
    const editor = new EditorUI(
        scene, renderer,
        {
            outliner: document.getElementById("outliner"),
            inspector: document.getElementById("inspector"),
            toolbar: document.getElementById("toolbar"),
            canvas
        },
        { translate, rotate, scale },
        gizmoPass
    );

    // Demo scene: cube + sphere
    const cube = scene.createEntity("Cube");
    cube.addComponent("transform", new Transform());
    cube.addComponent("mesh", new MeshComponent("cube", "basic"));

    const sphere = scene.createEntity("Sphere");
    const st = new Transform();
    st.position[0] = 2;
    sphere.addComponent("transform", st);
    sphere.addComponent("mesh", new MeshComponent("sphere", "basic"));

    const plane = scene.createEntity("Plane");
    const pt = new Transform();
    pt.position[1] = -0.5;
    pt.scale[0] = 4;
    pt.scale[2] = 4;
    plane.addComponent("transform", pt);
    plane.addComponent("mesh", new MeshComponent("plane", "basic"));

    scene.updateTransforms();
    editor.outliner.render();

    console.log("[3D Plotter] Init OK — WebGPU device:", renderer.device.label || "unlabelled");
    console.log("[3D Plotter] Canvas:", canvas.width, "x", canvas.height);

    // Render loop
    let last = performance.now();
    let frameErrors = 0;

    function loop() {
        requestAnimationFrame(loop);

        try {
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 0.05); // cap dt at 50ms
            last = now;

            renderer.update(dt);
            renderGraph.execute(renderer, scene);
        } catch (err) {
            frameErrors++;
            if (frameErrors <= 5) {
                console.error("[3D Plotter] Render error:", err);
            }
        }
    }

    loop();
}

main().catch(err => {
    document.body.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">
        <b>Error:</b> ${err.message}<br><br>
        Make sure you use Chrome/Edge with WebGPU enabled.
    </div>`;
    console.error(err);
});
