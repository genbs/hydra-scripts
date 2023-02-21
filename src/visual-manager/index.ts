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
	sequences: { [key: string]: Sequence } = {}
	lastRun: Visual | null = null

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
		const name = options.name || this.findNameBySrc(synth) || `${Object.keys(this.visuals).length}`

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
		this.lastRun = null

		this.visuals = {}
		this.keymap.unbindAll()
	}

	resolve(visual: string | HydraScript | number | Visual): Visual {
		if (typeof visual === 'number') {
			visual = this.get(visual)
		} else if (typeof visual === 'string') {
			visual = this.visuals[visual]
		} else if (typeof visual === 'function') {
			visual = {
				src: visual,
				out: 'o0',
				name: '[inline]',
			}
		}

		return visual
	}

	clearAll() {
		Object.keys(this.sequence).forEach(sequence => {
			this.sequence[sequence].itv()
		})
	}

	run(nameOrScriptOrIndex: string | HydraScript | number, out?: HydraOut, disableClear?: boolean) {
		if (disableClear === true) this.clearAll()

		let visual = this.resolve(nameOrScriptOrIndex)
		if (visual) {
			//console.log(`[VisualManager]: Running visual: ${name} (${out})`)
			VisualManager.run(visual, out || window[visual.out])
			this.lastRun = visual
		}
	}

	static run(visual: Visual, out: HydraOut) {
		visual.src()?.out(out)
	}

	blend(nameOrScriptOrIndex: string | HydraScript | number, duration?: number, out?: HydraOut, disableClear?: boolean) {
		if (disableClear === true) this.clearAll()

		let visual = this.resolve(nameOrScriptOrIndex)
		duration = duration || visual.duration / 2 || 0.3

		if (this.lastRun && duration > 0) {
			VisualManager.blend(this.lastRun, visual, duration, out || window[visual.out], () => {
				this.lastRun = visual
			})
		}
	}

	static blend(vSrc: Visual, vDest: Visual, duration: number, out: HydraOut, onEnd?: CallableFunction) {
		let startTime

		vSrc
			.src()
			.blend(vDest.src(), () => {
				if (!startTime) {
					startTime = window.time
				}
				const e = window.time - startTime
				const b = e >= duration ? 1 : e > 0 ? e / duration : 0.001

				if (b >= 1) {
					vDest.src()?.out(out)
					onEnd && onEnd()
					return 1
				}

				return b
			})
			.out(out)
	}

	sequence(
		id: string | number,
		visuals: (string | number)[],
		options: { duration?: number; blend?: number; out?: HydraOut }
	) {
		if (this.sequences[id]) {
			this.sequences[id].refresh(visuals, options)
			return this.sequences[id]
		}

		this.sequences[id] = new Sequence(id, visuals, options, this)
	}
}

class Sequence {
	name: string
	visuals: (string | number)[]
	out?: HydraOut
	blend?: number
	duration?: number
	itv: number
	current: number
	vm: VisualManager

	constructor(
		name: string | number,
		visuals: (string | number)[],
		options: { duration?: number; blend?: number; out?: HydraOut },
		vm: VisualManager
	) {
		this.name = name + ''
		this.visuals = visuals
		this.out = options?.out
		this.blend = options?.blend
		this.duration = options?.duration
		this.itv = 0
		this.current = -1
		this.vm = vm
	}

	refresh(visuals: (string | number)[], options: { duration?: number; blend?: number; out?: HydraOut }) {
		this.visuals = visuals
		this.out = options?.out
		this.blend = options?.blend
		this.duration = options?.duration

		if (this.itv) {
			this.stop()
			this.start()
		}
	}

	start() {
		if (this.itv > 0) {
			return
		}

		const loop = () => {
			const duration = this.next()

			this.itv = window.setTimeout(loop, duration * 1000)
		}

		loop()
	}

	stop() {
		window.clearTimeout(this.itv)
		this.itv = 0
	}

	next() {
		const current = this.vm.get(this.visuals[this.current])
		const nextIndex = (this.current + 1) % this.visuals.length
		const next = this.vm.get(this.visuals[nextIndex])
		const duration = this.duration || next.duration

		if (current && this.blend) {
			VisualManager.blend(current, next, this.blend > duration ? duration - 0.03 : this.blend, this.out || window.o0)
		} else {
			VisualManager.run(next, this.out || window.o0)
		}

		this.current = (this.current + 1) % this.visuals.length

		return duration
	}
}

//@ts-ignore
window.vm = new VisualManager()
