export class EditorInspector {
    constructor(scene, outliner, container) {
        this.scene = scene;
        this.outliner = outliner;
        this.container = container;

        this.outliner.onSelect = (entity) => {
            this.render(entity);
        };

        this.render(null);
    }

    render(entity) {
        this.container.innerHTML = "";

        if (!entity) {
            this.container.innerHTML = "<div class='inspector-empty'>No entity selected</div>";
            return;
        }

        const title = document.createElement("h3");
        title.textContent = `Entity ${entity.id}`;
        this.container.appendChild(title);

        for (const [type, component] of entity.components.entries()) {
            const section = document.createElement("div");
            section.className = "inspector-section";

            const header = document.createElement("h4");
            header.textContent = type;
            section.appendChild(header);

            if (type === "transform") {
                section.appendChild(this.renderTransform(component, entity));
            }

            if (type === "mesh") {
                section.appendChild(this.renderMesh(component, entity));
            }

            this.container.appendChild(section);
        }
    }

    renderTransform(transform, entity) {
        const wrapper = document.createElement("div");

        const createVec3Field = (label, vec) => {
            const row = document.createElement("div");
            row.className = "inspector-row";

            const lbl = document.createElement("span");
            lbl.textContent = label;
            row.appendChild(lbl);

            ["x", "y", "z"].forEach((axis, i) => {
                const input = document.createElement("input");
                input.type = "number";
                input.step = "0.1";
                input.value = vec[i];

                input.oninput = () => {
                    vec[i] = parseFloat(input.value);
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

    renderMesh(meshComp, entity) {
        const wrapper = document.createElement("div");

        const meshRow = document.createElement("div");
        meshRow.className = "inspector-row";

        const meshLabel = document.createElement("span");
        meshLabel.textContent = "Mesh:";
        meshRow.appendChild(meshLabel);

        const meshInput = document.createElement("input");
        meshInput.type = "text";
        meshInput.value = meshComp.meshName;

        meshInput.onchange = () => {
            meshComp.meshName = meshInput.value;
        };

        meshRow.appendChild(meshInput);
        wrapper.appendChild(meshRow);

        const matRow = document.createElement("div");
        matRow.className = "inspector-row";

        const matLabel = document.createElement("span");
        matLabel.textContent = "Material:";
        matRow.appendChild(matLabel);

        const matInput = document.createElement("input");
        matInput.type = "text";
        matInput.value = meshComp.materialName;

        matInput.onchange = () => {
            meshComp.materialName = matInput.value;
        };

        matRow.appendChild(matInput);
        wrapper.appendChild(matRow);

        return wrapper;
    }
}