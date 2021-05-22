import * as THREE from "three"

var Model = function(meshes, position, rotation, scale, color_map)
{
	this.position = position !== undefined ? position : new THREE.Vector3()
	this.rotation = rotation !== undefined ? rotation : new THREE.Vector3()
	this.scale = scale !== undefined ? new THREE.Vector3(scale) : new THREE.Vector3()
	this.meshes = []
	// for (const mesh of meshes) 
	// {
	// 	this.meshes.push()
	// }
}