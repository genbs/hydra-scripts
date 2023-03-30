import { shader, VERTEX_SHADER, FRAGMENT_SHADER } from './utils'

export const SHADERS_LIST = {}

function Shader(inputCh, name: string, framgmentShader = FRAGMENT_SHADER, vertexShader = VERTEX_SHADER, uniforms: []) {
	if (!SHADERS_LIST[name]) {
		SHADERS_LIST[name] = shader()
	}

	SHADERS_LIST[name].update(vertexShader, framgmentShader, uniforms)

	inputCh.init({ src: SHADERS_LIST[name].canvas })
	SHADERS_LIST[name].reload()
}

Shader.list = SHADERS_LIST

export default Shader
