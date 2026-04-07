export class PipelineManager {
    constructor(device, format) {
        this.device = device;
        this.format = format;
        this.pipelines = new Map();
    }

    createPipeline(name, shaderModule) {
        const pipeline = this.device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }]
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: [{ shaderLocation: 1, offset: 0, format: "float32x3" }]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [{ format: this.format }]
            },
            primitive: { topology: "triangle-list" },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            }
        });

        this.pipelines.set(name, pipeline);
        return pipeline;
    }

    createLinePipeline(name, shaderModule) {
        const pipeline = this.device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }]
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: [{ shaderLocation: 1, offset: 0, format: "float32x3" }]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [{ format: this.format }]
            },
            primitive: { topology: "line-list" }
            // No depthStencil: gizmos and grid render on top of everything
        });

        this.pipelines.set(name, pipeline);
        return pipeline;
    }

    get(name) {
        return this.pipelines.get(name);
    }
}
