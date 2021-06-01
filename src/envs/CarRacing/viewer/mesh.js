import * as THREE from "three"
import { Material } from "./material.js"

var Mesh = function(geometry, material, texture)
{
	this.geometry = geometry
	this.material = material
	this.texture = texture
}

function getGeometry(positions, normals, uvs, indices=null)
{
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
	if (indices !== null) geometry.setIndex(indices);
	return geometry
}

var SkySphere = function(texture, scale)
{
	this.geometry = new THREE.SphereBufferGeometry(scale, 100, 100);
	this.material = new Material()
	this.texture = texture
}

var Quad = function(xll, yll, xtr, ytr, z, color, texture, uv)
{
	return new Tile(xll, yll, xtr, yll, xll, ytr, xtr, ytr, z, color, texture, uv)
}

var Tile = function(xl1, yl1, xr1, yr1, xl2, yl2, xr2, yr2, z, color, texture, uv)
{
	if (uv === undefined) uv = new THREE.Vector4(0,1,0,1)
	const positions = new Float32Array([
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
		uv.x, uv.z,
		uv.x, uv.w,
		uv.y, uv.z,
		uv.y, uv.w,
	])
	const indices = [
		1, 0, 2,
		1, 2, 3
	];
	this.geometry = getGeometry(positions, normals, uvs, indices)
	this.material = new Material("Tile", color.clone().multiplyScalar(100))
	this.texture = texture
}

var TrackPlane = function(boundaries, color, texture, uv)
{
	var xll = boundaries.slice(null, null, [0,1]).min()
	var yll = boundaries.slice(null, null, [1,2]).min()
	var xtr = boundaries.slice(null, null, [0,1]).max()
	var ytr = boundaries.slice(null, null, [1,2]).max()
	const area = (xtr-xll)*(ytr-yll);
	const x0 = 0.5*(xll + xtr);
	const y0 = 0.5*(yll + ytr);
	const scale = 1.2 * Math.sqrt(1.4e6 / area);
	xll = (xll - x0) * scale + x0;
	yll = (yll - y0) * scale + y0;
	xtr = (xtr - x0) * scale + x0;
	ytr = (ytr - y0) * scale + y0;
	return new Quad(xll, yll, xtr, ytr, -1, color, texture, uv)
}

var TrackRoad = function(boundaries, color, texture)
{
	const shape = boundaries.shape
	const indices = []
	const positions = []
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
		if(texture !== undefined)
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
		var segment = new Tile(xl1, yl1, xr1, yr1, xl2, yl2, xr2, yr2, 0, color, texture, tex);
		segment.geometry.index.array.forEach(i => {indices.push(i+numvertices)});
		segment.geometry.attributes.position.array.forEach(v => {positions.push(v)});
		segment.geometry.attributes.normal.array.forEach(n => {normals.push(n)});
		segment.geometry.attributes.uv.array.forEach(u => {uvs.push(u)});
		numvertices += segment.geometry.attributes.position.count
	}
	this.geometry = getGeometry(positions, normals, uvs, indices)
	this.material = new Material("TrackRoad", color.clone().multiplyScalar(100))
	this.texture = texture
}

export { SkySphere, Tile, TrackRoad, Material, getGeometry, Mesh, Quad, TrackPlane }