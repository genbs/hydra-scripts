import { Camera } from '@mediapipe/camera_utils'
import { width, height } from '../global'

export function init() {
	const canvas = new OffscreenCanvas(width(), height())
	const ctx = canvas.getContext('2d')
	const video = document.createElement('video')

	return { canvas, ctx, video }
}

export function startCamera(video, onFrame) {
	const camera = new Camera(video, {
		onFrame,
		width: width(),
		height: height(),
	})

	camera.start()

	return camera
}
