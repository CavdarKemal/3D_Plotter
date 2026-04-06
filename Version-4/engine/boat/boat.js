export function createBoatEntity() {
  return {
    transform: {
      x: 0, y: 0, z: 0,
      rotX: 0, rotY: 0, rotZ: 0
    },
    rigidbody: {
      vx: 0, vy: 0, vz: 0,
      ax: 0, ay: 0, az: 0,
      mass: 50
    },
    boat: {
      buoyancy: 30,
      drag: 2,
      rudderAngle: 0,
      sailAngle: 0,
      motorPower: 0
    }
  };
}