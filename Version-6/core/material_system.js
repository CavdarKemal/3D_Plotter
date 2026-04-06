export class MaterialSystem {
    constructor(device) {
        this.device = device;
        this.materials = new Map();
    }

    createMaterial(name, pipeline, renderer) {
        const cameraBindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: renderer.cameraBuffer }
            }]
        });

        const objectBindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(1),
            entries: [{
                binding: 0,
                resource: { buffer: renderer.objectBuffer }
            }]
        });

        this.materials.set(name, { pipeline, cameraBindGroup, objectBindGroup });
    }

    get(name) {
        return this.materials.get(name);
    }
}