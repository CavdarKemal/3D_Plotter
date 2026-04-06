export class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
        this.node = null; // SceneGraphNode
    }

    addComponent(type, component) {
        this.components.set(type, component);
        return component;
    }

    get(type) {
        return this.components.get(type);
    }
}