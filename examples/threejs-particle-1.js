await loadScript('http://genbs/index.js')

const canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height
const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
camera.position.z = 3
camera.far = 1000
camera.fov = 5

a.setSmooth(0.8)

const scene = new THREE.Scene()
const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
const material = new THREE.MeshNormalMaterial()

class Particle {
	constructor(geometry, material, index) {
		this.mesh = new THREE.Mesh(geometry, material)

		const radius = 8
		const u = Math.random()
		const v = Math.random()
		const theta = 2 * Math.PI * u
		const phi = Math.acos(2 * v - 1)
		const x = radius * Math.sin(phi) * Math.cos(theta)
		const y = radius * Math.sin(phi) * Math.sin(theta)
		const z = radius * Math.cos(phi)

		this.mesh.position.x = x
		this.mesh.position.y = y
		this.mesh.position.z = z

		this.phi = phi
		this.theta = theta
		this.vel = Urpflanze.random('seed', 0.05, 0.1)
	}

	update() {
		this.mesh.position.z += this.vel
		if (this.mesh.position.z > 3) {
			this.mesh.position.z = -10
		}
	}
}
const e = new Array(100).fill(0).map((v, i) => new Particle(geometry, material, i))

// e.forEach((p) => scene.add(p.mesh))

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas,
})
const controls = new THREE.OrbitControls(camera, renderer.domElement)
console.log(controls)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

////

let radius = 8
const numParticles = 100000
const particleGeometry = new THREE.BufferGeometry()
const positions = new Float32Array(numParticles * 3)
const scales = new Float32Array(numParticles)
const colors = new Float32Array(numParticles * 3)
const angles = new Float32Array(numParticles * 2)
const vel = new Float32Array(numParticles)

for (let i = 0; i < numParticles; i++) {
	// Genera una posizione casuale sulla superficie della sfera
	const u = Math.random()
	const v = Math.random()
	const theta = 2 * Math.PI * u
	const phi = Math.acos(2 * v - 1)
	const x = radius * Math.sin(phi) * Math.cos(theta)
	const y = radius * Math.sin(phi) * Math.sin(theta)
	const z = radius * Math.cos(phi) - 10
	scales[i] = Math.random() * 0.1
	vel[i] = Math.random() * 0.05
	angles[i * 2] = theta
	angles[i * 2 + 1] = phi
	positions[i * 3] = x
	positions[i * 3 + 1] = y
	positions[i * 3 + 2] = z
	// Imposta un colore casuale per ogni particella
	colors[i * 3] = Math.random()
	colors[i * 3 + 1] = Math.random()
	colors[i * 3 + 2] = Math.random()
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particleGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
const particleMaterial = new THREE.PointsMaterial({
	size: 0.1,
	vertexColors: false,
})
const particleMesh = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particleMesh)

////

update = () => {
	// 	e.forEach(p => {
	// 		p.update()
	// 	})

	for (let i = 0; i < numParticles; i++) {
		const theta = (angles[i * 2] += vel[i] * 0.5)
		const phi = (angles[i * 2 + 1] += vel[i] * 0.001)
		const x = radius * Math.sin(phi) * Math.cos(theta)
		const y = radius * Math.sin(phi) * Math.sin(theta)
		const z = radius * Math.cos(phi)
		positions[i * 3] = x
		positions[i * 3 + 1] = y
		// 		positions[i * 3 + 2] += vel[i];
		positions[i * 3 + 2] = z - 10

		//       if (positions[i * 3 + 2] > 1 || positions[i * 3 + 2] < -100) {
		// 			vel[1] *= -1
		// 		}
	}

	radius = 8
	// 	particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	particleGeometry.attributes.position.needsUpdate = true

	//    controls.rotateY( mouse.x);
	//     controls.rotateX( mouse.y );
	controls.update()
	renderer.render(scene, camera)
}

s0.init({
	src: canvas,
})
src(s0)
	// 	.add(src(o0)
	// 		.colorama(2), () => a.fft[1])
	// 	.modulateScale(noise(1, 0), .01)
	// 	.modulate(src(o0), .1)
	.out()
