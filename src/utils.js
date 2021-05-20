import * as THREE from 'three'

var SkySphere = function(position, texture)
{
	this.geometry = new THREE.SphereBufferGeometry(1000, 100, 100);
	this.position = position;
	this.material = {
		ambient: new THREE.Vector3(0.0, 0.0, 0.0),
		diffuse: new THREE.Vector3(0.0, 0.0, 0.0),
		specular: new THREE.Vector3(0.0, 0.0, 0.0),
		shininess: 1.0,
	};
	this.ambientLightColor = new THREE.Vector3(0.0, 0.0, 0.0);
	this.texture = texture
};

var Tile = function(xl1, yl1, xr1, yr1, xl2, yl2, xr2, yr2, color, tex=new THREE.Vector4(0,1,0,1))
{
	const vertices = new Float32Array([
		xl1, 0.0, -yl1,
		xl2, 0.0, -yl2,
		xr1, 0.0, -yr1,
		xr2, 0.0, -yr2,
	])
	const normals = new Float32Array([
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
	])
	const uvs = new Float32Array([
		tex.x, tex.z,
		tex.x, tex.w,
		tex.y, tex.z,
		tex.y, tex.w,
	])
	const indices = [
		1, 0, 2,
		1, 2, 3
	];
	this.geometry = new THREE.BufferGeometry();
	this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
	this.geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
	this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
	this.geometry.setIndex(indices);
	this.position = new THREE.Vector3();
	this.material = {
		ambient: color,
		diffuse: color,
		specular: new THREE.Vector3(0.0, 0.0, 0.0),
		shininess: 1.0,
	};
	this.ambientLightColor = new THREE.Vector3(1.0, 1.0, 1.0);
	this.texture = null

};

export { SkySphere, Tile }