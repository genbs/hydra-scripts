import { height, width } from '../global'
import * as twgl from 'twgl.js'

export const VERTEX_SHADER = `
    attribute vec3 position;

    void main() {
        gl_Position = vec4(position, 1);
    }
`

export const FRAGMENT_SHADER = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        gl_FragColor = vec4(uv.x, 1.0 - uv.y, 1.0, 1.0);
    }
`

export function createGl() {
	const canvas = new OffscreenCanvas(width(), height())
	const gl = canvas.getContext('webgl2', {
		alpha: false,
		antialias: false,
		depth: false,
		failIfMajorPerformanceCaveat: true,
		powerPreference: 'high-performance',
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		stencil: false,
	}) as WebGLRenderingContext

	const arrays = {
		position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
	}

	const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

	return { gl, canvas, bufferInfo }
}

export function shader() {
	let program, rid
	const { gl, bufferInfo, canvas } = createGl()

	return {
		bufferInfo,
		gl,
		canvas,
		update: (vertex, fragment) => {
			program = twgl.createProgramInfo(gl, [vertex, fragment], undefined, e => {
				console.error('Shader error', e)
			})
		},
		reload: () => {
			rid && rid()

			if (program) {
				rid = render(gl, program, bufferInfo)
			}
		},
	}
}

export function render(gl, programInfo, bufferInfo) {
	let rid

	gl.useProgram(programInfo.program)
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

	function _render(time) {
		rid = requestAnimationFrame(_render)

		//twgl.resizeCanvasToDisplaySize(gl.canvas)
		//gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
		gl.viewport(0, 0, width, height)

		const uniforms = {
			time: time * 0.001,
			resolution: [width, height],
			mouse: [mousex, mousey, mousez],
		}

		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, bufferInfo)
	}

	rid = requestAnimationFrame(_render)

	return () => {
		rid && cancelAnimationFrame(rid)
	}
}

let mousex = 0,
	mousey = 0,
	mousez = 0

document.body.addEventListener('mousemove', e => {
	mousex = e.clientX / width()
	mousey = e.clientY / height()
})
document.body.addEventListener('mousedown', e => {
	mousez = 1
})
document.body.addEventListener('mouseup', e => {
	mousez = 0
})