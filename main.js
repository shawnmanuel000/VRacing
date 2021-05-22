import "./src/assets/style.css"
import { Viewer } from "./src/viewer.js"

const viewer = new Viewer();
run();

function run()
{
	viewer.render();
	requestAnimationFrame(run);
}
