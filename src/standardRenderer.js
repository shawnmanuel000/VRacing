import * as THREE from 'three'

var StandardRenderer = function (webglRenderer, teapots, dispParams)
{
	var _this = this;
	const camera = new THREE.PerspectiveCamera(75, dispParams.canvasWidth / dispParams.canvasHeight, 0.1, 10000)
	// var camera = new THREE.Camera();
	camera.matrixAutoUpdate = false;
	var scene = new THREE.Scene();
	var numPointLights = 1;

	var axisObject = new THREE.AxesHelper(100);
	axisObject.position.set(0, 0, 0);
	scene.add(axisObject);

	var grid = new THREE.GridHelper(1000, 30, "white", "white");
	grid.position.set(0, -50, 0);
	scene.add(grid);

	scene.background = new THREE.Color("gray");

	var meshes = [];
	for (var i = 0; i < teapots.length; i ++)
	{
		var material = new THREE.RawShaderMaterial({
			uniforms: {
				viewMat: { value: new THREE.Matrix4()},
				projectionMat: { value: new THREE.Matrix4()},
				modelViewMat: { value: new THREE.Matrix4()},
				normalMat: { value: new THREE.Matrix3()},
				material: { value: {
					ambient: new THREE.Vector3(0.3, 0.3, 0.3),
					diffuse: new THREE.Vector3(1.0, 1.0, 1.0),
					specular: new THREE.Vector3(1.0, 1.0, 1.0),
					shininess: 120.0,
				}, },
				pointLights: { value: [{
					position: new THREE.Vector3(0, 20, 30),
					color: new THREE.Color(0xff00ff),
				}], properties: { position: new THREE.Vector3(), color: new THREE.Color() } },
				ambientLightColor: { value: new THREE.Vector3(0.6, 0.4, 0.8)},
				attenuation: { value: new THREE.Vector3(2.0, 0.0, 0.001)},
			},
			vertexShader: teapots[i].vertexShader,
			fragmentShader: teapots[i].fragmentShader,
			side: THREE.DoubleSide,
			shadowSide: THREE.DoubleSide,
		});

		var mesh = new THREE.Mesh(teapots[i].geometry, material);
		meshes.push(mesh);
		scene.add(mesh);
	}

	function updateUniforms(state, modelMat, viewMat, projectionMat)
	{
		for (var i = 0; i < teapots.length; i ++)
		{
			var positionTranslation = new THREE.Matrix4().makeTranslation(teapots[i].position.x, teapots[i].position.y, teapots[i].position.z);
			var _modelMat = new THREE.Matrix4().multiplyMatrices(positionTranslation, modelMat);
			var modelViewMat = new THREE.Matrix4().multiplyMatrices(viewMat, _modelMat);
			var normalMat = new THREE.Matrix3().getNormalMatrix(modelViewMat);

			meshes[i].material.uniforms.viewMat.value = viewMat;
			meshes[i].material.uniforms.modelViewMat.value = modelViewMat;
			meshes[i].material.uniforms.normalMat.value = normalMat;
			meshes[i].material.uniforms.projectionMat.value = camera.projectionMatrix;
		}

		camera.matrixWorld.copy(viewMat).invert();
	}

	function render(state, modelMat, viewMat, projectionMat)
	{
		updateUniforms(state, modelMat, viewMat, projectionMat);
		webglRenderer.render(scene, camera);
	}

	window.addEventListener("resize", function ()
	{
		webglRenderer.setSize(dispParams.canvasWidth, dispParams.canvasHeight);
	});

	this.updateUniforms = updateUniforms;
	this.render = render;
};

export { StandardRenderer }