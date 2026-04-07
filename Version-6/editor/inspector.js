export class EditorInspector {
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        this.render(null);
    }

    render(entity) {
        this.container.innerHTML = "";

        if (!entity) {
            this.container.innerHTML = "<div class='inspector-empty'>No entity selected</div>";
            return;
        }

        const title = document.createElement("h3");
        title.textContent = entity.name || `Entity ${entity.id}`;
        this.container.appendChild(title);

        for (const [type, component] of entity.components.entries()) {
            const section = document.createElement("div");
            section.className = "inspector-section";

            const header = document.createElement("h4");
            header.textContent = type;
            section.appendChild(header);

            if (type === "transform") {
                section.appendChild(this.renderTransform(component));
            }

            if (type === "mesh") {
                section.appendChild(this.renderMesh(component));
            }

            this.container.appendChild(section);
        }
    }

    renderTransform(transform) {
        const wrapper = document.createElement("div");

        const createVec3Field = (label, vec) => {
            const row = document.createElement("div");
            row.className = "inspector-row";

            const lbl = document.createElement("span");
            lbl.className = "inspector-label";
            lbl.textContent = label;
            row.appendChild(lbl);

            ["x", "y", "z"].forEach((axis, i) => {
                const input = document.createElement("input");
                input.type = "number";
                input.step = "0.1";
                input.value = vec[i].toFixed(3);

                input.oninput = () => {
                    vec[i] = parseFloat(input.value) || 0;
                    transform.updateLocalMatrix();
                    this.scene.updateTransforms();
                };

                row.appendChild(input);
            });

            return row;
        };

        wrapper.appendChild(createVec3Field("Position", transform.position));
        wrapper.appendChild(createVec3Field("Rotation", transform.rotation));
        wrapper.appendChild(createVec3Field("Scale", transform.scale));

        return wrapper;
    }

    renderMesh(meshComp) {
        const wrapper = document.createElement("div");

        const addRow = (labelText, value, onChange) => {
            const row = document.createElement("div");
            row.className = "inspector-row";

            const lbl = document.createElement("span");
            lbl.className = "inspector-label";
            lbl.textContent = labelText;
            row.appendChild(lbl);

            const input = document.createElement("input");
            input.type = "text";
            input.value = value;
            input.onchange = () => onChange(input.value);
            row.appendChild(input);
            wrapper.appendChild(row);
        };

        addRow("Mesh", meshComp.meshName, v => { meshComp.meshName = v; });
        addRow("Material", meshComp.materialName, v => { meshComp.materialName = v; });

        return wrapper;
    }
}
