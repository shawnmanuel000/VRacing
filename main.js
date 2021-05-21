import './src/assets/style.css'
import * as THREE from 'three'
// import { StateController } from "./src/stateController.js"
import { Viewer } from "./src/standardRenderer.js"
// import { MVPmat } from "./src/transform.js"

const viewer = new Viewer();
run();

function run()
{
	viewer.render();
	requestAnimationFrame(run);
}
