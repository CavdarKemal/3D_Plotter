struct CameraData {
    viewProj : mat4x4<f32>,
};

@group(0) @binding(0)
var<uniform> camera : CameraData;

struct ObjectData {
    model : mat4x4<f32>,
};

@group(1) @binding(0)
var<uniform> object : ObjectData;

struct VertexOut {
    @builtin(position) Position : vec4<f32>,
    @location(0) color : vec3<f32>,
};

@vertex
fn vs_main(
    @location(0) position : vec3<f32>,
    @location(1) color : vec3<f32>
) -> VertexOut {
    var out : VertexOut;
    let worldPos = object.model * vec4<f32>(position, 1.0);
    out.Position = camera.viewProj * worldPos;
    out.color = color;
    return out;
}

@fragment
fn fs_main(in : VertexOut) -> @location(0) vec4<f32> {
    return vec4<f32>(in.color, 1.0);
}