import * as THREE from 'three'
import { Vector2, Vector3 } from 'three';

var SkySphere = function(position, texture, scale)
{
	this.geometry = new THREE.SphereBufferGeometry(scale, 100, 100);
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

var Tile = function(xl1, yl1, xr1, yr1, xl2, yl2, xr2, yr2, z, color, tex=new THREE.Vector4(0,1,0,1), texture=null)
{
	const vertices = new Float32Array([
		xl1, z, -yl1,
		xl2, z, -yl2,
		xr1, z, -yr1,
		xr2, z, -yr2,
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
		diffuse: new Vector3(),
		specular: new THREE.Vector3(0.0, 0.0, 0.0),
		shininess: 1.0,
	};
	this.ambientLightColor = new THREE.Vector3(1.0, 1.0, 1.0);
	this.texture = texture

};

var TrackPlane = function(boundaries, color=new THREE.Vector3(), texture=null)
{
	const shape = boundaries.shape
	const indices = []
	const vertices = []
	const normals = []
	const uvs = []
	let acc_len = 0
	let numvertices = 0
	for (let j = 0; j < shape[0]; j++) {
		let k = (j+1)%shape[0]
		let xl1 = boundaries.get(j,0,0);
		let yl1 = boundaries.get(j,0,1);
		let xr1 = boundaries.get(j,1,0);
		let yr1 = boundaries.get(j,1,1);
		let xl2 = boundaries.get(k,0,0);
		let yl2 = boundaries.get(k,0,1);
		let xr2 = boundaries.get(k,1,0);
		let yr2 = boundaries.get(k,1,1);
		let tex = new THREE.Vector4(0,1,0,1)
		if(texture !== null)
		{
			let blen = Math.sqrt(Math.pow(xr1-xl1,2) + Math.pow(yr1-yl1,2));
			let tlen = Math.sqrt(Math.pow(xr2-xl2,2) + Math.pow(yr2-yl2,2));
			let llen = Math.sqrt(Math.pow(xl2-xl1,2) + Math.pow(yl2-yl1,2));
			let rlen = Math.sqrt(Math.pow(xr2-xr1,2) + Math.pow(yr2-yr1,2));
			let aspect = texture.image !== undefined ? texture.image.width / texture.image.height : 1;
			let len = 0.5*aspect * (llen + rlen) / (blen + tlen);
			tex = new THREE.Vector4(0,1,acc_len,acc_len+len)
			acc_len += len
		}
		var segment = new Tile(xl1, yl1, xr1, yr1, xl2, yl2, xr2, yr2, 0, color, tex);
		segment.geometry.index.array.forEach(i => {indices.push(i+numvertices)});
		segment.geometry.attributes.position.array.forEach(v => {vertices.push(v)});
		segment.geometry.attributes.normal.array.forEach(n => {normals.push(n)});
		segment.geometry.attributes.uv.array.forEach(u => {uvs.push(u)});
		numvertices += segment.geometry.attributes.position.count
	}
	this.geometry = new THREE.BufferGeometry();
	this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
	this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
	this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
	this.geometry.setIndex(indices);
	this.position = new THREE.Vector3();
	this.material = {
		ambient: color,
		diffuse: new Vector3(),
		specular: new THREE.Vector3(0.0, 0.0, 0.0),
		shininess: 1.0,
	};
	this.ambientLightColor = new THREE.Vector3(1.0, 1.0, 1.0);
	this.texture = texture
}

export { SkySphere, Tile, TrackPlane }