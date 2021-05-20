/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Vertex position in view cooridnate

uniform mat4 modelViewMat;
uniform mat4 projectionMat;
uniform mat3 normalMat;

attribute vec3 position;
attribute vec3 normal;

void main(){

	normalCam = normalMat * normal;
	fragPosCam = vec3(modelViewMat * vec4(position, 1.0));
	gl_Position = projectionMat * modelViewMat * vec4(position, 1.0);

}