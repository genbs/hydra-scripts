import { Hands, Options } from "@mediapipe/hands";
import { init, startCamera } from "./utils";

const defaultOptions: Options = {
	selfieMode: false,
	maxNumHands: 2,
	modelComplexity: 1,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5,
};

let hands, canvas, ctx, video;
function load() {
	console.log("load hands");
	hands = new Hands({
		locateFile: file => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
		},
	});
	hands.onResults(results => onResults(ctx, results));
	const initResult = init();
	canvas = initResult.canvas;
	ctx = initResult.ctx;
	video = initResult.video;

	startCamera(video, async () => {
		await hands.send({ image: video });
	});
}

export default function (inputCh, options: Options = {}) {
	if (!hands) {
		load();
	}

	hands.setOptions({ ...defaultOptions, ...options });

	inputCh.init({ src: canvas });
}

/////////

function onResults(canvasCtx, results) {
	// console.log({ results });
	const image_width = canvasCtx.canvas.width;
	const image_height = canvasCtx.canvas.height;

	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
	// canvasCtx.drawImage(results.image, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

	if (results.multiHandLandmarks) {
		let i = 0;
		for (const landmarks of results.multiHandLandmarks) {
			const bound = {
				x: image_width,
				y: image_height,
				width: 0,
				height: 0,
				cx: 0,
				cy: 0,
			};
			let x_min = image_width;
			let y_min = image_height;
			let x_max = 0;
			let y_max = 0;

			for (const point of landmarks) {
				const x_px = Math.min(Math.floor(point.x * image_width), image_width - 1);
				const y_px = Math.min(Math.floor(point.y * image_height), image_height - 1);

				bound.x = Math.min(bound.x, x_px);
				bound.y = Math.min(bound.y, y_px);
				bound.width = Math.max(bound.width, x_px);
				bound.height = Math.max(bound.height, y_px);

				x_min = Math.min(x_min, x_px);
				y_min = Math.min(y_min, y_px);
				x_max = Math.max(x_max, x_px);
				y_max = Math.max(y_max, y_px);
			}
			bound.width -= bound.x;
			bound.height -= bound.y;
			bound.cx = bound.x + bound.width / 2;
			bound.cy = bound.y + bound.height / 2;

			// canvasCtx.fillStyle = "#0f0";
			// canvasCtx.fillRect(x_min, y_min, x_max - x_min, y_max - y_min);
			// canvasCtx.strokeStyle = "#f00";
			// canvasCtx.strokeRect(bound.x, bound.y, bound.width, bound.height);

			canvasCtx.beginPath();
			const gradient = canvasCtx.createRadialGradient(
				bound.cx,
				bound.cy,
				// Math.min(bound.width, bound.height) / 8,
				0,
				bound.cx,
				bound.cy,
				// Math.min(bound.width, bound.height) / 2
				Math.max(bound.width, bound.height) / 2
			);
			gradient.addColorStop(0, "rgba(255,255,255,1)");
			gradient.addColorStop(1, "rgba(0,0,0,1)");
			canvasCtx.fillStyle = gradient;
			canvasCtx.ellipse(bound.cx, bound.cy, bound.width / 2, bound.height / 2, 0, 0, 2 * Math.PI);
			canvasCtx.fill();
			canvasCtx.closePath();
		}
	}
	canvasCtx.restore();
}
