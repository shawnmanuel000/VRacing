import * as THREE from 'three'


var StateController = function (dispParams)
{
	var _this = this;

	this.state = 
	{
		camMovement: new THREE.Vector3(),
		modelTranslation: new THREE.Vector3(10,0,0),
		modelRotation: new THREE.Vector2(),
		viewerPosition: new THREE.Vector3(0, 0, dispParams.distanceScreenViewer),
		viewerTarget: new THREE.Vector3(),
		yaw: 90,
		pitch: 0.0
	};

	var previousPosition = new THREE.Vector2(dispParams.canvasWidth/2, dispParams.canvasHeight/2);	// A variable to store the mouse position on the previous frame.

	document.addEventListener("keydown", onKeyDown);
	function onKeyDown(event)
	{
		if ( event.which === 87 ) { _this.state.camMovement.z = 3; }
		if ( event.which === 83 ) { _this.state.camMovement.z = -3; }
		if ( event.which === 65 ) { _this.state.camMovement.x = 3; }
		if ( event.which === 68 ) { _this.state.camMovement.x = -3; }
		if ( event.which === 67 ) { _this.state.camMovement.y = 3; }
		if ( event.which === 32 ) { _this.state.camMovement.y = -3; }
	}

	document.addEventListener("keyup", onKeyUp);
	function onKeyUp(event)
	{
		if ( event.which === 87 ) { _this.state.camMovement.z = 0; }
		if ( event.which === 83 ) { _this.state.camMovement.z = 0; }
		if ( event.which === 65 ) { _this.state.camMovement.x = 0; }
		if ( event.which === 68 ) { _this.state.camMovement.x = 0; }
		if ( event.which === 67 ) { _this.state.camMovement.y = 0; }
		if ( event.which === 32 ) { _this.state.camMovement.y = 0; }
	}

	document.addEventListener("mousemove", onMove);
	function onMove(e, x, y)
	{
		var x = e.pageX
		var y = e.pageY
		var movement = new THREE.Vector2(x - previousPosition.x, previousPosition.y - y);
		previousPosition.set(x, y);
		_this.state.yaw += movement.x * 0.1
		_this.state.pitch -= movement.y * 0.1
	}

	this.onMove = onMove;
};

export { StateController }