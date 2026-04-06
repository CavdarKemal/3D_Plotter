export class IslandGeneratorUI {
    constructor(terrainSystem) {
        this.terrain = terrainSystem;

        const container = document.createElement("div");

        const seedInput = document.createElement("input");
        seedInput.type = "number";
        seedInput.placeholder = "Seed";

        const generateBtn = document.createElement("button");
        generateBtn.textContent = "Insel generieren";

        generateBtn.onclick = () => {
            const seed = parseInt(seedInput.value) || Math.random() * 999999;
            this.terrain.generate(seed);
        };

        container.appendChild(seedInput);
        container.appendChild(generateBtn);

        this.element = container;
    }
}
