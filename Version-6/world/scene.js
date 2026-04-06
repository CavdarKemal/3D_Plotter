import { Entity } from "./entity.js";
import { SceneGraphNode } from "./scene_graph_node.js";

export class Scene {
    constructor() {
        this.entities = new Map();
        this.nextId = 1;

        this.root = new SceneGraphNode(null);
    }

    createEntity() {
        const id = this.nextId++;
        const entity = new Entity(id);

        const node = new SceneGraphNode(entity);
        entity.node = node;

        this.root.addChild(node);
        this.entities.set(id, entity);

        return entity;
    }

    updateTransforms() {
        const updateNode = (node, parentMatrix = null) => {
            if (node.entity) {
                const transform = node.entity.get("transform");
                if (transform) {
                    transform.updateWorldMatrix(parentMatrix);
                }
            }

            for (const child of node.children) {
                const world = node.entity?.get("transform")?.worldMatrix || parentMatrix;
                updateNode(child, world);
            }
        };

        updateNode(this.root, null);
    }

    renderMeshes(pass, renderer) {
        for (const entity of this.entities.values()) {
            const meshComp = entity.get("mesh");
            const transform = entity.get("transform");

            if (!meshComp || !transform) continue;

            const mesh = renderer.meshSystem.get(meshComp.meshName);
            const material = renderer.materialSystem.get(meshComp.materialName);

            renderer.device.queue.writeBuffer(
                renderer.objectBuffer,
                0,
                transform.worldMatrix
            );

            pass.setPipeline(material.pipeline);
            pass.setBindGroup(0, material.cameraBindGroup);
            pass.setBindGroup(1, material.objectBindGroup);

            pass.setVertexBuffer(0, mesh.vertexBuffer);
            pass.setVertexBuffer(1, mesh.colorBuffer);
            pass.setIndexBuffer(mesh.indexBuffer, "uint16");

            pass.drawIndexed(mesh.indexCount);
        }
    }
}