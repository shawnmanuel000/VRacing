import './style.css'
import * as THREE from 'three'
import vertexShader from "../static/shaders/vert.glsl"
import fragmentShader from "../static/shaders/frag.glsl"
import { Teapot, DisplayParameters } from "./utils.js"
import { StateController } from "./stateController.js"
import { StandardRenderer } from "./standardRenderer.js"
import { MVPmat } from "./transform.js"


const canvas = document.querySelector('canvas.webgl')
var screenDiagonal = 32;
var	distanceScreenViewer = 200.0;
var dispParams = new DisplayParameters(distanceScreenViewer, screenDiagonal);

var webglRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, stencil: false, depth: true});
webglRenderer.setSize(dispParams.canvasWidth, dispParams.canvasHeight);

var teapots = [];
var gouraudTeapot = new Teapot(new THREE.Vector3(0, 0, 0), vertexShader, fragmentShader);
teapots.push(gouraudTeapot);

var sc = new StateController(dispParams);
var renderer = new StandardRenderer(webglRenderer, teapots, dispParams);
var mat = new MVPmat(dispParams);
animate();

function animate()
{
    mat.update(sc.state);
	renderer.render(sc.state, mat.modelMat, mat.viewMat, mat.projectionMat);
	requestAnimationFrame(animate);
}
