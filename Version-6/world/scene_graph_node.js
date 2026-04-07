export class SceneGraphNode {
    constructor(entity) {
        this.entity = entity;
        this.children = [];
        this.parent = null;
    }

    addChild(node) {
        node.parent = this;
        this.children.push(node);
    }

    removeChild(node) {
        this.children = this.children.filter(c => c !== node);
        node.parent = null;
    }
}