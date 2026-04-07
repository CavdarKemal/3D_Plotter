import { Entity } from "./entity.js";
import { SceneGraphNode } from "./scene_graph_node.js";
import { Transform } from "./components/transform.js";
import { MeshComponent } from "./components/mesh_component.js";

export class Scene {
    constructor() {
        this.entities = new Map();
        this.nextId = 1;

        this.root = new SceneGraphNode(null);
    }

    createEntity(name) {
        const id = this.nextId++;
        const entity = new Entity(id);
        if (name) entity.name = name;

        const node = new SceneGraphNode(entity);
        entity.node = node;

        this.root.addChild(node);
        this.entities.set(id, entity);

        return entity;
    }

    deleteEntity(id) {
        const entity = this.entities.get(id);
        if (!entity) return;

        if (entity.node.parent) {
            entity.node.parent.removeChild(entity.node);
        }
        this.entities.delete(id);
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

            if (!mesh || !material) continue;

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

    serialize() {
        const entities = [];
        for (const [id, entity] of this.entities) {
            const t = entity.get("transform");
            const m = entity.get("mesh");
            entities.push({
                id,
                name: entity.name,
                transform: t ? {
                    position: Array.from(t.position),
                    rotation: Array.from(t.rotation),
                    scale: Array.from(t.scale)
                } : null,
                mesh: m ? { meshName: m.meshName, materialName: m.materialName } : null
            });
        }
        return JSON.stringify({ entities, nextId: this.nextId });
    }

    deserialize(json) {
        const data = JSON.parse(json);

        // Clear scene
        this.entities.clear();
        this.root.children = [];
        this.nextId = data.nextId || 1;

        for (const eData of data.entities) {
            const entity = new Entity(eData.id);
            entity.name = eData.name || `Entity ${eData.id}`;

            const node = new SceneGraphNode(entity);
            entity.node = node;
            this.root.addChild(node);
            this.entities.set(eData.id, entity);

            if (eData.transform) {
                const t = new Transform();
                t.position[0] = eData.transform.position[0];
                t.position[1] = eData.transform.position[1];
                t.position[2] = eData.transform.position[2];
                t.rotation[0] = eData.transform.rotation[0];
                t.rotation[1] = eData.transform.rotation[1];
                t.rotation[2] = eData.transform.rotation[2];
                t.scale[0] = eData.transform.scale[0];
                t.scale[1] = eData.transform.scale[1];
                t.scale[2] = eData.transform.scale[2];
                entity.addComponent("transform", t);
            }

            if (eData.mesh) {
                entity.addComponent("mesh", new MeshComponent(eData.mesh.meshName, eData.mesh.materialName));
            }
        }

        this.updateTransforms();
    }
}
