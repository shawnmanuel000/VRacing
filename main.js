import './src/assets/style.css'
import * as THREE from 'three'
import { StateController } from "./src/stateController.js"
import { Viewer } from "./src/standardRenderer.js"
import { MVPmat } from "./src/transform.js"

const sc = new StateController();
const viewer = new Viewer();
const mat = new MVPmat(sc.state);
run();

function run()
{
    mat.update(sc.state);
	viewer.render(mat.modelMat, mat.viewMat);
	requestAnimationFrame(run);
}
