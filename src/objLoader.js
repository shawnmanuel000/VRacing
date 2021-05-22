import * as THREE from 'three'
import { Material, getGeometry } from "./utils.js"

function tokenize(text)
{
	return text.split('\n').map(s => s.replace('\r','').split(' ')).filter(l => l.length>0)
}

function loadOBJ(filename, onLoaded)
{
	var obj_src = []
	var mtl_src = []
	var ready = false
	let baseindex = filename.lastIndexOf('/')
	let parentpath = filename.slice(0,baseindex+1)
	fetch(filename).then(res => res.text()).then(onLoad);
	function onLoad(text)
	{
		var result = tokenize(text)
		for (let i = 0; i < result.length; i++) {
			let fields = result[i]
			if (fields[0] === "mtllib") 
			{
				let mtlfile = fields[1]
				let fullpath = parentpath.concat(mtlfile)
				fetch(fullpath).then(res => res.text()).then(text => mtl_src = tokenize(text));
			}
			else if(fields[0] === "#<<") 
			{
				let nextfile = fields[1]
				let fullpath = parentpath.concat(nextfile)
				fetch(fullpath).then(res => res.text()).then(onLoad);
				return;
			}
			else if (fields.length > 0)
			{
				obj_src.push(fields)
			}
		}
		ready = true;
	}

	var check = function() 
	{
		if (ready !== true)
		{
			setTimeout(check, 1000)
			return
		}	
		const mtl_map = parsemtl(mtl_src)
		const meshes = parseOBJ(obj_src, mtl_map)
		onLoaded(meshes)
	}
	check()
}

function parsemtl(src)
{
	const mtl_map = new Map()
	let curr_name = ""
	for (let i = 0; i < src.length; i++) 
	{
		let fields = src[i];
		let prefix = fields[0]
		if (prefix == "newmtl")
		{
			curr_name = fields.slice(1).join(' ');
			mtl_map.set(curr_name, new Material(curr_name));
		}
		if (prefix == "Ka" || prefix == "Kd" || prefix == "Ks")
		{
			let vals = fields.slice(1).map(parseFloat)
			let temp_vec3 = new THREE.Vector3(vals[0], vals[1], vals[2])
			if (prefix == "Ka") { mtl_map.get(curr_name).Ka = temp_vec3; }
			if (prefix == "Kd") { mtl_map.get(curr_name).Kd = temp_vec3; }
			if (prefix == "Ks") { mtl_map.get(curr_name).Ks = temp_vec3; }
		}
		if (prefix == "Ns" || prefix == "d")
		{
			let temp_float = parseFloat(fields[1])
			if (prefix == "Ns") { mtl_map.get(curr_name).Ns = temp_float; }
			if (prefix == "d") { mtl_map.get(curr_name).d = temp_float; }
		}
		if (prefix == "illum")
		{
			let temp_int = parseInt(fields[1])
			mtl_map.get(curr_name).illum = temp_int;
		}
	}
	return mtl_map
}

function parseOBJ(src, mtl_map)
{
	const vertexPositions = []
	const vertexNormals = []
	const vertexUVs = []
	const vertexMTLs = []

	const positionIndices = []
	const normalIndices = []
	const uvIndices = []

	let curr_obj = ""
	let curr_mtl = "default"
	const obj_names = new Set([curr_obj])
	const mtl_names = new Set([curr_mtl])
	const obj_map = new Map()
	const obj_index_map = new Map()
	if(!mtl_map.has(curr_mtl)) mtl_map.set(curr_mtl, new Material(curr_mtl, new THREE.Vector3(0.1,0.1,0.1)))
	for (let i = 0; i < src.length; i++) 
	{
		let fields = src[i];
		let prefix = fields[0]
		if (prefix == "o")
		{
			curr_obj = fields.slice(1).join(' ');
			obj_names.add(curr_obj);
		}
		else if (prefix == "usemtl")
		{
			curr_mtl = fields.slice(1).join(' ');
			mtl_names.add(curr_mtl);
		}
		else if (prefix == "v")
		{
			let vals = fields.slice(1).filter(x => x!=="").map(parseFloat)
			let temp_vec3 = new THREE.Vector3(vals[0], vals[1], vals[2])
			vertexPositions.push(temp_vec3);
		}
		else if (prefix == "vn")
		{
			let vals = fields.slice(1).filter(x => x!=="").map(parseFloat)
			let temp_vec3 = new THREE.Vector3(vals[0], vals[1], vals[2])
			vertexNormals.push(temp_vec3);
		}
		else if (prefix == "vt")
		{
			let vals = fields.slice(1).filter(x => x!=="").map(parseFloat)
			let temp_vec2 = new THREE.Vector2(vals[0], vals[1])
			vertexUVs.push(temp_vec2);
		}
		else if (prefix == "f")
		{			
			let vcount = 0;
			let last = positionIndices.length;
			for (const field of fields.slice(1)) 
			{
				const types = field.split('/')
				for (let itype = 0; itype < types.length; itype++) 
				{
					let temp_glint = parseInt(types[itype])
					if (itype == 0)
					{
						vertexMTLs.push(curr_mtl);
						positionIndices.push(temp_glint);
						if (!obj_index_map.has(curr_obj)) { obj_index_map.set(curr_obj, new Map()); }
						if (!obj_index_map.get(curr_obj).has(curr_mtl)) { obj_index_map.get(curr_obj).set(curr_mtl, []); }
						obj_index_map.get(curr_obj).get(curr_mtl).push(positionIndices.length-1);
					}
					else if (itype == 1)
					{
						uvIndices.push(temp_glint);
					}
					else if (itype == 2)
					{
						normalIndices.push(temp_glint);
					}
				}
				vcount++;
			}
			if (positionIndices.length-last > 3)
			{
				obj_index_map.get(curr_obj).get(curr_mtl).push(last);
				obj_index_map.get(curr_obj).get(curr_mtl).push(last+2);
			}
		}
	}

	const meshes = []
	for (const obj_name of obj_names) 
	{
		if (!obj_index_map.has(obj_name)) continue;
		const curr_obj_map = obj_index_map.get(obj_name)
		for (const mtl_name of mtl_names) 
		{
			if (!curr_obj_map.has(mtl_name))	continue;
			const size = curr_obj_map.get(mtl_name).length
			const positions = new Float32Array(size*3)
			const normals = new Float32Array(size*3)
			const uvs = new Float32Array(size*2)
			for (let i = 0; i < size; i++) 
			{
				let index = curr_obj_map.get(mtl_name)[i];
				let position = vertexPositions[positionIndices[index]-1]
				let normal = vertexNormals[normalIndices[index]-1]
				let uv = vertexUVs[uvIndices[index]-1]
				positions[3*i+0] = position.x
				positions[3*i+1] = position.y
				positions[3*i+2] = position.z
				normals[3*i+0] = normal.x
				normals[3*i+1] = normal.y
				normals[3*i+2] = normal.z
				uvs[2*i+0] = uv.x
				uvs[2*i+1] = uv.y
			}
			const geometry = getGeometry(positions, normals, uvs)
			const material = mtl_map.get(mtl_name)
			meshes.push({geometry, material})
		}
	}
	return meshes
}

export { loadOBJ }