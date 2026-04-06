import { EditorOutliner } from "./outliner.js";
import { EditorInspector } from "./inspector.js";

export class EditorUI {
    constructor(scene, renderer, dom, gizmos) {
        this.scene = scene;
        this.renderer = renderer;
        this.dom = dom;
        this.gizmos = gizmos;

        this.outliner = new EditorOutliner(scene, dom.outliner);
        this.inspector = new EditorInspector(scene, this.outliner, dom.inspector);

        this.outliner.onSelect = (entity) => {
            this.gizmos.translate.setSelectedEntity(entity);
            this.gizmos.rotate.setSelectedEntity(entity);
            this.gizmos.scale.setSelectedEntity(entity);
            this.inspector.render(entity);
        };
    }
}