export class RenderPass {
    constructor(name, deps = []) {
        this.name = name;
        this.deps = deps;
    }

    execute(renderer, scene) {
        throw new Error("RenderPass.execute() not implemented");
    }
}

export class RenderGraph {
    constructor() {
        this.passes = [];
    }

    addPass(name, pass) {
        this.passes.push({ name, pass });
    }

    execute(renderer, scene) {
        for (const p of this.passes) {
            p.pass.execute(renderer, scene);
        }
    }
}