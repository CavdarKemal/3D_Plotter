export function applyBuoyancy(boat, sampler) {
    const wave = sampler.sample(boat.transform.x, boat.transform.y);
    const depth = wave - boat.transform.z;

    if (depth > 0) {
        boat.rigidbody.az += depth * boat.boat.buoyancy;
    }
}