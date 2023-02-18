import * as Urpflanze from '@urpflanze/js'
import { height, width } from './global'

const instances = new Map<string, [Urpflanze.Scene, Urpflanze.DrawerCanvas]>()
interface Options {
	noBg?: boolean
}
function createInstance(id: string, callback: (scene: Urpflanze.Scene) => OffscreenCanvas, options: Options = {}) {
	const defaultOptions: Options = {
		noBg: true,
	}

	options = { ...defaultOptions, ...options }

	if (!instances.has(id)) {
		const canvas = new OffscreenCanvas(width(), height())
		const scene = new Urpflanze.Scene({
			width: width(),
			height: height(),
			background: options.noBg ? null : '#000',
		})
		const drawer = new Urpflanze.DrawerCanvas(scene, canvas, undefined, 1000000000000000000, 25, 'async')
		drawer.startAnimation()
		instances.set(id, [scene, drawer])
	}

	const instance = instances.get(id)
	instance[0].removeChildren()

	callback(instance[0])

	return instance[1].getCanvas()
}

// @ts-ignore
window.Urpflanze = createInstance

Object.keys(Urpflanze).forEach(key => {
	// @ts-ignore
	window.Urpflanze[key] = Urpflanze[key]
})

// @ts-ignore
window.U = window.Urpflanze

window.addEventListener('resize', () => {
	console.log('resize')
	instances.forEach(([scene, drawer]) => {
		console.log('resize', width(), height())
		scene.resize(width(), height())
		drawer.resize(width(), height())
	})
})
