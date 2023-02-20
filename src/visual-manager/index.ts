import Keymap from '../external/keymap'

type HydraScript = () => any
type HydraOut = `o${number}`

interface Visual {
	src: HydraScript
	out: HydraOut
	name: string
	duration?: number // seconds
	keymap?: string
}

interface VisualOption {
	name?: string
	keymap?: string
	out?: HydraOut
	duration?: number // seconds
}

class VisualManager {
	keymap: Keymap
	visuals: { [key: string]: Visual } = {}
	lastRun: Visual | null = null
	_itv: NodeJS.Timeout

	constructor() {
		this.keymap = new Keymap()
		this.keymap.install(document.body)
	}

	addr(synth: HydraScript, optionsOrDuration: VisualOption | number = {}) {
		return this.add(synth, optionsOrDuration, true)
	}

	findNameBySrc(src: HydraScript): string | undefined {
		return Object.keys(this.visuals).find(name => this.visuals[name].src.toString() === src.toString())
	}

	add(synth: HydraScript, optionsOrDuration: VisualOption | number = {}, runImmediately = false) {
		const options = typeof optionsOrDuration === 'number' ? { duration: optionsOrDuration } : optionsOrDuration
		const name = options.name || this.findNameBySrc(synth) || `v${Object.keys(this.visuals).length}`

		if (options.keymap) {
			this.keymap.bind(options.keymap, () => this.run(name))
		}

		this.visuals[name] = {
			src: synth,
			out: options.out || 'o0',
			name,
			duration: options.duration,
			keymap: options.keymap,
		}

		if (runImmediately) this.run(name)
	}

	get(visual: string | number): Visual {
		if (typeof visual === 'string') return this.visuals[visual]

		visual = visual % Object.keys(this.visuals).length
		return this.visuals[Object.keys(this.visuals)[visual]]
	}

	src(visual: string | number): HydraScript {
		return this.get(visual).src()
	}

	list() {
		return Object.keys(this.visuals)
	}

	hush() {
		clearTimeout(this._itv)
		this.lastRun = null

		this.visuals = {}
		this.keymap.unbindAll()
	}

	run(nameOrScriptOrIndex: string | HydraScript | number) {
		clearTimeout(this._itv)

		let visual: Visual | null = null
		if (typeof nameOrScriptOrIndex === 'number') {
			visual = this.get(nameOrScriptOrIndex)
		} else if (typeof nameOrScriptOrIndex === 'string') {
			visual = this.visuals[nameOrScriptOrIndex]
		} else {
			visual = {
				src: nameOrScriptOrIndex,
				out: 'o0',
				name: '[inline]',
			}
		}
		if (visual) {
			//console.log(`[VisualManager]: Running visual: ${name} (${out})`)
			visual.src()?.out(window[visual.out])
			this.lastRun = visual
		}
	}

	blend(nameOrScriptOrIndex: string | HydraScript | number, duration?: number) {
		let visual: Visual | null = null
		if (typeof nameOrScriptOrIndex === 'number') {
			visual = this.get(nameOrScriptOrIndex)
		} else if (typeof nameOrScriptOrIndex === 'string') {
			visual = this.visuals[nameOrScriptOrIndex]
		} else {
			visual = {
				src: nameOrScriptOrIndex,
				out: 'o0',
				name: '[inline]',
			}
		}

		duration = duration || visual?.duration / 2 || 1

		if (this.lastRun && duration > 0) {
			let startTime

			this.lastRun
				.src()
				.blend(visual.src(), () => {
					if (!startTime) {
						// @ts-ignore
						startTime = time
					}
					// @ts-ignore
					const e = time - startTime
					const b = e > duration ? 1 : e > 0 ? e / duration : 0.001

					if (b >= 1) {
						setTimeout(() => {
							visual.src()?.out(window[visual.out])
							this.lastRun = visual
						})
						return 1
					}

					return b
				})
				.out(window[visual.out])
		} else {
			visual.src()?.out(window[visual.out])
			this.lastRun = visual
		}
	}

	itv(callback: CallableFunction, interval: number = 1, out: HydraOut = 'o0') {
		clearTimeout(this._itv)
		callback()
		const visualDuration = this.lastRun?.duration || interval

		this._itv = setTimeout(() => {
			this.itv(callback, visualDuration, out)
		}, visualDuration * 1000)
	}

	stop() {
		clearTimeout(this._itv)
	}

	sequence(
		id: string | number,
		visuals: (string | number)[],
		options: { duration?: number; blend?: number; out?: HydraOut }
	) {
		let i = 0
		const duration = options.duration || 1
		const blend = options.blend || 0
		const out = options.out || 'o0'
		this.itv(
			() => {
				if (blend > 0) {
					this.blend(visuals[i], blend)
				} else {
					this.run(visuals[i])
				}
				i = (i + 1) % visuals.length
			},
			duration,
			out
		)
	}
}

//@ts-ignore
window.vm = new VisualManager()
