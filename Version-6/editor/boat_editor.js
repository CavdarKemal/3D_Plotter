export class BoatEditor {
    constructor(boat) {
        const container = document.createElement("div");

        const mass = document.createElement("input");
        mass.type = "range";
        mass.min = 10;
        mass.max = 200;
        mass.value = boat.rigidbody.mass;

        mass.oninput = () => {
            boat.rigidbody.mass = parseFloat(mass.value);
        };

        container.appendChild(document.createTextNode("Masse"));
        container.appendChild(mass);

        this.element = container;
    }
}
