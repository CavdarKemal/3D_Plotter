import { RenderPass } from "../render_graph.js";

export class MeshPass extends RenderPass {
    constructor() {
        super("MeshPass", ["Clear"]);
    }

    execute(renderer, scene) {
        const view = renderer.beginFrame();

        const encoder = renderer.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: "load",
                storeOp: "store"
            }]
        });

        scene.renderMeshes(pass, renderer);

        pass.end();
        renderer.device.queue.submit([encoder.finish()]);
    }
}