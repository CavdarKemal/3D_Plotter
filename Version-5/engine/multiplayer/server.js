import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];
let worldSeed = Math.random() * 999999;

wss.on("connection", ws => {
    const id = Date.now();
    clients.push({ id, ws });

    ws.send(JSON.stringify({ type: "seed", seed: worldSeed }));

    ws.on("message", msg => {
        const data = JSON.parse(msg);

        if (data.type === "state") {
            broadcast({ type: "state", id, state: data.state });
        }
    });

    ws.on("close", () => {
        clients = clients.filter(c => c.id !== id);
        broadcast({ type: "leave", id });
    });
});

function broadcast(msg) {
    for (const c of clients) {
        c.ws.send(JSON.stringify(msg));
    }
}
