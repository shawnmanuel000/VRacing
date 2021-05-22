import * as THREE from 'three'

var Material = function(name="default", Ka, Kd, Ks, Ns, d, illum)
{
	this.name = name
	this.Ka = Ka !== undefined ? Ka : new THREE.Vector3()
	this.Kd = Kd !== undefined ? Kd : new THREE.Vector3()
	this.Ks = Ks !== undefined ? Ks : new THREE.Vector3()
	this.Ns = Ns !== undefined ? Ns : 30.0
	this.d = d !== undefined ? d : 1.0
	this.illum = illum !== undefined ? illum :  1

	this.mapColor = function(colorMap)
	{
		if (colorMap === undefined || colorMap === null) colorMap = new THREE.Vector3(0,1,2)
		const newKd = new THREE.Vector3(this.Kd[colorMap.x], this.Kd[colorMap.y], this.Kd[colorMap.z])
		return new Material(this.name.concat("_copy"), this.Ka, newKd, this.Ks, this.Ns, this.d, this.illum)
	}
}

export { Material }