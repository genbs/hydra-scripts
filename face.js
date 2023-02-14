function loadFace() {
	return new Promise(async (resolve, reject) => {
		if (!window.faceLoaded) {
			await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
			await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
			await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");

			const videoElement = document.createElement("video");
			const canvasElement = new OffscreenCanvas(width, height);
			const canvasCtx = canvasElement.getContext("2d");
			mpFaceMesh = window;
			////////////////////////////

			const config = {
				locateFile: file => {
					return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@` + `${mpFaceMesh.VERSION}/${file}`;
				},
			};

			/**
			 * Solution options.
			 */
			const solutionOptions = {
				selfieMode: true,
				enableFaceGeometry: false,
				maxNumFaces: 1,
				refineLandmarks: false,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			};

			function onResults(results) {
				// Draw the overlays.
				canvasCtx.save();
				canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
				canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
				if (results.multiFaceLandmarks) {
					for (const landmarks of results.multiFaceLandmarks) {
						drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_CONTOURS, {
							color: "#00FF00",
							lineWidth: 1,
						});

						/* drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_EYE, { color: "#FF3030" });
						drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_EYEBROW, { color: "#FF3030" });
						drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_EYE, { color: "#30FF30" });
						drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_EYEBROW, { color: "#30FF30" });
						drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_FACE_OVAL, { color: "#E0E0E0" });
						drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_LIPS, { color: "#E0E0E0" });
						if (solutionOptions.refineLandmarks) {
							drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_IRIS, { color: "#FF3030" });
							drawConnectors(canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_IRIS, { color: "#30FF30" });
						} */
					}
				}
				canvasCtx.restore();
			}

			const faceMesh = new mpFaceMesh.FaceMesh(config);

			faceMesh.setOptions(solutionOptions);
			faceMesh.onResults(onResults);

			const camera = new Camera(videoElement, {
				onFrame: async () => {
					await faceMesh.send({ image: videoElement });
				},
				width: 1280,
				height: 720,
			});
			camera.start();

			////////////////////////////

			window.faceLoaded = true;
			window.faceCanvas = canvasElement;
		}

		resolve(window.faceCanvas);
	});
}

window.loadFace = loadFace;
