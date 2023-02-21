import * as Urpflanze from '@urpflanze/js'

const instances = new Map<string, [Urpflanze.Scene, Urpflanze.DrawerCanvas]>()
interface Options {
	bg?: string | null
}
function createInstance(id: string, callback: (scene: Urpflanze.Scene) => OffscreenCanvas, options: Options = {}) {
	const defaultOptions: Options = {
		bg: null,
	}

	options = { ...defaultOptions, ...options }
	console.log(options)
	if (!instances.has(id)) {
		const canvas = new OffscreenCanvas(window.width, window.height)
		const scene = new Urpflanze.Scene({
			width: window.width,
			height: window.height,
			background: options.bg,
		})
		const drawer = new Urpflanze.DrawerCanvas(scene, canvas, undefined, 1000000000000000000, 25, 'async')
		drawer.startAnimation()
		instances.set(id, [scene, drawer])
	} else {
		const scene = instances.get(id)[0]
		scene.background = options.bg
	}

	const instance = instances.get(id)
	instance[0].removeChildren()

	callback(instance[0])

	return instance[1].getCanvas()
}

// @ts-ignore
window.Urpflanze = createInstance
// @ts-ignore
window.Urpflanze.o = t => t.repetition.offset

Object.keys(Urpflanze).forEach(key => {
	// @ts-ignore
	window.Urpflanze[key] = Urpflanze[key]
})

// @ts-ignore
window.U = window.Urpflanze

window.addEventListener('resize', () => {
	console.log('resize')
	instances.forEach(([scene, drawer]) => {
		console.log('resize', window.width, window.height)
		scene.resize(window.width, window.height)
		drawer.resize(window.width, window.height)
	})
})
