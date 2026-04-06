import { RenderPass } from "../render_graph.js";

export class GizmoPass extends RenderPass {
    constructor(gizmos) {
        super("GizmoPass", ["MeshPass"]);
        this.gizmos = gizmos; // { translate, rotate, scale }
    }

    execute(renderer, scene) {
        const view = renderer.beginFrame();

        const encoder = renderer.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view,
                loadOp: "load",
                storeOp: "store"
            }]
        });

        if (this.gizmos.translate) {
            this.gizmos.translate.render(pass, renderer);
        }
        if (this.gizmos.rotate) {
            this.gizmos.rotate.render(pass, renderer);
        }
        if (this.gizmos.scale) {
            this.gizmos.scale.render(pass, renderer);
        }

        pass.end();
        renderer.device.queue.submit([encoder.finish()]);
    }
}