import '../static/style.css'
import * as THREE from 'three'
import { StateController } from "./stateController.js"
import { StandardRenderer } from "./standardRenderer.js"
import { MVPmat } from "./transform.js"

const canvas = document.querySelector('canvas.webgl')
var webglRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, stencil: false, depth: true});
webglRenderer.setSize(window.innerWidth, window.innerHeight);

var sc = new StateController();
var renderer = new StandardRenderer(webglRenderer);
var mat = new MVPmat(sc.state);
animate();

function animate()
{
    mat.update(sc.state);
	renderer.render(mat.modelMat, mat.viewMat);
	requestAnimationFrame(animate);
}
