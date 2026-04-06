export class EditorOutliner {
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        this.selectedEntity = null;
        this.onSelect = null;

        this.render();
    }

    render() {
        this.container.innerHTML = "";
        const rootUl = document.createElement("ul");
        rootUl.className = "outliner-root";

        for (const child of this.scene.root.children) {
            rootUl.appendChild(this.createNodeElement(child));
        }

        this.container.appendChild(rootUl);
    }

    createNodeElement(node) {
        const li = document.createElement("li");
        li.className = "outliner-node";

        const label = document.createElement("div");
        label.className = "outliner-label";

        const name = node.entity
            ? `Entity ${node.entity.id}`
            : "(root)";

        label.textContent = name;

        label.onclick = () => {
            this.selectedEntity = node.entity;
            this.highlightSelection(label);

            if (this.onSelect) {
                this.onSelect(node.entity);
            }
        };

        li.appendChild(label);

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
        const labels = this.container.querySelectorAll(".outliner-label");
        labels.forEach(l => l.classList.remove("selected"));

        label.classList.add("selected");
    }
}