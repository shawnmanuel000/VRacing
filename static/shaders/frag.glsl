
precision mediump float;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

struct PointLight {
	vec3 position;
	vec3 color;
};

uniform mat4 viewMat;
uniform vec3 attenuation;
uniform vec3 ambientLightColor;
uniform Material material;
uniform PointLight pointLights[1];

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

vec3 calculateDiffuse(Material material, vec3 vs_position, vec3 vs_normal, PointLight light)
{
	vec3 vs_lightpos = vec3(viewMat * vec4(light.position, 1.0));
	vec3 posToLightDir = normalize(vs_lightpos - vs_position);
	float Kd = clamp(dot(posToLightDir, normalize(vs_normal)), 0.0, 1.0);
	vec3 diffuseFinal = (material.diffuse * light.color)* Kd;
	return diffuseFinal;
}

vec3 calculateSpecular(Material material, vec3 vs_position, vec3 vs_normal, PointLight light, vec3 vs_camerapos)
{
	vec3 vs_lightpos = vec3(viewMat * vec4(light.position, 1.0));
	vec3 lightToPosDir = normalize(vs_position - vs_lightpos);
	vec3 reflectDir = normalize(reflect(lightToPosDir, normalize(vs_normal)));
	vec3 posToViewDir = normalize(vs_camerapos - vs_position);
	float specularConstant = pow(max(dot(posToViewDir, reflectDir), 0.0), material.shininess);
	vec3 specularFinal = (material.specular * light.color)* specularConstant;
	return specularFinal;
}

vec3 calculateAttenuation(PointLight light, vec3 vs_position, vec3 attenuation)
{
	vec3 vs_lightpos = vec3(viewMat * vec4(light.position, 1.0));
	float d = distance(vs_lightpos, vs_position);
	float kc = attenuation.x;
	float kl = attenuation.y;
	float kq = attenuation.z;
	vec3 atten = vec3(1.0 / (kc + kl*d + kq*d*d));
	return atten;
}

void main(){

	vec3 vs_normal = normalize(normalCam);
	vec3 vs_position = fragPosCam;
	vec3 vs_camerapos = vec3(0);

	vec3 ambientReflection = material.ambient * ambientLightColor;
	vec3 fColor = ambientReflection;

	for(int i=0; i<1; i++)
	{
		vec3 diffuseReflection = calculateDiffuse(material, vs_position, vs_normal, pointLights[i]);
		vec3 specularReflection = calculateSpecular(material, vs_position, vs_normal, pointLights[i], vs_camerapos);
		vec3 atten = calculateAttenuation(pointLights[i], vs_position, attenuation);
		fColor += atten * (diffuseReflection + specularReflection);
	}

	gl_FragColor = vec4(fColor, 1.0);

}