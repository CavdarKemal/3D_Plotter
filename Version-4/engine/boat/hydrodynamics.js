export function applyHydrodynamics(boat) {
    const rb = boat.rigidbody;

    rb.vx *= 0.98;
    rb.vy *= 0.98;
    rb.vz *= 0.95;

    boat.transform.rotZ += boat.boat.rudderAngle * 0.02;
}
