export function predictRemoteBoat(remote, dt) {
    remote.x += remote.vx * dt;
    remote.y += remote.vy * dt;
}
