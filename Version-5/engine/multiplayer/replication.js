export function replicateLocalBoat(boat, client) {
    client.sendState({
        x: boat.transform.x,
        y: boat.transform.y,
        z: boat.transform.z,
        rotZ: boat.transform.rotZ
    });
}
