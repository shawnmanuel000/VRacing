
precision mediump float;

struct Material
{
	vec3 Ka;
	vec3 Kd;
	vec3 Ks;
	float Ns;				
	float d;				
	int illum;				
};

struct PointLight {
	vec3 position;
	vec3 color;
};

uniform sampler2D map; 
uniform mat4 viewMat;
uniform Material material;
uniform PointLight pointLights[1];
uniform vec3 cameraPos;

varying vec3 vs_position;
varying vec2 vs_texcoord;
varying vec3 vs_normal;

vec3 calculateAmbient(Material material)
{
	float weight = 0.01;
	return vec3(weight*material.Ka.r, weight*material.Ka.g, weight*material.Ka.b);
}

vec3 calculateDiffuse(Material material, vec3 vs_position, vec3 vs_normal, PointLight light)
{
	vec3 posToLightDirVec = normalize(light.position - vs_position);
	float Kd = clamp(dot(posToLightDirVec, normalize(vs_normal)), 0.5, 1.0);
	vec3 diffuseFinal = material.Kd * Kd;
	return diffuseFinal;
}

vec3 calculateSpecular(Material material, vec3 vs_position, vec3 vs_normal, PointLight light, vec3 cameraPos)
{
	vec3 lightToPosDirVec = normalize(vs_position - light.position);
	vec3 reflectDirVec = normalize(reflect(lightToPosDirVec, normalize(vs_normal)));
	vec3 posToViewDirVec = normalize(cameraPos - vs_position);
	float specularConstant = pow(max(dot(posToViewDirVec, reflectDirVec), 0.0), material.Ns);
	vec3 specularFinal = material.Ks * specularConstant;
	return specularFinal;
}

void main()
{
	vec3 ambientFinal = calculateAmbient(material);
	vec3 diffuseFinal = calculateDiffuse(material, vs_position, vs_normal, pointLights[0]);
	vec3 specularFinal = calculateSpecular(material, vs_position, vs_normal, pointLights[0], cameraPos);
	vec4 tex = texture2D(map, vs_texcoord);
	gl_FragColor = tex + vec4(ambientFinal, 1.0) + vec4(diffuseFinal, 1.0) + vec4(specularFinal, 1.0);
	gl_FragColor.a = material.d;
}