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

interface Sequence {
	name?: string
	visuals: Visual[]
	blend?: number
	out?: HydraOut
	duration?: number // seconds
	itv: CallableFunction
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
			visual.src()?.out(out || window[visual.out])
			this.lastRun = visual
		}
	}

	blend(nameOrScriptOrIndex: string | HydraScript | number, duration?: number, out?: HydraOut, disableClear?: boolean) {
		if (disableClear === true) this.clearAll()

		let visual = this.resolve(nameOrScriptOrIndex)
		duration = duration || visual.duration / 2 || 0.3

		if (this.lastRun && duration > 0) {
			let startTime

			this.lastRun
				.src()
				.blend(visual.src(), () => {
					if (!startTime) {
						startTime = window.time
					}
					const e = window.time - startTime
					const b = e >= duration ? 1 : e > 0 ? e / duration : 0.001

					if (b >= 1) {
						//setTimeout(() => {
						//visual.src()?.out(out || window[visual.out])
						this.lastRun = visual
						//})
						return 1
					}

					return b
				})
				.out(out || window[visual.out])
		} else {
			visual.src()?.out(out || window[visual.out])
			this.lastRun = visual
		}
	}

	sequence(
		id: string | number,
		visuals: (string | number)[],
		options: { duration?: number; blend?: number; out?: HydraOut }
	) {
		if (this.sequences[id]) {
			this.sequences[id].itv()
		}

		this.sequences[id] = {
			name: `seq_${id}`,
			visuals: visuals.map((v, i) => this.get(v)),
			out: options?.out,
			blend: options?.blend,
			duration: options?.duration,
			itv: null,
		} as Sequence

		const seq = this.sequences[id]

		let i = 0
		let itv
		const _itv = () => {
			const v = seq.visuals[i]
			if (seq.blend) {
				this.blend(v.name, seq.blend, seq.out, true)
			} else {
				this.run(v.name, seq.out, true)
			}
			i = (i + 1) % seq.visuals.length
			itv = setTimeout(_itv, (seq.duration || v.duration) * 1000)
		}

		seq.itv = () => {
			clearTimeout(itv)
		}

		_itv()
	}
}

//@ts-ignore
window.vm = new VisualManager()
