function Keymap(bindings) {
	this.map = {} // Define the key identifier->handler map
	if (bindings) {
		// Copy initial bindings into it
		for (name in bindings) this.bind(name, bindings[name])
	}
}

// Bind the specified key identifier to the specified handler function
Keymap.prototype.bind = function (key, func) {
	this.map[Keymap.normalize(key)] = func
}

// Delete the binding for the specified key identifier
Keymap.prototype.unbind = function (key) {
	delete this.map[Keymap.normalize(key)]
}

// Install this Keymap on the specified HTML element
Keymap.prototype.install = function (element) {
	// This is the event-handler function
	var keymap = this
	function handler(event) {
		return keymap.dispatch(event, element)
	}

	// Now install it
	if (element.addEventListener) element.addEventListener('keydown', handler, false)
	else if (element.attachEvent) element.attachEvent('onkeydown', handler)
}

// This method dispatches key events based on the keymap bindings.
Keymap.prototype.dispatch = function (event, element) {
	// We start off with no modifiers and no key name
	var modifiers = ''
	var keyname = null

	// Build the modifier string in canonical lowercase alphabetical order.
	if (event.altKey) modifiers += 'alt_'
	if (event.ctrlKey) modifiers += 'ctrl_'
	if (event.metaKey) modifiers += 'meta_'
	if (event.shiftKey) modifiers += 'shift_'

	// The keyname is easy if the DOM Level 3 key property is implemented:
	if (event.key) keyname = event.key
	// Use the keyIdentifier on Safari and Chrome for function key names
	else if (event.keyIdentifier && event.keyIdentifier.substring(0, 2) !== 'U+') keyname = event.keyIdentifier
	// Otherwise, use the keyCode property and the code-to-name map below
	else keyname = Keymap.keyCodeToKeyName[event.keyCode]

	// If we couldn't figure out a key name, just return and ignore the event.
	if (!keyname) return

	// The canonical key id is modifiers plus lowercase key name
	var keyid = modifiers + keyname.toLowerCase()
	console.log({ keyname, keyid })

	// Now see if the key identifier is bound to anything
	var handler = this.map[keyid]

	if (handler) {
		// If there is a handler for this key, handle it
		// Invoke the handler function
		var retval = handler.call(element, event, keyid)

		// If the handler returns false, cancel default and prevent bubbling
		if (retval === false) {
			if (event.stopPropagation) event.stopPropagation() // DOM model
			else event.cancelBubble = true // IE model
			if (event.preventDefault) event.preventDefault() // DOM
			else event.returnValue = false // IE
		}

		// Return whatever the handler returned
		return retval
	}
}

// Utility function to convert a key identifier to canonical form.
// On non-Macintosh hardware, we could map "meta" to "ctrl" here, so that
// Meta-C would be "Command-C" on the Mac and "Ctrl-C" everywhere else.
Keymap.normalize = function (keyid) {
	keyid = keyid.toLowerCase() // Everything lowercase
	var words = keyid.split(/\s+|[\-+_]/) // Split modifiers from name
	var keyname = words.pop() // keyname is the last word
	keyname = Keymap.aliases[keyname] || keyname // Is it an alias?
	words.sort() // Sort remaining modifiers
	words.push(keyname) // Add the normalized name back
	return words.join('_') // Concatenate them all
}

Keymap.aliases = {
	// Map common key aliases to their "official"
	escape: 'esc', // key names used by DOM Level 3 and by
	delete: 'del', // the key code to key name map below.
	return: 'enter', // Both keys and values must be lowercase here.
	ctrl: 'control',
	space: 'spacebar',
	ins: 'insert',
}

// The legacy keyCode property of the keydown event object is not standardized
// But the following values seem to work for most browsers and OSes.
Keymap.keyCodeToKeyName = {
	// Keys with words or arrows on them
	8: 'Backspace',
	9: 'Tab',
	13: 'Enter',
	16: 'Shift',
	17: 'Control',
	18: 'Alt',
	19: 'Pause',
	20: 'CapsLock',
	27: 'Esc',
	32: 'Spacebar',
	33: 'PageUp',
	34: 'PageDown',
	35: 'End',
	36: 'Home',
	37: 'Left',
	38: 'Up',
	39: 'Right',
	40: 'Down',
	45: 'Insert',
	46: 'Del',

	// Number keys on main keyboard (not keypad)
	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',

	// Letter keys. Note that we don't distinguish upper and lower case
	65: 'A',
	66: 'B',
	67: 'C',
	68: 'D',
	69: 'E',
	70: 'F',
	71: 'G',
	72: 'H',
	73: 'I',
	74: 'J',
	75: 'K',
	76: 'L',
	77: 'M',
	78: 'N',
	79: 'O',
	80: 'P',
	81: 'Q',
	82: 'R',
	83: 'S',
	84: 'T',
	85: 'U',
	86: 'V',
	87: 'W',
	88: 'X',
	89: 'Y',
	90: 'Z',

	// Keypad numbers and punctuation keys. (Opera does not support these.)
	96: '0',
	97: '1',
	98: '2',
	99: '3',
	100: '4',
	101: '5',
	102: '6',
	103: '7',
	104: '8',
	105: '9',
	106: 'Multiply',
	107: 'Add',
	109: 'Subtract',
	110: 'Decimal',
	111: 'Divide',

	// Function keys
	112: 'F1',
	113: 'F2',
	114: 'F3',
	115: 'F4',
	116: 'F5',
	117: 'F6',
	118: 'F7',
	119: 'F8',
	120: 'F9',
	121: 'F10',
	122: 'F11',
	123: 'F12',
	124: 'F13',
	125: 'F14',
	126: 'F15',
	127: 'F16',
	128: 'F17',
	129: 'F18',
	130: 'F19',
	131: 'F20',
	132: 'F21',
	133: 'F22',
	134: 'F23',
	135: 'F24',

	// Punctuation keys that don't require holding down Shift
	// Hyphen is nonportable: FF returns same code as Subtract
	59: ';',
	61: '=',
	186: ';',
	187: '=', // Firefox and Opera return 59,61
	188: ',',
	190: '.',
	191: '/',
	192: '`',
	219: '[',
	220: '\\',
	221: ']',
	222: "'",
}

export default Keymap
