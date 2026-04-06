export class MeshSystem {
    constructor(device) {
        this.device = device;
        this.meshes = new Map();
    }

    createMesh(name, vertices, colors, indices) {
        const vertexBuffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer(vertexBuffer, 0, vertices);

        const colorBuffer = this.device.createBuffer({
            size: colors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer(colorBuffer, 0, colors);

        const indexBuffer = this.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer(indexBuffer, 0, indices);

        this.meshes.set(name, {
            vertexBuffer,
            colorBuffer,
            indexBuffer,
            indexCount: indices.length
        });
    }

    get(name) {
        return this.meshes.get(name);
    }
}