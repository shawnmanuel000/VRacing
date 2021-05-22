import * as THREE from "three"
import vertexShader from "./assets/shaders/vert.glsl"
import fragmentShader from "./assets/shaders/frag.glsl"

var Shader = function()
{
	this.vertexShader = vertexShader
	this.fragmentShader = fragmentShader

	this.getShaderMaterial = function(material, texture)
	{
		var material = new THREE.RawShaderMaterial({
			uniforms: {
				viewMat: { value: new THREE.Matrix4() },
				projectionMat: { value: new THREE.Matrix4() },
				modelViewMat: { value: new THREE.Matrix4() },
				normalMat: { value: new THREE.Matrix3() },
				cameraPos: { value: new THREE.Vector3() },
				pointLights: { value: [] },
				material: { value: material },
				map: { value: texture },
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			transparent: true,
			side: THREE.DoubleSide,
		});
		return material;
	}
}

export { Shader }