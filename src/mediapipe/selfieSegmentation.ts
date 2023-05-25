import { Options, SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { init, startCamera } from "./utils";

const defaultOptions: Options = {
	modelSelection: 1,
};

let selfieSegmentation: SelfieSegmentation | null, canvas, ctx, video;

function load() {
	console.log("load selfieSegmentation");
	selfieSegmentation = new SelfieSegmentation({
		locateFile: file => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
		},
	});
	selfieSegmentation.setOptions({
		modelSelection: 0,
	});
	selfieSegmentation.onResults(results => onResults(ctx, results));

	const initResult = init();
	canvas = initResult.canvas;
	ctx = initResult.ctx;
	video = initResult.video;

	startCamera(video, async () => {
		await selfieSegmentation.send({ image: video });
	});
}

export default function (inputCh, options: Options = {}) {
	if (!selfieSegmentation) {
		load();
	}

	selfieSegmentation.setOptions({ ...defaultOptions, ...options });

	inputCh.init({ src: canvas });
}

/////////

function onResults(canvasCtx, results) {
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
	canvasCtx.fillStyle = "#FFFFFF";
	canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

	// // Only overwrite existing pixels.
	// canvasCtx.globalCompositeOperation = 'source-in'
	// canvasCtx.fillStyle = '#00FF00'
	// canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)

	// // Only overwrite missing pixels.
	// canvasCtx.globalCompositeOperation = 'destination-atop'
	// canvasCtx.drawImage(results.image, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)

	canvasCtx.restore();
}
