export function applyMotor(boat) {
    const power = boat.boat.motorPower;

    boat.rigidbody.vx += Math.cos(boat.transform.rotZ)  power  0.02;
    boat.rigidbody.vy += Math.sin(boat.transform.rotZ)  power  0.02;
}
