export class ShaderCompiler {
    constructor(device) {
        this.device = device;
    }

    async load(path) {
        const code = await fetch(path).then(r => r.text());
        return this.device.createShaderModule({ code });
    }
}