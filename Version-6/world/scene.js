import { EditorUI } from "../editor/editor_ui.js";
import { IslandGeneratorUI } from "../editor/islandgeneratorui.js";
import { BoatEditor } from "../editor/boat_editor.js";
import { WorldBrowser } from "../editor/world_browser.js";
import { DebugTools } from "../editor/debug_tools.js";

export class Scene {
    constructor(ecs, renderer, input, ocean) {
        this.ecs = ecs;
        this.renderer = renderer;

        this.editor = new EditorUI();

        this.editor.addPanel("Insel Generator", new IslandGeneratorUI(this.terrain).element);
        this.editor.addPanel("Boot Editor", new BoatEditor(this.localBoat).element);
        this.editor.addPanel("World Browser", new WorldBrowser(this).element);

        this.debug = new DebugTools(renderer, ocean, this.client);
    }

    render() {
        this.renderer.clear();
        this.debug.render();
    }
}
