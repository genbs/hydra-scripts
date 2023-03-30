import type * as THREE from 'three'

declare global {
	interface Window {
		width: number
		height: number
		time: number

		o0: any

		setFunction: any

		THREE: typeof THREE
	}
}

export {}
