window.setFunction({
	name: 'kale',
	type: 'coord',
	inputs: [
		{
			type: 'float',
			name: 'nSides',
			default: 4,
		},
		{
			type: 'float',
			name: 'k',
			default: 0.0,
		},
	],
	glsl: `   vec2 st = _st;
     st -= 0.5;
     float r = length(st) - k;
     float a = atan(st.y, st.x);
     float pi = 2.*3.1416;
     a = mod(a,pi/nSides);
     a = abs(a-pi/nSides/2.);
     return r*vec2(cos(a), sin(a));`,
})

// @ts-ignore
window.ratio = () => 1 / (window.width / window.height)
