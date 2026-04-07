import { RenderPass } from "../render_graph.js";
import { mat4 } from "gl-matrix";

export class GizmoPass extends RenderPass {
    constructor(gizmos) {
        super("GizmoPass", ["MeshPass"]);
        this.gizmos = gizmos; // { translate, rotate, scale }
        this.activeMode = "translate";
    }

    setMode(mode) {
        this.activeMode = mode;
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
            // No depthStencil: gizmos and grid always render on top
        });

        // Always render grid
        this._renderGrid(pass, renderer);

        // Only render the active gizmo
        if (this.activeMode === "translate" && this.gizmos.translate) {
            this.gizmos.translate.render(pass, renderer);
        }
        if (this.activeMode === "rotate" && this.gizmos.rotate) {
            this.gizmos.rotate.render(pass, renderer);
        }
        if (this.activeMode === "scale" && this.gizmos.scale) {
            this.gizmos.scale.render(pass, renderer);
        }

        pass.end();
        renderer.device.queue.submit([encoder.finish()]);
    }

    _renderGrid(pass, renderer) {
        const mesh = renderer.meshSystem.get("grid");
        const mat = renderer.materialSystem.get("gizmo");
        if (!mesh || !mat) return;

        const identity = mat4.create();
        renderer.device.queue.writeBuffer(renderer.objectBuffer, 0, identity);

        pass.setPipeline(mat.pipeline);
        pass.setBindGroup(0, mat.cameraBindGroup);
        pass.setBindGroup(1, mat.objectBindGroup);
        pass.setVertexBuffer(0, mesh.vertexBuffer);
        pass.setVertexBuffer(1, mesh.colorBuffer);
        pass.setIndexBuffer(mesh.indexBuffer, "uint16");
        pass.drawIndexed(mesh.indexCount);
    }
}
