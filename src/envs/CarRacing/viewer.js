import * as THREE from "three"
import { Track } from "./track.js"
import { loadOBJ } from "./viewer/objLoader"
import { SkySphere, Tile, TrackRoad, TrackPlane } from "./viewer/mesh.js"
import { Shader } from "./viewer/shader.js"
import { Model } from "./viewer/model.js"
import { Camera } from "./viewer/camera.js"
import { Texture } from "./viewer/texture.js"
import { lerpAngles } from "../../utils/misc.js"

const ROAD_COLOR = new THREE.Vector3(100/255,100/255,100/255);
const GRASS_COLOR = new THREE.Vector3(90/255,160/255,90/255)
const NO_COLOR = new THREE.Vector3()
const canvas = document.querySelector("canvas.webgl")

var Viewer = function(lanes)
{
	const webglRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, stencil: false, alpha: true});
	webglRenderer.setSize(window.innerWidth, window.innerHeight);
	webglRenderer.setClearColor(0x000000);

	const camera = new Camera(new THREE.Vector3(0,10,10))

	const pointLights = [{position: new THREE.Vector3(0, 0, 100), color: new THREE.Color(0xffffff)}]
	const shader = new Shader(pointLights);

	const skytex = new Texture("/textures/sky.png")
	const grasstex = new Texture("/textures/grassy.png")
	const roadtex = new Texture("/textures/lanegrey.png")
	
	const road = new Model(shader).loadMeshes([new TrackRoad(lanes, NO_COLOR, roadtex)])
	// const road = new Model(shader).loadMeshes([new TrackRoad(lanes, ROAD_COLOR.clone())])
	const grasses = new Model(shader).loadMeshes([new TrackPlane(lanes, NO_COLOR, grasstex, new THREE.Vector4(0,75,0,75))])
	// const grasses = new Model(shader).loadMeshes([new TrackPlane(lanes, GRASS_COLOR.clone())])
	const sky = new Model(shader).loadMeshes([new SkySphere(skytex, 2000)])
	const car = new Model(shader, new THREE.Vector3(0,0,-5), new THREE.Vector3(0,0,0), 0.8).loadOBJ("/models/supra1.obj")
	// const car = new Model(shader, new THREE.Vector3(0,1,-5), new THREE.Vector3(0,0,0), 2.0).loadOBJ("/models/cube.obj")
	const models = [sky, grasses, road, car]
	const viewerAction = new THREE.Vector2()
	const delta_t = 0.05

	this.render = function(state)
	{
		state = {...state}
		state.?? = state.?? * THREE.Math.RAD2DEG
		const scene = new THREE.Scene()
		car.position.x = state.X
		car.position.z = -state.Y
		car.rotation.y = (state.??+90)
		sky.rotation.y += 0.01
		this.updateCamera(state, 20, delta_t, 5*delta_t)
		camera.update()
		const viewMatrix = camera.getViewMatrix()
		const projectionMatrix = camera.getProjectionMatrix()
		const cameraPos = camera.getPosition()
		for (const m of models) 
		{
			m.updateUniforms(viewMatrix, projectionMatrix, cameraPos);
			m.addRenderables(scene)
		}
		webglRenderer.render(scene, camera.camera);
	}

	this.updateCamera = function(state, pitch, dt, lerp)
	{
		if (!camera.follow) return
		const pos = new THREE.Vector3(state.X, 0.0, -state.Y);
		const yaw = lerpAngles(camera.getHeading(), (180-state.??), lerp)
		const offset_dirn3 = new THREE.Vector3(0,5,20);
		const vm = camera.computeViewMatrix()
		const world2Cam = new THREE.Matrix3().setFromMatrix4(vm).transpose()
		const old_pos = camera.getPosition();
		const next_cam = pos.clone().add(offset_dirn3.applyMatrix3(world2Cam));
		const new_pos = new THREE.Vector3().lerpVectors(old_pos, next_cam, lerp);
		camera.setPosition(new_pos, yaw, pitch);
	}

	this.getViewerAction = function()
	{
		return [viewerAction.x, viewerAction.y]
	}

	window.addEventListener("resize", function ()
	{
		webglRenderer.setSize(window.innerWidth, window.innerHeight);
	});

	document.addEventListener("keydown", (e) => this.onKeyDown(e));
	this.onKeyDown = function(event)
	{
		if ( event.which === 37 ) { viewerAction.x = 1; }
		if ( event.which === 38 ) { viewerAction.y = 1; }
		if ( event.which === 39 ) { viewerAction.x = -1; }
		if ( event.which === 40 ) { viewerAction.y = -1; }
	}

	document.addEventListener("keyup", (e) => this.onKeyUp(e));
	this.onKeyUp = function(event)
	{
		if ( event.which === 37 ) { viewerAction.x = 0; }
		if ( event.which === 38 ) { viewerAction.y = 0; }
		if ( event.which === 39 ) { viewerAction.x = 0; }
		if ( event.which === 40 ) { viewerAction.y = 0; }
	}

};

export { Viewer }