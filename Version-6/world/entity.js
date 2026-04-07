export class Entity {
    constructor(id) {
        this.id = id;
        this.name = `Entity ${id}`;
        this.components = new Map();
        this.node = null;
    }

    addComponent(type, component) {
        this.components.set(type, component);
        return component;
    }

    get(type) {
        return this.components.get(type);
    }
}