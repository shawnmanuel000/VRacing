import './src/assets/style.css'
import { Viewer } from "./src/standardRenderer.js"

const viewer = new Viewer();
run();

function run()
{
	viewer.render();
	requestAnimationFrame(run);
}
