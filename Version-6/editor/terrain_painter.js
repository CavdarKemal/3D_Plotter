export class TerrainPainter {
    constructor(terrainSystem, input) {
        this.terrain = terrainSystem;
        this.input = input;
        this.brushSize = 10;
        this.strength = 0.02;
    }

    update(dt) {
        if (this.input.isDown("mouse1")) {
            const pos = this.terrain.getCursorPosition();
            this.terrain.applyBrush(pos.x, pos.y, this.brushSize, this.strength);
        }
    }
}
