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

        const availableMeshes = ["cube", "sphere", "plane"];

        // Mesh dropdown
        const meshRow = document.createElement("div");
        meshRow.className = "inspector-row";
        const meshLbl = document.createElement("span");
        meshLbl.className = "inspector-label";
        meshLbl.textContent = "Mesh";
        meshRow.appendChild(meshLbl);

        const select = document.createElement("select");
        select.style.cssText = "flex:1;background:#2a2a2e;color:#ddd;border:1px solid #3a3a3e;border-radius:3px;padding:3px 5px;font-size:12px;outline:none;";
        for (const name of availableMeshes) {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            if (name === meshComp.meshName) opt.selected = true;
            select.appendChild(opt);
        }
        select.onchange = () => { meshComp.meshName = select.value; };
        meshRow.appendChild(select);
        wrapper.appendChild(meshRow);

        // Material text field
        const matRow = document.createElement("div");
        matRow.className = "inspector-row";
        const matLbl = document.createElement("span");
        matLbl.className = "inspector-label";
        matLbl.textContent = "Material";
        matRow.appendChild(matLbl);

        const matInput = document.createElement("input");
        matInput.type = "text";
        matInput.value = meshComp.materialName;
        matInput.onchange = () => { meshComp.materialName = matInput.value; };
        matRow.appendChild(matInput);
        wrapper.appendChild(matRow);

        return wrapper;
    }
}
