import * as THREE from "three"
import { loadOBJ } from "./objLoader"

var Model = function(shader, position, rotation, scale)
{
	this.position = position !== undefined ? position : new THREE.Vector3()
	this.rotation = rotation !== undefined ? rotation : new THREE.Vector3()
	this.scale = scale !== undefined ? new THREE.Vector3(scale,scale,scale) : new THREE.Vector3(1,1,1)
	this.shader = shader
	this.meshes = []

	this.loadMeshes = function(meshes, colorMap)
	{
		for (const obj of meshes) 
		{
			var material = this.shader !== undefined 
				? this.shader.getShaderMaterial(obj.material, obj.texture)
				: new THREE.MeshBasicMaterial({color:color})
			let mesh = new THREE.Mesh(obj.geometry, material);
			mesh.renderOrder = 1 - obj.material.d
			this.meshes.push(mesh)
		}
		return this
	}

	this.computeModelMatrix = function()
	{
		const T = new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, this.position.z);
		const Rx = new THREE.Matrix4().makeRotationX(this.rotation.x * THREE.Math.DEG2RAD);
		const Ry = new THREE.Matrix4().makeRotationY(this.rotation.y * THREE.Math.DEG2RAD);
		const Rz = new THREE.Matrix4().makeRotationZ(this.rotation.z * THREE.Math.DEG2RAD);
		const R = new THREE.Matrix4().premultiply(Ry).premultiply(Rx).premultiply(Rz);
		const S = new THREE.Matrix4().makeScale(this.scale.x, this.scale.y, this.scale.z);
		const modelMatrix = new THREE.Matrix4().premultiply(R).premultiply(T).premultiply(S);
		return modelMatrix;
	}

	this.updateUniforms = function(viewMatrix, projectionMatrix, cameraPos)
	{
		const modelMatrix = this.computeModelMatrix()
		const modelViewMatrix = new THREE.Matrix4().multiplyMatrices(viewMatrix, modelMatrix);
		const normalMatrix = new THREE.Matrix3().getNormalMatrix(modelViewMatrix);
		for (var i = 0; i < this.meshes.length; i++)
		{
			this.meshes[i].material.uniforms.modelViewMat.value = modelViewMatrix;
			this.meshes[i].material.uniforms.projectionMat.value = projectionMatrix;
			this.meshes[i].material.uniforms.normalMat.value = normalMatrix;
			this.meshes[i].material.uniforms.viewMat.value = viewMatrix;
			this.meshes[i].material.uniforms.cameraPos.value = cameraPos;
		}
	}

	this.loadOBJ = function(filename)
	{
		loadOBJ(filename, (meshes) => this.loadMeshes(meshes))
		return this
	}

	this.addRenderables = function(scene)
	{
		for (const mesh of this.meshes) 
		{
			scene.add(mesh)
		}
	}
}

export { Model }