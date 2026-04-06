export function applySailPhysics(boat, wind) {
    const angle = boat.boat.sailAngle - Math.atan2(wind.y, wind.x);
    const force = Math.cos(angle)  wind.speed  2;

    boat.rigidbody.vx += Math.cos(boat.transform.rotZ)  force  0.01;
    boat.rigidbody.vy += Math.sin(boat.transform.rotZ)  force  0.01;
}
