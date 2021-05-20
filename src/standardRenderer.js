import * as THREE from 'three'
import { SkySphere, Tile } from "./utils.js"
import vertexShader from "../static/shaders/vert.glsl"
import fragmentShader from "../static/shaders/frag.glsl"

const grassColor = new THREE.Vector3(90/500,160/255,90/255)

var StandardRenderer = function (webglRenderer)
{
	const _this = this;
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
	camera.matrixAutoUpdate = false;
	
	const texture_loader = new THREE.TextureLoader();
	const sky_tex = texture_loader.load("/textures/sky.png")
	const grass_tex = texture_loader.load("/textures/grassy.png")
	grass_tex.wrapS = THREE.RepeatWrapping
	grass_tex.wrapT = THREE.RepeatWrapping
	
	const axisObject = new THREE.AxesHelper(100);
	const pointLights = [{position: new THREE.Vector3(0, 0, 100), color: new THREE.Color(0xff00ff)}]
	const grid = new THREE.GridHelper(1000, 20, 0x999999, 0x999999);
	const grass = new Tile(-100,-100,100,-100,-100,100,100,100, new THREE.Vector3(), new THREE.Vector4(0,75,0,75), grass_tex);
	const sky = new SkySphere(new THREE.Vector3(0, 0, 0), sky_tex);
	const objs = [sky, grass];
	
	const scene = new THREE.Scene();
	scene.add(grid);
	scene.add(axisObject);
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

	function updateUniforms(modelMat, viewMat)
	{
		for (var i = 0; i < objs.length; i ++)
		{
			const positionTranslation = new THREE.Matrix4().makeTranslation(objs[i].position.x, objs[i].position.y, objs[i].position.z);
			const _modelMat = new THREE.Matrix4().multiplyMatrices(positionTranslation, modelMat);
			const modelViewMat = new THREE.Matrix4().multiplyMatrices(viewMat, _modelMat);
			const normalMat = new THREE.Matrix3().getNormalMatrix(modelViewMat);

			meshes[i].material.uniforms.viewMat.value = viewMat;
			meshes[i].material.uniforms.modelViewMat.value = modelViewMat;
			meshes[i].material.uniforms.normalMat.value = normalMat;
			meshes[i].material.uniforms.projectionMat.value = camera.projectionMatrix;
		}

		camera.matrixWorld.copy(viewMat).invert();
	}

	function render(modelMat, viewMat)
	{
		updateUniforms(modelMat, viewMat);
		webglRenderer.render(scene, camera);
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

export { StandardRenderer }