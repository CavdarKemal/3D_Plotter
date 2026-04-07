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
                clearValue: { r: 0.08, g: 0.08, b: 0.09, a: 1 },
                loadOp: "clear",
                storeOp: "store"
            }],
            depthStencilAttachment: {
                view: renderer.depthView,
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            }
        });

        scene.renderMeshes(pass, renderer);

        pass.end();
        renderer.device.queue.submit([encoder.finish()]);
    }
}
