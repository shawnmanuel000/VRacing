
uniform mat4 modelViewMat;
uniform mat4 projectionMat;
uniform mat3 normalMat;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vs_position;
varying vec2 vs_texcoord;
varying vec3 vs_normal;

void main()
{
	vs_position = vec3(modelViewMat * vec4(position, 1.0));
	vs_normal = normalize(normalMat * normal);
	vs_texcoord = uv;
	gl_Position = projectionMat * modelViewMat * vec4(position, 1.0);

}