import { EditorOutliner } from "./outliner.js";
import { EditorInspector } from "./inspector.js";

export class EditorUI {
    constructor(scene, renderer, dom, gizmos, gizmoPass) {
        this.scene = scene;
        this.renderer = renderer;
        this.dom = dom;
        this.gizmos = gizmos;
        this.gizmoPass = gizmoPass;

        this.activeMode = "translate";

        this.outliner = new EditorOutliner(scene, dom.outliner);
        this.inspector = new EditorInspector(scene, dom.inspector);

        this.outliner.onSelect = (entity) => {
            this.gizmos.translate.setSelectedEntity(entity);
            this.gizmos.rotate.setSelectedEntity(entity);
            this.gizmos.scale.setSelectedEntity(entity);
            this.inspector.render(entity);
        };

        this.outliner.onEntityDeleted = () => {
            this.gizmos.translate.setSelectedEntity(null);
            this.gizmos.rotate.setSelectedEntity(null);
            this.gizmos.scale.setSelectedEntity(null);
            this.inspector.render(null);
        };

        if (dom.toolbar) {
            this.initToolbar(dom.toolbar);
        }
    }

    initToolbar(toolbar) {
        const modes = [
            { id: "translate", label: "Move (G)" },
            { id: "rotate",    label: "Rotate (R)" },
            { id: "scale",     label: "Scale (S)" }
        ];

        this.modeButtons = {};

        modes.forEach(m => {
            const btn = document.createElement("button");
            btn.className = "toolbar-btn";
            btn.textContent = m.label;
            btn.onclick = () => this.setMode(m.id);
            this.modeButtons[m.id] = btn;
            toolbar.appendChild(btn);
        });

        // Save / Load
        const sep = document.createElement("span");
        sep.className = "toolbar-sep";
        toolbar.appendChild(sep);

        const saveBtn = document.createElement("button");
        saveBtn.className = "toolbar-btn";
        saveBtn.textContent = "Save";
        saveBtn.onclick = () => this.saveScene();
        toolbar.appendChild(saveBtn);

        const loadBtn = document.createElement("button");
        loadBtn.className = "toolbar-btn";
        loadBtn.textContent = "Load";
        loadBtn.onclick = () => this.loadScene();
        toolbar.appendChild(loadBtn);

        this.setMode("translate");
    }

    setMode(mode) {
        this.activeMode = mode;

        if (this.gizmoPass) this.gizmoPass.setMode(mode);

        if (this.modeButtons) {
            for (const [k, btn] of Object.entries(this.modeButtons)) {
                btn.classList.toggle("active", k === mode);
            }
        }
    }

    saveScene() {
        const json = this.scene.serialize();
        localStorage.setItem("3d_plotter_scene", json);
        this._flash("Saved!");
    }

    loadScene() {
        const json = localStorage.getItem("3d_plotter_scene");
        if (!json) { this._flash("Nothing saved yet."); return; }

        this.scene.deserialize(json);

        // Reset gizmos and inspector
        this.gizmos.translate.setSelectedEntity(null);
        this.gizmos.rotate.setSelectedEntity(null);
        this.gizmos.scale.setSelectedEntity(null);
        this.inspector.render(null);

        this.outliner.render();
        this._flash("Loaded!");
    }

    _flash(msg) {
        const el = document.getElementById("status-msg");
        if (!el) return;
        el.textContent = msg;
        el.style.opacity = "1";
        clearTimeout(this._flashTimer);
        this._flashTimer = setTimeout(() => { el.style.opacity = "0"; }, 2000);
    }
}
