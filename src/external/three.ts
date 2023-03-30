import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

console.log({ THREE }, 1)
window.THREE = THREE
window.THREE.OrbitControls = OrbitControls
