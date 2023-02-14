function loadSelfie() {
	return new Promise(async (resolve, reject) => {
		if (!window.selfieLoaded) {
			await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
			await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
			await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js");

			const videoElement = document.createElement("video");
			const canvasElement = new OffscreenCanvas(width, height);
			const canvasCtx = canvasElement.getContext("2d");

			////////////////////////////

			function onResults(results) {
				canvasCtx.save();
				canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
				canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

				// Only overwrite existing pixels.
				canvasCtx.globalCompositeOperation = "source-in";
				canvasCtx.fillStyle = "#00FF00";
				canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

				// Only overwrite missing pixels.
				canvasCtx.globalCompositeOperation = "destination-atop";
				canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

				canvasCtx.restore();
			}

			const selfieSegmentation = new SelfieSegmentation({
				locateFile: file => {
					return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
				},
			});
			selfieSegmentation.setOptions({
				modelSelection: 1,
			});
			selfieSegmentation.onResults(onResults);

			const camera = new Camera(videoElement, {
				onFrame: async () => {
					await selfieSegmentation.send({ image: videoElement });
				},
				width: window.innerWidth,
				height: window.innerHeight,
			});
			camera.start();

			////////////////////////////

			window.selfieLoaded = true;
			window.selfieCanvas = canvasElement;
		}

		resolve(window.selfieCanvas);
	});
}

window.loadSelfie = loadSelfie;
