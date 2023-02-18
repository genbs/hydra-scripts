import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Hands, HAND_CONNECTIONS, Options } from '@mediapipe/hands'
import { init, startCamera } from './utils'

const defaultOptions: Options = {
	selfieMode: false,
	maxNumHands: 2,
	modelComplexity: 1,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5,
}

let hands, canvas, ctx, video
function load() {
	console.log('load hands')
	hands = new Hands({
		locateFile: file => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
		},
	})
	hands.onResults(results => onResults(ctx, results))
	const initResult = init()
	canvas = initResult.canvas
	ctx = initResult.ctx
	video = initResult.video

	startCamera(video, async () => {
		await hands.send({ image: video })
	})
}

export default function (inputCh, options: Options = {}) {
	if (!hands) {
		load()
	}

	hands.setOptions({ ...defaultOptions, ...options })

	inputCh.init({ src: canvas })
}

/////////

function onResults(canvasCtx, results) {
	canvasCtx.save()
	canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)
	canvasCtx.drawImage(results.image, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)
	if (results.multiHandLandmarks) {
		for (const landmarks of results.multiHandLandmarks) {
			drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
				color: '#00FF00',
				lineWidth: 40,
			})
			drawLandmarks(canvasCtx, landmarks, {
				color: '#00FF00',
				lineWidth: 5,
			})
		}
	}
	canvasCtx.restore()
}
