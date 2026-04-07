import { Transform } from "../world/components/transform.js";
import { MeshComponent } from "../world/components/mesh_component.js";

export class EditorOutliner {
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        this.selectedEntity = null;
        this.onSelect = null;
        this.onEntityCreated = null;
        this.onEntityDeleted = null;

        this.render();
    }

    render() {
        this.container.innerHTML = "";

        // "+ Add Entity" button
        const addBtn = document.createElement("button");
        addBtn.className = "outliner-add-btn";
        addBtn.textContent = "+ Add Entity";
        addBtn.onclick = () => this.createEntity();
        this.container.appendChild(addBtn);

        const rootUl = document.createElement("ul");
        rootUl.className = "outliner-root";

        for (const child of this.scene.root.children) {
            rootUl.appendChild(this.createNodeElement(child));
        }

        this.container.appendChild(rootUl);
    }

    createEntity() {
        const entity = this.scene.createEntity();
        entity.addComponent("transform", new Transform());
        entity.addComponent("mesh", new MeshComponent("cube", "basic"));
        this.scene.updateTransforms();
        this.render();
        if (this.onEntityCreated) this.onEntityCreated(entity);
        // Auto-select new entity
        if (this.onSelect) this.onSelect(entity);
    }

    createNodeElement(node) {
        const li = document.createElement("li");
        li.className = "outliner-node";

        const row = document.createElement("div");
        row.className = "outliner-row";

        // Entity label (click to select, double-click to rename)
        const label = document.createElement("span");
        label.className = "outliner-label";
        label.textContent = node.entity ? node.entity.name : "(root)";

        label.onclick = () => {
            this.selectedEntity = node.entity;
            this.highlightSelection(label);
            if (this.onSelect) this.onSelect(node.entity);
        };

        label.ondblclick = () => {
            if (!node.entity) return;
            const input = document.createElement("input");
            input.type = "text";
            input.className = "outliner-rename-input";
            input.value = node.entity.name;

            const commit = () => {
                node.entity.name = input.value.trim() || node.entity.name;
                this.render();
            };

            input.onblur = commit;
            input.onkeydown = e => {
                if (e.key === "Enter") { e.preventDefault(); input.blur(); }
                if (e.key === "Escape") { this.render(); }
            };

            label.replaceWith(input);
            input.focus();
            input.select();
        };

        row.appendChild(label);

        // Delete button
        if (node.entity) {
            const delBtn = document.createElement("button");
            delBtn.className = "outliner-del-btn";
            delBtn.textContent = "×";
            delBtn.title = "Delete entity";
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.scene.deleteEntity(node.entity.id);
                this.render();
                if (this.onEntityDeleted) this.onEntityDeleted();
            };
            row.appendChild(delBtn);
        }

        li.appendChild(row);

        if (node.children.length > 0) {
            const ul = document.createElement("ul");
            ul.className = "outliner-children";
            for (const child of node.children) {
                ul.appendChild(this.createNodeElement(child));
            }
            li.appendChild(ul);
        }

        return li;
    }

    highlightSelection(label) {
        this.container.querySelectorAll(".outliner-label").forEach(l => l.classList.remove("selected"));
        label.classList.add("selected");
    }
}
