export class EditorUI {
    constructor() {
        this.panels = [];
    }

    addPanel(title, element) {
        const panel = document.createElement("div");
        panel.className = "editor-panel";

        const header = document.createElement("h3");
        header.textContent = title;

        panel.appendChild(header);
        panel.appendChild(element);

        document.body.appendChild(panel);
        this.panels.push(panel);
    }
}
