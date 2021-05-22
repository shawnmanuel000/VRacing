import * as THREE from "three"
import { Track } from "./track.js"
import { loadOBJ } from "./objLoader"
import { SkySphere, Tile, TrackRoad, TrackPlane } from "./mesh.js"
import { Shader } from "./shader.js"
import { Model } from "./model.js"
import { Camera } from "./camera.js"

const ROAD_COLOR = new THREE.Vector3(100/255,100/255,100/255);
const GRASS_COLOR = new THREE.Vector3(90/255,160/255,90/255)
const NO_COLOR = new THREE.Vector3()
const canvas = document.querySelector("canvas.webgl")

var Viewer = function(lanes)
{
	const webglRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, stencil: false, alpha: true});
	webglRenderer.setSize(window.innerWidth, window.innerHeight);

	// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
	// camera.matrixAutoUpdate = false;
	// camera.position.set(0, 10, 10)

	const cam2 = new Camera(new THREE.Vector3(0,10,10))

	const pointLights = [{position: new THREE.Vector3(0, 0, 100), color: new THREE.Color(0xffffff)}]
	const shader = new Shader(pointLights);
	
	const texture_loader = new THREE.TextureLoader();
	const sky_tex = texture_loader.load("/textures/sky.png")
	const grass_tex = texture_loader.load("/textures/grassy.png")
	const road_tex = texture_loader.load("/textures/lanegrey.png")
	grass_tex.wrapS = THREE.RepeatWrapping
	grass_tex.wrapT = THREE.RepeatWrapping
	road_tex.wrapS = THREE.RepeatWrapping
	road_tex.wrapT = THREE.RepeatWrapping
	
	const road = new Model(shader).loadMeshes([new TrackRoad(lanes, NO_COLOR, road_tex)])
	const grasses = new Model(shader).loadMeshes([new TrackPlane(lanes, NO_COLOR, grass_tex, new THREE.Vector4(0,75,0,75))])
	const sky = new Model(shader).loadMeshes([new SkySphere(sky_tex, 2000)])
	const car = new Model(shader, new THREE.Vector3(0,0,-5), new THREE.Vector3(0,0,0), 0.8).loadOBJ("/models/supra1.obj")
	const models = [sky, grasses, road, car]

	// const position = new THREE.Vector3().add(camera.position)
	// function computeViewTransform(state)
	// {
	// 	var yaw = state.yaw * THREE.Math.DEG2RAD
	// 	var pitch = state.pitch * THREE.Math.DEG2RAD
	// 	var frontx = Math.cos(yaw) * Math.cos(pitch)
	// 	var fronty = Math.sin(pitch)
	// 	var frontz = Math.sin(yaw) * Math.cos(pitch)
	// 	var front = new THREE.Vector3(frontx,fronty,frontz).normalize()
	// 	var upVector = new THREE.Vector3(0, 1, 0);
	// 	var right = new THREE.Vector3().crossVectors(upVector, front).normalize()
	// 	var up = new THREE.Vector3().crossVectors(front, right).normalize()
	// 	var rotationMat = new THREE.Matrix4().makeBasis(right, up, front).transpose();
	// 	var translationMat = new THREE.Matrix4().makeTranslation(-position.x, -position.y, -position.z);
	// 	var viewMat = new THREE.Matrix4().premultiply(translationMat).premultiply(rotationMat);
	// 	var world2Cam = new THREE.Matrix3().setFromMatrix4(viewMat).transpose()
	// 	var movement = new THREE.Vector3().add(state.camMovement)
	// 	var directions =  movement.applyMatrix3(world2Cam)
	// 	position.addScaledVector(directions, -1)

	// 	return viewMat
	// }

	// const state = {
	// 	camMovement: new THREE.Vector3(),
	// 	yaw: 90,
	// 	pitch: 0.0
	// }

	function render()
	{
		var scene = new THREE.Scene()
		// let viewMatrix = computeViewTransform(state)
		// camera.matrixWorld.copy(viewMatrix).invert();

		cam2.update()

		sky.rotation.y += 0.01
		for (const m of models) 
		{
			m.updateUniforms(cam2.viewMatrix, cam2.projectionMatrix, cam2.position);
			m.addRenderables(scene)
		}
		webglRenderer.render(scene, cam2.camera);
	}


	// var curserPos = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);	// A variable to store the mouse position on the previous frame.

	// document.addEventListener("keydown", onKeyDown);
	// function onKeyDown(event)
	// {
	// 	if ( event.which === 87 ) { state.camMovement.z = 3; }
	// 	if ( event.which === 83 ) { state.camMovement.z = -3; }
	// 	if ( event.which === 65 ) { state.camMovement.x = 3; }
	// 	if ( event.which === 68 ) { state.camMovement.x = -3; }
	// 	if ( event.which === 67 ) { state.camMovement.y = 3; }
	// 	if ( event.which === 32 ) { state.camMovement.y = -3; }
	// }

	// document.addEventListener("keyup", onKeyUp);
	// function onKeyUp(event)
	// {
	// 	if ( event.which === 87 ) { state.camMovement.z = 0; }
	// 	if ( event.which === 83 ) { state.camMovement.z = 0; }
	// 	if ( event.which === 65 ) { state.camMovement.x = 0; }
	// 	if ( event.which === 68 ) { state.camMovement.x = 0; }
	// 	if ( event.which === 67 ) { state.camMovement.y = 0; }
	// 	if ( event.which === 32 ) { state.camMovement.y = 0; }
	// }

	// document.addEventListener("mousemove", onMove);
	// function onMove(e)
	// {
	// 	// var movement = new THREE.Vector2(e.pageX - previousPosition.x, previousPosition.y - e.pageY);
	// 	// previousPosition.set(e.pageX, e.pageY);
	// 	var offsetX = e.pageX - curserPos.x
	// 	var offsetY = curserPos.y - e.pageY
	// 	// var movement = new THREE.Vector2(e.pageX - this.curserPos.x, this.curserPos.y - e.pageY);
	// 	curserPos.set(e.pageX, e.pageY);
	// 	// state.yaw += offsetX * 0.1
	// 	// state.pitch -= offsetY * 0.1
	// 	state.pitch = Math.min(Math.max(state.pitch - offsetY * 0.1, -80.0), 80.0)
	// 	state.yaw = (state.yaw + offsetX * 0.1) % 360.0
	// }

	window.addEventListener("resize", function ()
	{
		// camera.aspect = window.innerWidth / window.innerHeight
		// camera.updateProjectionMatrix()
		webglRenderer.setSize(window.innerWidth, window.innerHeight);
	});

	// this.updateUniforms = updateUniforms;
	this.render = render;
};

export { Viewer }