import { render } from "inferno";
import { GraphDemo } from "./pages/graph-demo";


document.addEventListener('DOMContentLoaded', () => {
    render(<GraphDemo />, document.getElementById("app"));
});