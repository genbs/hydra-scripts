import { FaceMesh, FACEMESH_FACE_OVAL, Options } from '@mediapipe/face_mesh'
import { init, startCamera } from './utils'

const solutionOptions: Options = {
	selfieMode: false,
	enableFaceGeometry: false,
	maxNumFaces: 1,
	refineLandmarks: true,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.4,
}

let faceMesh, canvas, ctx, video
function load() {
	console.log('load faceMesh')
	faceMesh = new FaceMesh({
		locateFile: file => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
		},
	})
	faceMesh.onResults(results => onResults(ctx, results))

	const initResult = init()
	canvas = initResult.canvas
	ctx = initResult.ctx
	video = initResult.video

	startCamera(video, async () => {
		await faceMesh.send({ image: video })
	})
}

export default function (inputCh, options: Options = {}) {
	if (!faceMesh) {
		load()
	}
	faceMesh.setOptions({ ...solutionOptions, ...options })

	inputCh.init({ src: canvas })
}

/////////

function onResults(ctx, results) {
	// Draw the overlays.
	ctx.save()
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	ctx.drawImage(results.image, 0, 0, ctx.canvas.width, ctx.canvas.height)

	if (results.multiFaceLandmarks) {
		for (const landmarks of results.multiFaceLandmarks) {
			// drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
			// 	color: '#00FF00',
			// 	lineWidth: 1,
			// })

			drawOval(ctx, landmarks)

			/* drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: "#FF3030" });
			drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: "#FF3030" });
			drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: "#30FF30" });
			drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, { color: "#30FF30" });
			drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, { color: "#E0E0E0" });
			drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });
			if (solutionOptions.refineLandmarks) {
				drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, { color: "#FF3030" });
				drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, { color: "#30FF30" });
			} */
		}
	}
	ctx.restore()
}

function h(a) {
	var c = 0
	return function () {
		return c < a.length
			? {
					done: !1,
					value: a[c++],
			  }
			: {
					done: !0,
			  }
	}
}

function iterate(a) {
	var c = 'undefined' != typeof Symbol && Symbol.iterator && a[Symbol.iterator]
	return c
		? c.call(a)
		: {
				next: h(a),
		  }
}

function drawOval(ctx, landmarks) {
	ctx.save()
	var iterator = iterate(FACEMESH_FACE_OVAL)
	ctx.beginPath()
	ctx.moveTo(0, 0)
	let first = true
	for (var g = iterator.next(); !g.done; g = iterator.next()) {
		var k = g.value
		g = landmarks[k[0]]
		k = landmarks[k[1]]
		if (first) {
			first = false
			ctx.moveTo(g.x * ctx.canvas.width, g.y * ctx.canvas.height)
		} else {
			ctx.lineTo(k.x * ctx.canvas.width, k.y * ctx.canvas.height)
		}
	}
	ctx.closePath()
	ctx.fillStyle = '#00FF00'
	ctx.fill()
	ctx.restore()
}
