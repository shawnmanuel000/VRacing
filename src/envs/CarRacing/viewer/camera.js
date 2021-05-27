import * as THREE from "three"

var Camera = function(position, yaw, fovy)
{
	this.position = position !== undefined ? position : new THREE.Vector3()
	this.yaw = yaw !== undefined ? yaw : 90
	this.ryaw = 0
	this.pitch = 0
	this.rpitch = 0
	this.roll = 0
	this.near = 0.1
	this.far = 10000
	this.fovy = fovy !== undefined ? fovy : 75
	this.aspect = window.innerWidth / window.innerHeight
	this.follow = true

	this.camera = new THREE.PerspectiveCamera(fovy !== undefined ? fovy : 75, this.aspect, this.near, this.far)
	// this.camera = new THREE.Camera()
	this.camera.position.set(this.position.x, this.position.y, this.position.z)
	this.camera.matrixAutoUpdate = false;

	this.cursorPos = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);
	this.movement = new THREE.Vector3()

	this.computeViewMatrix = function()
	{
		var yaw = ((this.yaw+this.ryaw) * THREE.Math.DEG2RAD) % 360
		var pitch = ((this.pitch+this.rpitch) * THREE.Math.DEG2RAD) % 360
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
		if (!this.follow)
		{
			this.position.addScaledVector(directions, -1)
			this.camera.position.copy(this.position)
		}
	}

	this.setPosition = function(pos, yaw, pitch)
	{
		this.position = new THREE.Vector3().add(pos)
		this.yaw = yaw
		this.pitch = pitch
		// this.camera.position.copy(pos)
		// this.camera.rotation.y = yaw
		// this.camera.rotation.x = pitch
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
		if ( event.which === 70 ) { this.follow = true; }
		if ( event.which === 71 ) { this.follow = false; }
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

	document.addEventListener("keypress", (e) => this.onKeyPress(e));
	this.onKeyPress = function(event)
	{
		if ( event.which === 70 ) { this.follow = true; }
		if ( event.which === 71 ) { this.follow = false; }
	}

	document.addEventListener("mousemove", (e) => this.onMove(e));
	this.onMove = function(e)
	{
		var offsetX = e.pageX - this.cursorPos.x
		var offsetY = this.cursorPos.y - e.pageY
		this.cursorPos.set(e.pageX, e.pageY);
		this.rpitch = Math.min(Math.max(this.rpitch - offsetY * 0.1, -20.0), 20.0)
		this.ryaw = (this.ryaw + offsetX * 0.1) % 360.0
	}

	document.addEventListener("mouseleave", (e) => this.onMouseleave(e));
	this.onMouseleave = function(e)
	{
		this.rpitch = 0
		this.ryaw = 0
	}

	document.addEventListener("mouseenter", (e) => this.onMouseenter(e));
	this.onMouseenter = function(e)
	{
		var offsetX = (e.pageX) - window.innerWidth/2
		var offsetY = window.innerHeight/2 - (e.pageY)
		this.cursorPos.set(e.pageX, e.pageY);
		this.rpitch = Math.min(Math.max(- offsetY * 0.1, -20.0), 20.0)
		this.ryaw = ((offsetX * 0.1 + 180) % 360.0) - 180
	}

	window.addEventListener("resize", () => this.onResize())
	this.onResize = function()
	{
		this.aspect = window.innerWidth / window.innerHeight
		this.camera.aspect = this.aspect
		this.camera.updateProjectionMatrix()
		this.projectionMatrix = this.computeProjectionMatrix(this.aspect)
	}

	var socket = null;
	this.imuQuaternion = new THREE.Quaternion()

	this.initWebSocket = function() 
	{
		if ( socket && socket.readyState == 1 ) { return; }
		console.log( 'connecting' );
		socket = new WebSocket( "ws://localhost:8081" );
		socket.onopen = function () 
		{
			var openMsg = "WebSocket is opened.";
			socket.send( openMsg );
			console.log( openMsg );
			// this.state.connectionMsg = "Connected!";
		};

		socket.onclose = function () 
		{
			var closeMsg = "WebSocket is closed.";
			socket.send( closeMsg );
			console.log( closeMsg );
			// _this.state.connectionMsg = "Lost...";
			socket = null;
			setTimeout( initWebSocket, 1000 );
		};

		socket.onmessage = function ( imu ) 
		{
			var data = imu.data.replace( /"/g, "" ).split( " " );
			if ( data[ 0 ] == "QC" ) 
			{
				// data: QC q[0] q[1] q[2] q[3]
				this.imuQuaternion.set(Number(data[2]), Number(data[3]), Number(data[4]), Number(data[1])).normalize();
			}

		};
	}
	this.initWebSocket();

}

export { Camera }