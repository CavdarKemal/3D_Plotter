export class WorldBrowser {
    constructor(scene) {
        const container = document.createElement("div");

        const jumpBtn = document.createElement("button");
        jumpBtn.textContent = "Zu zufälligem Chunk springen";

        jumpBtn.onclick = () => {
            const x = (Math.random() - 0.5) * 5000;
            const y = (Math.random() - 0.5) * 5000;
            scene.localBoat.transform.x = x;
            scene.localBoat.transform.y = y;
        };

        container.appendChild(jumpBtn);
        this.element = container;
    }
}
