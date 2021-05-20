import * as THREE from 'three'

var StateController = function ()
{
	var _this = this;

	this.state = 
	{
		camMovement: new THREE.Vector3(),
		modelTranslation: new THREE.Vector3(0,0,0),
		modelRotation: new THREE.Vector2(),
		camPosition: new THREE.Vector3(0, 10, 10),
		yaw: 90,
		pitch: 0.0
	};

	var previousPosition = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);	// A variable to store the mouse position on the previous frame.

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
	function onMove(e)
	{
		var movement = new THREE.Vector2(e.pageX - previousPosition.x, previousPosition.y - e.pageY);
		previousPosition.set(e.pageX, e.pageY);
		_this.state.yaw += movement.x * 0.1
		_this.state.pitch -= movement.y * 0.1
	}
};

export { StateController }