import * as THREE from "three"
import { Track } from "./track.js"
import { loadOBJ } from "./objLoader"
import { SkySphere, Tile, TrackRoad, TrackPlane } from "./mesh.js"
import { Shader } from "./shader.js"
import { Model } from "./model.js"
import { Camera } from "./camera.js"
import { Texture } from "./texture.js"

const ROAD_COLOR = new THREE.Vector3(100/255,100/255,100/255);
const GRASS_COLOR = new THREE.Vector3(90/255,160/255,90/255)
const NO_COLOR = new THREE.Vector3()
const canvas = document.querySelector("canvas.webgl")

var Viewer = function(lanes)
{
	const webglRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, stencil: false, alpha: true});
	webglRenderer.setSize(window.innerWidth, window.innerHeight);

	const camera = new Camera(new THREE.Vector3(0,10,10))

	const pointLights = [{position: new THREE.Vector3(0, 0, 100), color: new THREE.Color(0xffffff)}]
	const shader = new Shader(pointLights);

	const skytex = new Texture("/textures/sky.png")
	const grasstex = new Texture("/textures/grassy.png")
	const roadtex = new Texture("/textures/lanegrey.png")
	
	const road = new Model(shader).loadMeshes([new TrackRoad(lanes, NO_COLOR, roadtex)])
	const grasses = new Model(shader).loadMeshes([new TrackPlane(lanes, NO_COLOR, grasstex, new THREE.Vector4(0,75,0,75))])
	const sky = new Model(shader).loadMeshes([new SkySphere(skytex, 2000)])
	const car = new Model(shader, new THREE.Vector3(0,0,-5), new THREE.Vector3(0,0,0), 0.8).loadOBJ("/models/supra1.obj")
	const models = [sky, grasses, road, car]

	this.render = function()
	{
		const scene = new THREE.Scene()
		sky.rotation.y += 0.01
		camera.update()
		for (const m of models) 
		{
			m.updateUniforms(camera.viewMatrix, camera.projectionMatrix, camera.position);
			m.addRenderables(scene)
		}
		webglRenderer.render(scene, camera.camera);
	}

	window.addEventListener("resize", function ()
	{
		webglRenderer.setSize(window.innerWidth, window.innerHeight);
	});

};

export { Viewer }