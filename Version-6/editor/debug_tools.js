export class DebugTools {
    constructor(renderer, ocean, client) {
        this.renderer = renderer;
        this.ocean = ocean;
        this.client = client;
    }

    render() {
        this.renderer.drawText(FPS: ${Math.round(1 / this.renderer.dt)}, 20, 20);
        this.renderer.drawText(Ping: ${this.client.ping || 0}ms, 20, 40);
    }
}
