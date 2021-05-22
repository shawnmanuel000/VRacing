import * as THREE from "three"

var Texture = function(filepath, wrapping, repeats)
{
	const texture_loader = new THREE.TextureLoader();
	this.texture = texture_loader.load(filepath)
	this.texture.wrapS = wrapping !== undefined ? wrapping : THREE.RepeatWrapping
	this.texture.wrapT = wrapping !== undefined ? wrapping : THREE.RepeatWrapping
}

export { Texture }
