import * as THREE from "three"

var Camera = function(position, yaw, fovy)
{
	this.position = position !== undefined ? position : new THREE.Vector3()
	this.yaw = yaw !== undefined ? yaw : 90
	this.pitch = 0
	this.roll = 0
	this.near = 0.1
	this.far = 10000
	this.fovy = fovy !== undefined ? fovy : 75
	this.aspect = window.innerWidth / window.innerHeight

	this.camera = new THREE.PerspectiveCamera(fovy !== undefined ? fovy : 75, this.aspect, this.near, this.far)
	// this.camera = new THREE.Camera()
	// this.camera.position.set(this.position.x, this.position.y, this.position.z)
	this.camera.matrixAutoUpdate = false;

	this.cursorPos = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);
	this.movement = new THREE.Vector3()

	this.computeViewMatrix = function()
	{
		var yaw = (this.yaw * THREE.Math.DEG2RAD) % 360
		var pitch = (this.pitch * THREE.Math.DEG2RAD) % 360
		var frontx = Math.cos(yaw) * Math.cos(pitch)
		var fronty = Math.sin(pitch)
		var frontz = Math.sin(yaw) * Math.cos(pitch)
		var front = new THREE.Vector3(frontx,fronty,frontz).normalize()
		var upVector = new THREE.Vector3(0, 1, 0);
		var right = new THREE.Vector3().crossVectors(upVector, front).normalize()
		var up = new THREE.Vector3().crossVectors(front, right).normalize()
		var rotationMat = new THREE.Matrix4().makeBasis(right, up, front).transpose();
		var translationMat = new THREE.Matrix4().makeTranslation(-this.position.x, -this.position.y, -this.position.z);
		return new THREE.Matrix4().multiply(rotationMat).multiply(translationMat);
	}

	this.computeProjectionMatrix = function(aspect)
	{
		var projectionMatrix = new THREE.Matrix4()
		var f = 1/Math.tan(this.fovy)
		projectionMatrix.elements[0] = f/aspect
		projectionMatrix.elements[1 + 4*1] = f
		projectionMatrix.elements[2 + 4*2] = -(this.far + this.near)/(this.far - this.near)
		projectionMatrix.elements[2 + 4*3] = -(2*this.far*this.near)/(this.far - this.near)
		projectionMatrix.elements[3 + 4*2] = -1
		projectionMatrix.elements[3 + 4*3] = 0
		return projectionMatrix
	}

	this.update = function()
	{
		this.viewMatrix = this.computeViewMatrix()
		this.projectionMatrix = this.computeProjectionMatrix(this.aspect)
		this.camera.matrixWorld.copy(this.viewMatrix).invert();
		this.world2Cam = new THREE.Matrix3().setFromMatrix4(this.viewMatrix).transpose()
		var directions =  new THREE.Vector3().add(this.movement).applyMatrix3(this.world2Cam)
		this.position.addScaledVector(directions, -1)
		this.camera.position.copy(this.position)
	}

	this.setPosition = function(pos, yaw, pitch)
	{
		this.position = new THREE.Vector3().add(pos)
		this.yaw = yaw
		this.pitch = pitch
		this.camera.position.copy(pos)
		this.camera.rotation.y = yaw
		this.camera.rotation.x = pitch
	}

	this.getHeading = function()
	{
		return this.yaw
	}

	this.getPosition = function()
	{
		return new THREE.Vector3(this.position.x, this.position.y, this.position.z)
	}

	this.getViewMatrix = function()
	{
		return this.viewMatrix.clone()
	}

	this.getProjectionMatrix = function()
	{
		return this.camera.projectionMatrix.clone()
		// return this.projectionMatrix.clone()
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
		this.cursorPos.set(e.pageX, e.pageY);
		this.pitch = Math.min(Math.max(this.pitch - offsetY * 0.1, -80.0), 80.0)
		this.yaw = (this.yaw + offsetX * 0.1) % 360.0
	}

	window.addEventListener("resize", () => this.onResize())
	this.onResize = function()
	{
		this.aspect = window.innerWidth / window.innerHeight
		this.camera.aspect = this.aspect
		this.camera.updateProjectionMatrix()
		this.projectionMatrix = this.computeProjectionMatrix(this.aspect)
	}
}

export { Camera }