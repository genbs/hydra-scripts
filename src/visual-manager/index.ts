import Keymap from '../external/keymap'

type HydraScript = () => any
type HydraOut = `o${number}`

class VisualManager {
	keymap: Keymap
	visuals: { [key: string]: [HydraScript, HydraOut, string] } = {}
	_itv: NodeJS.Timeout

	constructor() {
		this.keymap = new Keymap()
		this.keymap.install(document.body)
	}

	add(name: string, synth: HydraScript, options: { keymap?: string; out?: HydraOut } = {}) {
		if (options.keymap) {
			this.keymap.bind(options.keymap, () => this.handleKey(name))
		}

		this.visuals[name] = [synth, options.out || 'o0', name]
	}

	get(visual: string | number) {
		if (typeof visual === 'string') return this.visuals[visual]

		visual = visual % Object.keys(this.visuals).length
		return this.visuals[Object.keys(this.visuals)[visual]]
	}

	list() {
		return Object.keys(this.visuals)
	}

	run(nameOrScriptOrIndex: string | HydraScript | number) {
		let visual, out, name

		if (typeof nameOrScriptOrIndex === 'number') {
			const v = this.get(nameOrScriptOrIndex)
			visual = v[0]
			out = v[1]
			name = v[2]
		} else if (typeof nameOrScriptOrIndex === 'string') {
			visual = this.visuals[nameOrScriptOrIndex][0]
			out = this.visuals[nameOrScriptOrIndex][1]
			name = this.visuals[nameOrScriptOrIndex][2]
		} else {
			visual = nameOrScriptOrIndex
			out = 'o0'
			name = '[inline]'
		}

		if (visual) {
			//console.log(`[VisualManager]: Running visual: ${name} (${out})`)
			visual()?.out(window[out])
		}
	}

	handleKey(visualName: string) {
		clearTimeout(this._itv)
		this.run(visualName)
	}

	itv(callback: CallableFunction, interval: number) {
		clearTimeout(this._itv)
		this._itv = setTimeout(() => {
			callback()

			this.itv(callback, interval)
		}, interval)
	}
}

//@ts-ignore
window.vm = new VisualManager()
