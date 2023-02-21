import { Camera } from '@mediapipe/camera_utils'

export function init() {
	const canvas = new OffscreenCanvas(window.width, window.height)
	const ctx = canvas.getContext('2d')
	const video = document.createElement('video')

	return { canvas, ctx, video }
}

export function startCamera(video, onFrame) {
	const camera = new Camera(video, {
		onFrame,
		width: window.width,
		height: window.height,
	})

	camera.start()

	return camera
}
