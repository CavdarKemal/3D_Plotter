import { mat4, vec3 } from "gl-matrix";

export class Transform {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = vec3.fromValues(0, 0, 0);
        this.scale = vec3.fromValues(1, 1, 1);

        this.localMatrix = mat4.create();
        this.worldMatrix = mat4.create();
    }

    updateLocalMatrix() {
        mat4.identity(this.localMatrix);
        mat4.translate(this.localMatrix, this.localMatrix, this.position);
        mat4.rotateX(this.localMatrix, this.localMatrix, this.rotation[0]);
        mat4.rotateY(this.localMatrix, this.localMatrix, this.rotation[1]);
        mat4.rotateZ(this.localMatrix, this.localMatrix, this.rotation[2]);
        mat4.scale(this.localMatrix, this.localMatrix, this.scale);
    }

    updateWorldMatrix(parentMatrix = null) {
        this.updateLocalMatrix();

        if (parentMatrix) {
            mat4.multiply(this.worldMatrix, parentMatrix, this.localMatrix);
        } else {
            mat4.copy(this.worldMatrix, this.localMatrix);
        }
    }
}