import * as THREE from 'three'

var MVPmat = function(dispParams)
{
	var _this = this;
	this.modelMat = new THREE.Matrix4();
	this.viewMat = new THREE.Matrix4();
	this.projectionMat = new THREE.Matrix4();
	this.position = new THREE.Vector3(0,0,dispParams.distanceScreenViewer);

	function computeModelTransform(state)
	{
		var modelTranslation = state.modelTranslation;
		var modelRotation = state.modelRotation;
		var translationMat = new THREE.Matrix4().makeTranslation(modelTranslation.x, modelTranslation.y, modelTranslation.z);
		var rotationMatX = new THREE.Matrix4().makeRotationX(modelRotation.x * THREE.Math.DEG2RAD);
		var rotationMatY = new THREE.Matrix4().makeRotationY(modelRotation.y * THREE.Math.DEG2RAD);
		var modelMatrix = new THREE.Matrix4().premultiply(rotationMatY).premultiply(rotationMatX).premultiply(translationMat);
		return modelMatrix;
	}

	function computeViewTransform(state)
	{
		var yaw = state.yaw * THREE.Math.DEG2RAD
		var pitch = state.pitch * THREE.Math.DEG2RAD
		var frontx = Math.cos(yaw) * Math.cos(pitch)
		var fronty = Math.sin(pitch)
		var frontz = Math.sin(yaw) * Math.cos(pitch)
		var front = new THREE.Vector3(frontx,fronty,frontz).normalize()
		var upVector = new THREE.Vector3(0, 1, 0);
		var right = new THREE.Vector3().crossVectors(upVector, front).normalize()
		var up = new THREE.Vector3().crossVectors(front, right).normalize()
		var rotationMat = new THREE.Matrix4().makeBasis(right, up, front).transpose();
		var world2Cam = new THREE.Matrix3().setFromMatrix4(rotationMat).transpose()
		var movement = new THREE.Vector3().add(state.camMovement)
		var directions =  movement.applyMatrix3(world2Cam)
		_this.position.addScaledVector(directions, -1)
		var translationMat = new THREE.Matrix4().makeTranslation(-_this.position.x, -_this.position.y, -_this.position.z);
		return new THREE.Matrix4().premultiply(translationMat).premultiply(rotationMat);
	}

	function update(state)
	{
		this.modelMat.copy(computeModelTransform(state));
		this.viewMat.copy(computeViewTransform(state));
	};

	this.computeModelTransform = computeModelTransform;
	this.computeViewTransform = computeViewTransform;
	this.update = update;
};

export { MVPmat }