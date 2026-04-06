export class MultiplayerClient {
    constructor() {
        this.ws = new WebSocket("ws://localhost:8080");
        this.players = {};
        this.seed = null;

        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);

            if (data.type === "seed") {
                this.seed = data.seed;
            }

            if (data.type === "state") {
                this.players[data.id] = data.state;
            }

            if (data.type === "leave") {
                delete this.players[data.id];
            }
        };
    }

    sendState(state) {
        this.ws.send(JSON.stringify({ type: "state", state }));
    }
}