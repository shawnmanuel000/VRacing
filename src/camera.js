import * as THREE from "three"

var Camera = function(position, yaw, fov)
{
	this.position = position !== undefined ? position : new THREE.Vector3()
	this.yaw = yaw !== undefined ? yaw : 90
	this.pitch = 0
	this.roll = 0
	this.near = 0.1
	this.far = 10000
	this.aspect = window.innerWidth / window.innerHeight

	this.camera = new THREE.PerspectiveCamera(fov !== undefined ? fov : 75, this.aspect, this.near, this.far)
	this.camera.position.set(this.position.x, this.position.y, this.position.z)
	this.camera.matrixAutoUpdate = false;
	this.projectionMatrix = this.camera.projectionMatrix

	this.cursorPos = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);
	this.movement = new THREE.Vector3()

	this.computeViewMatrix = function()
	{
		var yaw = this.yaw * THREE.Math.DEG2RAD
		var pitch = this.pitch * THREE.Math.DEG2RAD
		var frontx = Math.cos(yaw) * Math.cos(pitch)
		var fronty = Math.sin(pitch)
		var frontz = Math.sin(yaw) * Math.cos(pitch)
		var front = new THREE.Vector3(frontx,fronty,frontz).normalize()
		var upVector = new THREE.Vector3(0, 1, 0);
		var right = new THREE.Vector3().crossVectors(upVector, front).normalize()
		var up = new THREE.Vector3().crossVectors(front, right).normalize()
		var rotationMat = new THREE.Matrix4().makeBasis(right, up, front).transpose();
		// var world2Cam = new THREE.Matrix3().setFromMatrix4(rotationMat).transpose()
		// var movement = new THREE.Vector3().add(this.movement)
		// var directions =  this.movement.applyMatrix3(world2Cam)
		// position.addScaledVector(directions, -1)
		var translationMat = new THREE.Matrix4().makeTranslation(-position.x, -position.y, -position.z);
		return new THREE.Matrix4().premultiply(translationMat).premultiply(rotationMat);
	}

	this.update = function()
	{
		this.viewMatrix = this.computeViewMatrix()
		this.camera.matrixWorld.copy(this.viewMatrix).invert();
		var world2Cam = new THREE.Matrix3().setFromMatrix4(this.viewMatrix).transpose()
		var directions =  new THREE.Vector3().add(this.movement).applyMatrix3(world2Cam)
		this.position.addScaledVector(directions, -1)
	}

	document.addEventListener("keydown", (e) => this.onKeyDown(e));
	this.onKeyDown = function(event)
	{
		if ( event.which === 87 ) { this.movement.z = 3; }
		if ( event.which === 83 ) { this.movement.z = -3; }
		if ( event.which === 65 ) { this.movement.x = 3; }
		if ( event.which === 68 ) { this.movement.x = -3; }
		if ( event.which === 67 ) { this.movement.y = 3; }
		if ( event.which === 32 ) { this.movement.y = -3; }
	}

	document.addEventListener("keyup", (e) => this.onKeyUp(e));
	this.onKeyUp = function(event)
	{
		if ( event.which === 87 ) { this.movement.z = 0; }
		if ( event.which === 83 ) { this.movement.z = 0; }
		if ( event.which === 65 ) { this.movement.x = 0; }
		if ( event.which === 68 ) { this.movement.x = 0; }
		if ( event.which === 67 ) { this.movement.y = 0; }
		if ( event.which === 32 ) { this.movement.y = 0; }
	}

	document.addEventListener("mousemove", (e) => this.onMove(e));
	this.onMove = function(e)
	{
		var offsetX = e.pageX - this.cursorPos.x
		var offsetY = this.cursorPos.y - e.pageY
		// var movement = new THREE.Vector2(e.pageX - this.cursorPos.x, this.cursorPos.y - e.pageY);
		this.cursorPos.set(e.pageX, e.pageY);
		this.pitch = Math.min(Math.max(this.pitch - offsetY * 0.1, -80.0), 80.0)
		this.yaw = (this.yaw + offsetX * 0.1) % 360.0
		// this.pitch -= movement.y * 0.1
		// this.yaw += movement.x * 0.1
	}

	window.addEventListener("resize", () => this.onResize())
	this.onResize = function()
	{
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.projectionMatrix = this.camera.projectionMatrix
	}
}

export { Camera }