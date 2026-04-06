export class Engine {
    constructor(canvas) {
        this.canvas = canvas;

        this.renderer = new Renderer(canvas);
        this.input = new Input();
        this.ecs = new ECS();

        this.ocean = new OceanSystem(this.renderer);
        this.terrain = new TerrainSystem(this.renderer);
        this.scene = new Scene(this.ecs, this.renderer, this.input, this.ocean);

        this.loop = new GameLoop(
            dt => this.update(dt),
            () => this.render()
        );
    }

    update(dt) {
        this.scene.update(dt);
    }

    render() {
        this.scene.render();
    }

    start() {
        this.loop.start();
    }
}
