
uniform mat4 modelViewMat;
uniform mat4 projectionMat;
uniform mat3 normalMat;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Vertex position in view cooridnate
varying vec2 vert_uv; // Vertex position in view cooridnate

void main()
{
	vert_uv = uv;
	normalCam = normalMat * normal;
	fragPosCam = vec3(modelViewMat * vec4(position, 1.0));
	gl_Position = projectionMat * modelViewMat * vec4(position, 1.0);

}