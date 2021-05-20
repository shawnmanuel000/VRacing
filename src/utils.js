import * as THREE from 'three'

var DisplayParameters = function (distSceenViewer, screenDiagonal)
{
	var _this = this;	// Alias for accessing this from a closure
	this.canvasHeight = window.innerHeight;	// Vertical resolution of the current window in [pixel]
	this.canvasWidth = window.innerWidth;	// Horizontal resolution of the current window in [pixel]
	this.distanceScreenViewer = distSceenViewer; // Distance between the viewer and the monitor in [mm]
	this.pixelPitch = computePixelPitch();	// Pixel pitch of the monitor in [mm]

	/* Functions */
	function computePixelPitch()
	{
		var in_to_mm = 25.4; // Conversion factor from inch to mm
		var screenResolutionHeight = screen.height;
		var screenResolutionWidth = screen.width;
		var aspectRatio = screenResolutionWidth / screenResolutionHeight;
		var W = (screenDiagonal * in_to_mm)/Math.sqrt(1.0 + Math.pow(1 / aspectRatio, 2.0));	// Compute width of monitor (mm)
		return W / screenResolutionWidth;
	}

	window.addEventListener("resize", function ()
	{
		_this.canvasHeight = window.innerHeight;
		_this.canvasWidth = window.innerWidth;
	});

	this.computePixelPitch = computePixelPitch;
};

var Teapot = function (position, vShader, fShader)
{
	this.geometry = new THREE.SphereBufferGeometry(10, 15, 15);
	this.position = position;
	this.vertexShader = vShader;
	this.fragmentShader = fShader;
};

export { DisplayParameters, Teapot }