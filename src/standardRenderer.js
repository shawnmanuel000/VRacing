import * as THREE from 'three'
import { Track } from "./track.js"
import { SkySphere, Tile, TrackPlane } from "./utils.js"
import vertexShader from "./assets/shaders/vert.glsl"
import fragmentShader from "./assets/shaders/frag.glsl"

const ROAD_COLOR = new THREE.Vector3(100/255,100/255,100/255);
const GRASS_COLOR = new THREE.Vector3(90/255,160/255,90/255)
const NO_COLOR = new THREE.Vector3()
const canvas = document.querySelector('canvas.webgl')

var Viewer = function ()
{
	const webglRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, stencil: false, depth: true});
	webglRenderer.setSize(window.innerWidth, window.innerHeight);

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
	camera.matrixAutoUpdate = false;
	camera.position.set(0, 10, 10)
	
	const texture_loader = new THREE.TextureLoader();
	const sky_tex = texture_loader.load("/textures/sky.png")
	const grass_tex = texture_loader.load("/textures/grassy.png")
	const road_tex = texture_loader.load("/textures/lanegrey.png")
	grass_tex.wrapS = THREE.RepeatWrapping
	grass_tex.wrapT = THREE.RepeatWrapping
	road_tex.wrapS = THREE.RepeatWrapping
	road_tex.wrapT = THREE.RepeatWrapping
	
	const pointLights = [{position: new THREE.Vector3(0, 0, 100), color: new THREE.Color(0xff00ff)}]
	const grass = new Tile(-542,-760,797,-760,-542,745,797,745,-1, NO_COLOR, new THREE.Vector4(0,75,0,75), grass_tex);
	const sky = new SkySphere(new THREE.Vector3(0, 0, 0), sky_tex, 2000);
	const track = new Track()
	const trackplane = new TrackPlane(track.boundaries, NO_COLOR, road_tex)
	const objs = [sky, grass, trackplane];
	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x111111);
	
	const meshes = [];
	for (var i = 0; i < objs.length; i ++)
	{
		var material = new THREE.RawShaderMaterial({
			uniforms: {
				viewMat: { value: new THREE.Matrix4()},
				projectionMat: { value: new THREE.Matrix4()},
				modelViewMat: { value: new THREE.Matrix4()},
				normalMat: { value: new THREE.Matrix3()},
				pointLights: { value: pointLights },
				material: { value: objs[i].material },
				ambientLightColor: { value: objs[i].ambientLightColor },
				map: { value: objs[i].texture },
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.DoubleSide,
			shadowSide: THREE.DoubleSide,
		});

		const mesh = new THREE.Mesh(objs[i].geometry, material);
		meshes.push(mesh);
		scene.add(mesh);
	}

	function updateUniforms(viewMat)
	{
		for (var i = 0; i < objs.length; i ++)
		{
			const modelMat = computeModelTransform(objs[i].position, objs[i].rotation)
			// const positionTranslation = new THREE.Matrix4().makeTranslation(objs[i].position.x, objs[i].position.y, objs[i].position.z);
			// const _modelMat = new THREE.Matrix4().multiplyMatrices(positionTranslation, modelMat);
			const modelViewMat = new THREE.Matrix4().multiplyMatrices(viewMat, modelMat);
			const normalMat = new THREE.Matrix3().getNormalMatrix(modelViewMat);

			meshes[i].material.uniforms.viewMat.value = viewMat;
			meshes[i].material.uniforms.modelViewMat.value = modelViewMat;
			meshes[i].material.uniforms.normalMat.value = normalMat;
			meshes[i].material.uniforms.projectionMat.value = camera.projectionMatrix;
		}
		camera.matrixWorld.copy(viewMat).invert();
	}

	function computeModelTransform(modelTranslation, modelRotation)
	{
		var translationMat = new THREE.Matrix4().makeTranslation(modelTranslation.x, modelTranslation.y, modelTranslation.z);
		var rotationMatX = new THREE.Matrix4().makeRotationX(modelRotation.x * THREE.Math.DEG2RAD);
		var rotationMatY = new THREE.Matrix4().makeRotationY(modelRotation.y * THREE.Math.DEG2RAD);
		var modelMatrix = new THREE.Matrix4().premultiply(rotationMatY).premultiply(rotationMatX).premultiply(translationMat);
		return modelMatrix;
	}

	const position = new THREE.Vector3().add(camera.position)
	function computeViewTransform(state)
	{
		var yaw = state.yaw * THREE.Math.DEG2RAD
		var pitch = state.pitch * THREE.Math.DEG2RAD
		var frontx = Math.cos(yaw) * Math.cos(pitch)
		var fronty = Math.sin(pitch)
		var frontz = Math.sin(yaw) * Math.cos(pitch)
		var front = new THREE.Vector3(frontx,fronty,frontz).normalize()
		var upVector = new THREE.Vector3(0, 1, 0);
		var right = new THREE.Vector3().crossVectors(upVector, front).normalize()
		var up = new THREE.Vector3().crossVectors(front, right).normalize()
		var rotationMat = new THREE.Matrix4().makeBasis(right, up, front).transpose();
		var world2Cam = new THREE.Matrix3().setFromMatrix4(rotationMat).transpose()
		var movement = new THREE.Vector3().add(state.camMovement)
		var directions =  movement.applyMatrix3(world2Cam)
		position.addScaledVector(directions, -1)
		var translationMat = new THREE.Matrix4().makeTranslation(-position.x, -position.y, -position.z);
		return new THREE.Matrix4().premultiply(translationMat).premultiply(rotationMat);
	}

	const state = {
		camMovement: new THREE.Vector3(),
		yaw: 90,
		pitch: 0.0
	}

	function render()
	{
		sky.rotation.y += 0.01
		let viewMat = computeViewTransform(state)
		updateUniforms(viewMat);
		webglRenderer.render(scene, camera);
	}


	var previousPosition = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);	// A variable to store the mouse position on the previous frame.

	document.addEventListener("keydown", onKeyDown);
	function onKeyDown(event)
	{
		if ( event.which === 87 ) { state.camMovement.z = 3; }
		if ( event.which === 83 ) { state.camMovement.z = -3; }
		if ( event.which === 65 ) { state.camMovement.x = 3; }
		if ( event.which === 68 ) { state.camMovement.x = -3; }
		if ( event.which === 67 ) { state.camMovement.y = 3; }
		if ( event.which === 32 ) { state.camMovement.y = -3; }
	}

	document.addEventListener("keyup", onKeyUp);
	function onKeyUp(event)
	{
		if ( event.which === 87 ) { state.camMovement.z = 0; }
		if ( event.which === 83 ) { state.camMovement.z = 0; }
		if ( event.which === 65 ) { state.camMovement.x = 0; }
		if ( event.which === 68 ) { state.camMovement.x = 0; }
		if ( event.which === 67 ) { state.camMovement.y = 0; }
		if ( event.which === 32 ) { state.camMovement.y = 0; }
	}

	document.addEventListener("mousemove", onMove);
	function onMove(e)
	{
		var movement = new THREE.Vector2(e.pageX - previousPosition.x, previousPosition.y - e.pageY);
		previousPosition.set(e.pageX, e.pageY);
		state.yaw += movement.x * 0.1
		state.pitch -= movement.y * 0.1
	}

	window.addEventListener("resize", function ()
	{
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		webglRenderer.setSize(window.innerWidth, window.innerHeight);
	});

	this.updateUniforms = updateUniforms;
	this.render = render;
};

export { Viewer }